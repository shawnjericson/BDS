import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto, UpdateBookingStatusDto, BookingStatus } from './dto/update-booking.dto';
import { CommissionInfoDto, UserWithRank } from './dto/commission-info.dto';
import { CommissionCalculationDto, ParticipantShare, CommissionBreakdown } from './dto/commission-calculation.dto';
import { TransactionType } from '../wallets/dto/create-wallet-transaction.dto';
import { CommissionCalculatorService } from '../commission/commission-calculator.service';
import { RevenueLedgerService } from '../revenue/revenue-ledger.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private commissionCalculatorService: CommissionCalculatorService,
    private revenueLedgerService: RevenueLedgerService,
  ) {}

  async create(createBookingDto: CreateBookingDto, userId: number) {
    const {
      productId,
      price,
      sellerUserId,
      referrerUserId,
      managerUserId,
      customerName,
      customerPhone,
      customerEmail
    } = createBookingDto;

    // Verify product exists and is approved
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        commissionPct: true,
        providerDesiredPct: true,
        status: true,
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            status: true,
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.status !== 'APPROVED') {
      throw new BadRequestException('Product must be approved to create bookings');
    }

    // Get current user info to auto-fill missing roles
    const currentUser = await this.prisma.appUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        referredBy: true,
        managerId: true,
        referrer: {
          select: { id: true, managerId: true }
        }
      }
    });

    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    // Auto-fill user roles
    const finalSellerUserId = sellerUserId || userId; // Current user is seller by default
    const finalReferrerUserId = referrerUserId || currentUser.referredBy; // User's referrer
    const finalManagerUserId = managerUserId || currentUser.managerId || currentUser.referrer?.managerId; // User's manager or referrer's manager

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        productId,
        price,
        sellerUserId: finalSellerUserId,
        referrerUserId: finalReferrerUserId,
        managerUserId: finalManagerUserId,
        customerName,
        customerPhone,
        customerEmail,
        status: 'PENDING',
      },
      include: {
        product: {
          include: { owner: true },
        },
        seller: true,
        referrer: true,
        manager: true,
      },
    });

    // Process revenue for new booking
    try {
      await this.revenueLedgerService.processBookingRevenue(booking.id);
      console.log(`✅ Revenue processed for new booking ${booking.id}`);
    } catch (error) {
      console.error(`❌ Error processing revenue for new booking ${booking.id}:`, error);
      // Don't throw error for new booking, just log it
    }

    return booking;
  }

  async findAll(status?: BookingStatus, userId?: number) {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.OR = [
        { sellerUserId: userId },
        { referrerUserId: userId },
        { managerUserId: userId },
        { product: { ownerUserId: userId } },
      ];
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        product: {
          include: { owner: true },
        },
        seller: true,
        referrer: true,
        manager: true,
        revenueLedger: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        product: {
          include: { owner: true },
        },
        seller: true,
        referrer: true,
        manager: true,
        revenueLedger: {
          include: {
            beneficiaryUser: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto, userId: number, isAdmin = false) {
    const booking = await this.findOne(id);

    // Check if user has permission to update
    if (!isAdmin && !this.canUserAccessBooking(booking, userId)) {
      throw new ForbiddenException('You do not have permission to update this booking');
    }

    // Only allow updates if booking is still pending
    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Can only update pending bookings');
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        product: {
          include: { owner: true },
        },
        seller: true,
        referrer: true,
        manager: true,
      },
    });
  }

  async updateStatus(id: number, updateStatusDto: UpdateBookingStatusDto) {
    const booking = await this.findOne(id);

    if (booking.status === updateStatusDto.status) {
      throw new BadRequestException(`Booking is already ${updateStatusDto.status}`);
    }

    // Handle status transitions
    if (updateStatusDto.status === BookingStatus.COMPLETED) {
      return this.completeBooking(id);
    } else if (updateStatusDto.status === BookingStatus.CANCELLED) {
      return this.cancelBooking(id);
    }

    // For other status changes, update and process revenue
    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        closedAt: updateStatusDto.status !== BookingStatus.PENDING ? new Date() : null,
      },
      include: {
        product: {
          include: { owner: true },
        },
        seller: true,
        referrer: true,
        manager: true,
        revenueLedger: {
          include: {
            beneficiaryUser: true,
          },
        },
      },
    });

    // Process revenue for ANY status change
    try {
      await this.revenueLedgerService.processBookingRevenue(id);
      console.log(`✅ Revenue processed for booking ${id} status change to ${updateStatusDto.status}`);
    } catch (error) {
      console.error(`❌ Error processing revenue for booking ${id}:`, error);
      // Don't throw error, just log it
    }

    return updatedBooking;
  }

  private async completeBooking(id: number) {
    const booking = await this.findOne(id);

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Booking is already completed');
    }

    // Start transaction for revenue distribution
    return this.prisma.$transaction(async (prisma) => {
      // Update booking status
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.COMPLETED,
          closedAt: new Date(),
        },
        include: {
          product: {
            include: { owner: true },
          },
          seller: true,
          referrer: true,
          manager: true,
        },
      });

      // Process revenue using RevenueLedgerService
      try {
        await this.revenueLedgerService.processBookingRevenue(updatedBooking.id);
        console.log(`✅ Revenue processed for completed booking ${updatedBooking.id}`);
      } catch (error) {
        console.error(`❌ Error processing revenue for booking ${updatedBooking.id}:`, error);
        throw error; // Throw error in transaction to rollback
      }

      // Return booking with revenue ledger
      return prisma.booking.findUnique({
        where: { id },
        include: {
          product: {
            include: { owner: true },
          },
          seller: true,
          referrer: true,
          manager: true,
          revenueLedger: {
            include: {
              beneficiaryUser: true,
            },
          },
        },
      });
    });
  }

  private async cancelBooking(id: number) {
    const booking = await this.findOne(id);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    // If booking was completed, we need to revert revenue
    if (booking.status === BookingStatus.COMPLETED) {
      return this.prisma.$transaction(async (prisma) => {
        // Update booking status first
        const updatedBooking = await prisma.booking.update({
          where: { id },
          data: {
            status: BookingStatus.CANCELLED,
            closedAt: new Date(),
          },
          include: {
            product: {
              include: { owner: true },
            },
            seller: true,
            referrer: true,
            manager: true,
            revenueLedger: {
              include: {
                beneficiaryUser: true,
              },
            },
          },
        });

        // Process revenue for canceled status (will recalculate/clear as needed)
        try {
          await this.revenueLedgerService.processBookingRevenue(id);
          console.log(`✅ Revenue processed for canceled booking ${id}`);
        } catch (error) {
          console.error(`❌ Error processing revenue for canceled booking ${id}:`, error);
          throw error; // Throw error in transaction to rollback
        }

        return updatedBooking;
      });
    }

    // Simple cancellation for pending bookings
    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        closedAt: new Date(),
      },
      include: {
        product: {
          include: { owner: true },
        },
        seller: true,
        referrer: true,
        manager: true,
      },
    });
  }

  private async distributeRevenue(prisma: any, booking: any) {
    const { price, product, sellerUserId, referrerUserId, managerUserId } = booking;
    const commissionPool = Number(price) * Number(product.commissionPct);
    const providerShare = commissionPool * (Number(product.providerDesiredPct) / Number(product.commissionPct));
    const remainingPool = commissionPool - providerShare;

    // Get current ranks for users
    const [sellerRank, referrerRank, managerRank] = await Promise.all([
      sellerUserId ? this.getCurrentUserRank(prisma, sellerUserId) : null,
      referrerUserId ? this.getCurrentUserRank(prisma, referrerUserId) : null,
      managerUserId ? this.getCurrentUserRank(prisma, managerUserId) : null,
    ]);

    // Get percentage shares based on ranks
    const [sellerPct, referrerPct, managerPct] = await Promise.all([
      sellerRank ? this.getRankShare(prisma, sellerRank.rankId, 'SELLER') : 0,
      referrerRank ? this.getRankShare(prisma, referrerRank.rankId, 'REFERRER') : 0,
      managerRank ? this.getRankShare(prisma, managerRank.rankId, 'MANAGER') : 0,
    ]);

    // Calculate amounts
    const sellerAmount = remainingPool * sellerPct;
    const referrerAmount = remainingPool * referrerPct;
    const managerAmount = remainingPool * managerPct;
    const appAmount = remainingPool - (sellerAmount + referrerAmount + managerAmount);

    // Create revenue ledger entries
    const ledgerEntries: any[] = [];

    // Provider share
    ledgerEntries.push({
      bookingId: booking.id,
      role: 'PROVIDER',
      beneficiaryUserId: product.ownerUserId,
      pct: Number(product.providerDesiredPct) / Number(product.commissionPct),
      amount: providerShare,
    });

    // Seller share
    if (sellerUserId && sellerAmount > 0) {
      ledgerEntries.push({
        bookingId: booking.id,
        role: 'SELLER',
        beneficiaryUserId: sellerUserId,
        pct: sellerPct,
        amount: sellerAmount,
      });
    }

    // Referrer share
    if (referrerUserId && referrerAmount > 0) {
      ledgerEntries.push({
        bookingId: booking.id,
        role: 'REFERRER',
        beneficiaryUserId: referrerUserId,
        pct: referrerPct,
        amount: referrerAmount,
      });
    }

    // Manager share
    if (managerUserId && managerAmount > 0) {
      ledgerEntries.push({
        bookingId: booking.id,
        role: 'MANAGER',
        beneficiaryUserId: managerUserId,
        pct: managerPct,
        amount: managerAmount,
      });
    }

    // App share
    ledgerEntries.push({
      bookingId: booking.id,
      role: 'APP',
      beneficiaryUserId: null,
      pct: appAmount / commissionPool,
      amount: appAmount,
    });

    // Insert all ledger entries
    await prisma.revenueLedger.createMany({
      data: ledgerEntries,
    });

    // Create wallet transactions for positive amounts
    await this.createWalletTransactions(prisma, ledgerEntries, booking.id);
  }

  private async createWalletTransactions(prisma: any, ledgerEntries: any[], bookingId: number) {
    for (const entry of ledgerEntries) {
      if (entry.beneficiaryUserId && entry.amount > 0) {
        // Get user's wallet
        const wallet = await prisma.wallet.findUnique({
          where: { userId: entry.beneficiaryUserId },
        });

        if (wallet) {
          // Calculate new balance
          const newBalance = Number(wallet.balance) + Number(entry.amount);

          // Create wallet transaction
          await prisma.walletTransaction.create({
            data: {
              walletId: wallet.id,
              amount: Number(entry.amount),
              type: this.getTransactionType(entry.role),
              refId: bookingId,
              description: `Commission from booking #${bookingId} (${entry.role})`,
              balanceAfter: newBalance,
            },
          });

          // Update wallet balance
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: newBalance },
          });
        }
      }
    }
  }

  private getTransactionType(role: string): string {
    switch (role) {
      case 'PROVIDER':
      case 'SELLER':
        return TransactionType.COMMISSION_DIRECT;
      case 'REFERRER':
      case 'MANAGER':
        return TransactionType.COMMISSION_REFERRAL;
      default:
        return TransactionType.COMMISSION_DIRECT;
    }
  }

  private async revertRevenue(prisma: any, bookingId: number) {
    // Get existing positive revenue entries
    const existingEntries = await prisma.revenueLedger.findMany({
      where: {
        bookingId,
        amount: { gt: 0 },
      },
    });

    // Create negative entries to revert
    const revertEntries = existingEntries.map((entry: any) => ({
      bookingId: entry.bookingId,
      role: entry.role,
      beneficiaryUserId: entry.beneficiaryUserId,
      pct: entry.pct,
      amount: -Number(entry.amount),
    }));

    if (revertEntries.length > 0) {
      await prisma.revenueLedger.createMany({
        data: revertEntries,
      });

      // Create negative wallet transactions to revert
      await this.revertWalletTransactions(prisma, revertEntries, bookingId);
    }
  }

  private async revertWalletTransactions(prisma: any, revertEntries: any[], bookingId: number) {
    for (const entry of revertEntries) {
      if (entry.beneficiaryUserId && entry.amount < 0) {
        // Get user's wallet
        const wallet = await prisma.wallet.findUnique({
          where: { userId: entry.beneficiaryUserId },
        });

        if (wallet) {
          // Calculate new balance (entry.amount is already negative)
          const newBalance = Number(wallet.balance) + Number(entry.amount);

          // Create negative wallet transaction
          await prisma.walletTransaction.create({
            data: {
              walletId: wallet.id,
              amount: Number(entry.amount),
              type: this.getTransactionType(entry.role),
              refId: bookingId,
              description: `Reversal for booking #${bookingId} cancellation (${entry.role})`,
              balanceAfter: newBalance,
            },
          });

          // Update wallet balance
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: newBalance },
          });
        }
      }
    }
  }

  private async getCurrentUserRank(prisma: any, userId: number) {
    return prisma.userRank.findFirst({
      where: {
        userId,
        effectiveTo: null, // Current rank
      },
      orderBy: {
        effectiveFrom: 'desc',
      },
    });
  }

  private async getRankShare(prisma: any, rankId: number, role: string): Promise<number> {
    const rankShare = await prisma.rankShare.findFirst({
      where: {
        rankId,
        role,
      },
    });

    return rankShare ? Number(rankShare.pct) : 0;
  }

  private canUserAccessBooking(booking: any, userId: number): boolean {
    return (
      booking.sellerUserId === userId ||
      booking.referrerUserId === userId ||
      booking.managerUserId === userId ||
      booking.product?.ownerUserId === userId
    );
  }

  async getMyBookings(userId: number) {
    return this.findAll(undefined, userId);
  }

  async remove(id: number, userId: number, isAdmin = false) {
    const booking = await this.findOne(id);

    // Check permission
    if (!isAdmin && !this.canUserAccessBooking(booking, userId)) {
      throw new ForbiddenException('You do not have permission to delete this booking');
    }

    // Only allow deletion of pending bookings
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only delete pending bookings');
    }

    return this.prisma.booking.delete({
      where: { id },
    });
  }

  /**
   * Distribute revenue using the new commission calculator service
   * Based on commission_spec.md formula
   */
  private async distributeRevenueWithCommissionCalculator(bookingId: number) {
    try {
      // Use commission calculator to execute commission distribution
      const commissionResult = await this.commissionCalculatorService.onBookingStatusChanged(
        bookingId,
        'COMPLETED'
      );

      console.log('Commission distributed successfully:', {
        bookingId,
        baseCommission: commissionResult?.base_commission,
        provider: commissionResult?.provider,
        seller: commissionResult?.seller,
        referrer: commissionResult?.referrer,
        manager: commissionResult?.manager,
        systemResidual: commissionResult?.system_residual
      });

      return commissionResult;
    } catch (error) {
      console.error('Error distributing commission:', error);
      throw new BadRequestException(`Failed to distribute commission: ${error.message}`);
    }
  }

  async getCommissionInfo(bookingId: number): Promise<CommissionInfoDto> {
    // Get booking with all related data
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: {
          include: {
            owner: true, // This is the provider
          },
        },
        seller: true,
        referrer: true,
        manager: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Get user rank information for each participant
    const seller = booking.seller ? await this.getUserWithRank(booking.seller.id, 'SELLER') : undefined;
    const referrer = booking.referrer ? await this.getUserWithRank(booking.referrer.id, 'REFERRER') : undefined;
    const manager = booking.manager ? await this.getUserWithRank(booking.manager.id, 'MANAGER') : undefined;
    // Provider gets fixed commission from providerDesiredPct, no rank needed
    const provider = booking.product?.owner ? await this.getUserBasicInfo(booking.product.owner.id) : undefined;

    return {
      bookingId: booking.id,
      productId: booking.productId!,
      productName: booking.product?.name,
      price: Number(booking.price),

      // Product commission info
      commissionPct: Number(booking.product!.commissionPct),
      providerDesiredPct: Number(booking.product!.providerDesiredPct),

      // User IDs
      sellerUserId: booking.sellerUserId || undefined,
      referrerUserId: booking.referrerUserId || undefined,
      managerUserId: booking.managerUserId || undefined,
      providerUserId: booking.product?.ownerUserId || undefined,

      // User details with ranks
      seller,
      referrer,
      manager,
      provider,
    };
  }

  private async getUserWithRank(userId: number, roleType: string): Promise<UserWithRank> {
    // Get user basic info
    const user = await this.prisma.appUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get current rank for this user
    const currentUserRank = await this.prisma.userRank.findFirst({
      where: {
        userId: userId,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
      },
      include: {
        rank: true,
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    // Get rank shares for this rank and role
    let rankShares: any[] = [];
    if (currentUserRank) {
      rankShares = await this.prisma.rankShare.findMany({
        where: {
          rankId: currentUserRank.rankId,
          role: roleType, // e.g., 'SELLER', 'REFERRER', 'MANAGER'
        },
      });
    }

    return {
      id: user.id,
      fullName: user.fullName || '',
      email: user.email,
      role: user.role,

      currentRank: currentUserRank ? {
        id: currentUserRank.rank.id,
        name: currentUserRank.rank.name,
        effectiveFrom: currentUserRank.effectiveFrom,
        effectiveTo: currentUserRank.effectiveTo || undefined,
      } : undefined,

      rankShares: rankShares.map(share => ({
        id: share.id,
        role: share.role,
        pct: Number(share.pct),
      })),
    };
  }

  private async getUserBasicInfo(userId: number): Promise<UserWithRank> {
    // Get user basic info only (no rank needed for provider)
    const user = await this.prisma.appUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return {
      id: user.id,
      fullName: user.fullName || '',
      email: user.email,
      role: user.role,
      // Provider doesn't need rank info - gets fixed commission from providerDesiredPct
      currentRank: undefined,
      rankShares: [],
    };
  }

  async calculateCommission(bookingId: number): Promise<CommissionCalculationDto> {
    // Get commission info first
    const commissionInfo = await this.getCommissionInfo(bookingId);

    // Step 1: Calculate total commission
    const totalCommission = commissionInfo.price * commissionInfo.commissionPct;

    // Step 2: Provider gets fixed percentage of PRODUCT PRICE (not commission)
    const providerAmount = commissionInfo.price * commissionInfo.providerDesiredPct;

    // Step 3: Remaining commission for rank-based distribution (after provider takes their share)
    const remainingCommission = totalCommission - providerAmount;

    // Step 4: Calculate rank-based shares
    const participants: ParticipantShare[] = [];
    let totalRankBasedAmount = 0;

    // Add provider (fixed rate)
    if (commissionInfo.provider) {
      participants.push({
        userId: commissionInfo.provider.id,
        fullName: commissionInfo.provider.fullName,
        role: 'provider',
        calculatedAmount: providerAmount,
        isFixedRate: true,
        fixedRatePct: commissionInfo.providerDesiredPct,
      });
    }

    // Add seller (rank-based)
    if (commissionInfo.seller?.rankShares && commissionInfo.seller.rankShares.length > 0) {
      const sellerShare = commissionInfo.seller.rankShares.find(s => s.role === 'SELLER');
      if (sellerShare && commissionInfo.seller) {
        const amount = remainingCommission * sellerShare.pct;
        totalRankBasedAmount += amount;
        participants.push({
          userId: commissionInfo.seller.id,
          fullName: commissionInfo.seller.fullName,
          role: 'seller',
          userRank: commissionInfo.seller.currentRank,
          rankSharePct: sellerShare.pct,
          shareOfRemainingCommission: sellerShare.pct,
          calculatedAmount: amount,
        });
      }
    }

    // Add referrer (rank-based)
    if (commissionInfo.referrer?.rankShares && commissionInfo.referrer.rankShares.length > 0) {
      const referrerShare = commissionInfo.referrer.rankShares.find(s => s.role === 'REFERRER');
      if (referrerShare && commissionInfo.referrer) {
        const amount = remainingCommission * referrerShare.pct;
        totalRankBasedAmount += amount;
        participants.push({
          userId: commissionInfo.referrer.id,
          fullName: commissionInfo.referrer.fullName,
          role: 'referrer',
          userRank: commissionInfo.referrer.currentRank,
          rankSharePct: referrerShare.pct,
          shareOfRemainingCommission: referrerShare.pct,
          calculatedAmount: amount,
        });
      }
    }

    // Add manager (rank-based)
    if (commissionInfo.manager?.rankShares && commissionInfo.manager.rankShares.length > 0) {
      const managerShare = commissionInfo.manager.rankShares.find(s => s.role === 'MANAGER');
      if (managerShare && commissionInfo.manager) {
        const amount = remainingCommission * managerShare.pct;
        totalRankBasedAmount += amount;
        participants.push({
          userId: commissionInfo.manager.id,
          fullName: commissionInfo.manager.fullName,
          role: 'manager',
          userRank: commissionInfo.manager.currentRank,
          rankSharePct: managerShare.pct,
          shareOfRemainingCommission: managerShare.pct,
          calculatedAmount: amount,
        });
      }
    }

    // Step 5: System residual (what's left from commission after rank distribution)
    const systemResidual = remainingCommission - totalRankBasedAmount;
    const systemResidualPct = remainingCommission > 0 ? systemResidual / remainingCommission : 0;

    // Step 6: Calculate totals
    const totalDistributed = totalRankBasedAmount + providerAmount;

    return {
      bookingId: commissionInfo.bookingId,
      productId: commissionInfo.productId,
      productName: commissionInfo.productName || 'Unknown Product',
      price: commissionInfo.price,

      commissionPct: commissionInfo.commissionPct,
      providerDesiredPct: commissionInfo.providerDesiredPct,

      totalCommission,
      providerAmount,
      remainingCommission,

      participants,

      systemResidual,
      systemResidualPct,

      totalDistributed,
      distributionComplete: Math.abs(totalDistributed + systemResidual - totalCommission) < 0.01,
    };
  }



  async getMyCommissionForBooking(bookingId: number, userId: number) {
    // Get booking with all related data
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: {
          include: { owner: true }
        },
        seller: true,
        referrer: true,
        manager: true
      }
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Calculate commission
    const commissionData = await this.commissionCalculatorService.calculateCommissionByBookingId(bookingId);

    // Determine user's role(s) in this booking
    const userRoles: string[] = [];
    let userCommission = 0;
    const commissionDetails: any[] = [];

    if (booking.sellerUserId === userId) {
      userRoles.push('seller');
      userCommission += commissionData.seller.amount;
      commissionDetails.push({
        role: 'seller',
        amount: commissionData.seller.amount,
        userId: commissionData.seller.user_id
      });
    }

    if (booking.referrerUserId === userId && commissionData.referrer) {
      userRoles.push('referrer');
      userCommission += commissionData.referrer.amount;
      commissionDetails.push({
        role: 'referrer',
        amount: commissionData.referrer.amount,
        userId: commissionData.referrer.user_id
      });
    }

    if (booking.managerUserId === userId && commissionData.manager) {
      userRoles.push('manager');
      userCommission += commissionData.manager.amount;
      commissionDetails.push({
        role: 'manager',
        amount: commissionData.manager.amount,
        userId: commissionData.manager.user_id
      });
    }

    if (booking.product?.ownerUserId === userId && commissionData.provider.user_id) {
      userRoles.push('provider');
      userCommission += commissionData.provider.amount;
      commissionDetails.push({
        role: 'provider',
        amount: commissionData.provider.amount,
        userId: commissionData.provider.user_id
      });
    }

    if (userRoles.length === 0) {
      throw new ForbiddenException('You are not involved in this booking');
    }

    return {
      bookingId,
      bookingPrice: booking.price,
      productName: booking.product?.name || 'Unknown Product',
      userRoles,
      userCommission,
      commissionDetails,
      totalCommission: commissionData.base_commission,
      createdAt: booking.createdAt,
      status: booking.status
    };
  }

  /**
   * Get total bookings count (admin function)
   */
  async getTotalBookingsCount(): Promise<number> {
    return await this.prisma.booking.count();
  }
}
