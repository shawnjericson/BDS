import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CommissionSplitResult {
  booking_id: number;
  base_commission: number;
  provider: { user_id: number | null; amount: number };
  seller: { user_id: number; amount: number };
  referrer: { user_id: number; amount: number } | null;
  manager: { user_id: number; amount: number } | null;
  system_residual: number;
}

/**
 * Commission Calculator Service based on commission_spec.md
 * 
 * Formula:
 * 1. C0 = price * commission_pct * qty (base commission)
 * 2. C_provider = C0 * provider_pct (provider share)
 * 3. C_remain = C0 - C_provider (remaining to split by rank)
 * 4. Split C_remain by seller's rank percentages
 */
@Injectable()
export class CommissionCalculatorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate commission split based on commission_spec.md formula
   */
  async calculateCommissionByBookingId(bookingId: number): Promise<CommissionSplitResult> {
    // Get booking with all related data
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: {
          include: {
            owner: true
          }
        },
        seller: {
          include: {
            userRanks: {
              where: { effectiveTo: null },
              include: {
                rank: {
                  include: {
                    rankShares: true
                  }
                }
              }
            }
          }
        },
        referrer: true,
        manager: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const product = booking.product;
    const seller = booking.seller;
    
    if (!product || !seller) {
      throw new Error('Invalid booking data');
    }

    // Step 1: Calculate base commission (C0)
    const price = Number(booking.price);
    const commissionPct = Number(product.commissionPct);
    const qty = 1; // Assuming qty = 1 for now
    const C0 = price * commissionPct * qty;

    // Step 2: Calculate provider commission
    // provider_pct is stored as providerDesiredPct (ratio of commission, not price)
    const providerPct = Number(product.providerDesiredPct) / commissionPct;
    const C_provider = this.roundVND(C0 * providerPct);
    const C_remain = C0 - C_provider;

    // Step 3: Get seller's rank percentages
    const sellerRank = seller.userRanks?.[0]?.rank;
    if (!sellerRank) {
      throw new Error(`Seller rank not found for user ${seller.id}`);
    }

    const hasReferrer = !!booking.referrerUserId;
    const hasManager = !!booking.managerUserId;

    // Get rank shares
    const sellerShare = sellerRank.rankShares.find(rs => rs.role === 'SELLER');
    const referrerShare = sellerRank.rankShares.find(rs => rs.role === 'REFERRER');
    const managerShare = sellerRank.rankShares.find(rs => rs.role === 'MANAGER');

    let s = Number(sellerShare?.pct || 0);
    let r = hasReferrer ? Number(referrerShare?.pct || 0) : 0;
    let m = hasManager ? Number(managerShare?.pct || 0) : 0;

    // Step 4: Normalize if sum > 1 (safety check)
    const sum = s + r + m;
    if (sum > 1) {
      s /= sum;
      r /= sum;
      m /= sum;
    }

    // Step 5: Calculate individual commissions
    const C_seller = this.roundVND(C_remain * s);
    const C_referrer = this.roundVND(C_remain * r);
    const C_manager = this.roundVND(C_remain * m);

    const allocated = C_seller + C_referrer + C_manager;
    const system_residual = this.roundVND(C_remain - allocated);

    return {
      booking_id: booking.id,
      base_commission: this.roundVND(C0),
      provider: { user_id: product.ownerUserId, amount: C_provider },
      seller: { user_id: seller.id, amount: C_seller },
      referrer: hasReferrer ? { user_id: booking.referrerUserId!, amount: C_referrer } : null,
      manager: hasManager ? { user_id: booking.managerUserId!, amount: C_manager } : null,
      system_residual,
    };
  }

  /**
   * Execute commission calculation and credit wallets
   * Only call this when booking status becomes COMPLETED
   */
  async onBookingStatusChanged(bookingId: number, newStatus: 'PENDING' | 'COMPLETED' | 'CANCELED') {
    // Update booking status
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus }
    });

    // Only process commission if completed
    if (newStatus !== 'COMPLETED') return;

    const split = await this.calculateCommissionByBookingId(bookingId);
    
    // Execute commission in transaction
    await this.prisma.$transaction(async (prisma) => {
      // Create revenue ledger entries
      const ledgerEntries: any[] = [];

      // Provider commission
      if (split.provider.amount > 0 && split.provider.user_id) {
        ledgerEntries.push({
          bookingId: split.booking_id,
          beneficiaryUserId: split.provider.user_id,
          amount: split.provider.amount,
          type: 'PROVIDER',
          description: 'Provider share'
        });
        await this.credit(prisma, split.provider.user_id, split.provider.amount, bookingId, 'provider', 'Provider share');
      }

      // Seller commission
      if (split.seller.amount > 0) {
        ledgerEntries.push({
          bookingId: split.booking_id,
          beneficiaryUserId: split.seller.user_id,
          amount: split.seller.amount,
          type: 'SELLER',
          description: 'Seller commission'
        });
        await this.credit(prisma, split.seller.user_id, split.seller.amount, bookingId, 'direct_seller', 'Seller commission');
      }

      // Referrer commission
      if (split.referrer && split.referrer.amount > 0) {
        ledgerEntries.push({
          bookingId: split.booking_id,
          beneficiaryUserId: split.referrer.user_id,
          amount: split.referrer.amount,
          type: 'REFERRER',
          description: 'Referral commission'
        });
        await this.credit(prisma, split.referrer.user_id, split.referrer.amount, bookingId, 'referral', 'Referral commission');
      }

      // Manager commission
      if (split.manager && split.manager.amount > 0) {
        ledgerEntries.push({
          bookingId: split.booking_id,
          beneficiaryUserId: split.manager.user_id,
          amount: split.manager.amount,
          type: 'MANAGER',
          description: 'Manager commission'
        });
        await this.credit(prisma, split.manager.user_id, split.manager.amount, bookingId, 'manager', 'Manager commission');
      }

      // System residual (optional)
      if (split.system_residual > 0) {
        ledgerEntries.push({
          bookingId: split.booking_id,
          beneficiaryUserId: null,
          amount: split.system_residual,
          type: 'SYSTEM',
          description: 'Residual'
        });
        // Note: System residual is not credited to any wallet
      }

      // Create revenue ledger entries
      if (ledgerEntries.length > 0) {
        await prisma.revenueLedger.createMany({
          data: ledgerEntries
        });
      }
    });

    return split;
  }

  /**
   * Credit wallet with commission amount
   */
  private async credit(prisma: any, userId: number, amount: number, bookingId: number, type: string, note: string) {
    if (amount <= 0) return;

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0
        }
      });
    }

    // Calculate new balance
    const newBalance = Number(wallet.balance) + amount;

    // Update wallet balance
    await prisma.wallet.update({
      where: { userId },
      data: { balance: newBalance }
    });

    // Create transaction record
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: `COMMISSION_${type.toUpperCase()}`,
        refId: bookingId,
        description: note,
        balanceAfter: newBalance,
        createdBy: null // System created
      }
    });
  }

  /**
   * Round to VND (no decimals)
   */
  private roundVND(amount: number): number {
    return Math.round(amount);
  }

  /**
   * Get commission preview for a potential booking
   */
  async getCommissionPreview(productId: number, price: number, sellerUserId: number, referrerUserId?: number, managerUserId?: number): Promise<CommissionSplitResult> {
    // Create a temporary booking for calculation
    const tempBooking = {
      id: 0, // Temporary ID
      productId,
      sellerUserId,
      referrerUserId: referrerUserId || null,
      managerUserId: managerUserId || null,
      price,
      status: 'PENDING'
    };

    // Get product and seller data
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { owner: true }
    });

    const seller = await this.prisma.appUser.findUnique({
      where: { id: sellerUserId },
      include: {
        userRanks: {
          where: { effectiveTo: null },
          include: {
            rank: {
              include: {
                rankShares: true
              }
            }
          }
        }
      }
    });

    if (!product || !seller) {
      throw new Error('Product or seller not found');
    }

    // Calculate using the same logic
    const commissionPct = Number(product.commissionPct);
    const C0 = price * commissionPct;

    const providerPct = Number(product.providerDesiredPct) / commissionPct;
    const C_provider = this.roundVND(C0 * providerPct);
    const C_remain = C0 - C_provider;

    const sellerRank = seller.userRanks?.[0]?.rank;
    if (!sellerRank) {
      throw new Error(`Seller rank not found for user ${seller.id}`);
    }

    const hasReferrer = !!referrerUserId;
    const hasManager = !!managerUserId;

    const sellerShare = sellerRank.rankShares.find(rs => rs.role === 'SELLER');
    const referrerShare = sellerRank.rankShares.find(rs => rs.role === 'REFERRER');
    const managerShare = sellerRank.rankShares.find(rs => rs.role === 'MANAGER');

    let s = Number(sellerShare?.pct || 0);
    let r = hasReferrer ? Number(referrerShare?.pct || 0) : 0;
    let m = hasManager ? Number(managerShare?.pct || 0) : 0;

    const sum = s + r + m;
    if (sum > 1) {
      s /= sum;
      r /= sum;
      m /= sum;
    }

    const C_seller = this.roundVND(C_remain * s);
    const C_referrer = this.roundVND(C_remain * r);
    const C_manager = this.roundVND(C_remain * m);

    const allocated = C_seller + C_referrer + C_manager;
    const system_residual = this.roundVND(C_remain - allocated);

    return {
      booking_id: 0, // Preview
      base_commission: this.roundVND(C0),
      provider: { user_id: product.ownerUserId, amount: C_provider },
      seller: { user_id: seller.id, amount: C_seller },
      referrer: hasReferrer ? { user_id: referrerUserId!, amount: C_referrer } : null,
      manager: hasManager ? { user_id: managerUserId!, amount: C_manager } : null,
      system_residual,
    };
  }
}
