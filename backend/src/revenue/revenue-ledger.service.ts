import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommissionCalculatorService } from '../commission/commission-calculator.service';

@Injectable()
export class RevenueLedgerService {
  constructor(
    private prisma: PrismaService,
    private commissionCalculatorService: CommissionCalculatorService,
  ) {}

  /**
   * Calculate and save revenue to ledger for ANY booking status change
   * This creates a record for tracking, regardless of status
   */
  async processBookingRevenue(bookingId: number): Promise<void> {
    console.log('💰 Processing revenue for booking:', bookingId);

    // Always delete existing entries first to avoid duplicates
    const existingEntries = await this.prisma.revenueLedger.findMany({
      where: { bookingId }
    });

    if (existingEntries.length > 0) {
      console.log(`🔄 Updating existing ${existingEntries.length} entries for booking ${bookingId}`);
      await this.prisma.revenueLedger.deleteMany({
        where: { bookingId }
      });
    } else {
      console.log(`➕ Creating new entries for booking ${bookingId}`);
    }

    // Get booking details
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        product: true
      }
    });

    if (!booking) {
      console.error('❌ Booking not found:', bookingId);
      return;
    }

    console.log(`📊 Processing booking ${bookingId} with status: ${booking.status}`);

    try {
      // Calculate commission split
      const commissionData = await this.commissionCalculatorService.calculateCommissionByBookingId(bookingId);
      
      console.log('📊 Commission data:', commissionData);

      // Get seller rank info for percentage calculation
      const sellerRank = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
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
          }
        }
      });

      const sellerRankShares = sellerRank?.seller?.userRanks?.[0]?.rank?.rankShares || [];
      const sellerShare = sellerRankShares.find(rs => rs.role === 'SELLER');
      const referrerShare = sellerRankShares.find(rs => rs.role === 'REFERRER');
      const managerShare = sellerRankShares.find(rs => rs.role === 'MANAGER');

      // Create revenue ledger entries for ALL 4 roles (provider, seller, manager, referrer)
      const ledgerEntries: Array<{
        bookingId: number;
        role: string;
        beneficiaryUserId: number;
        amount: number;
        pct: number;
      }> = [];

      // 1. Provider revenue (always exists if product has owner)
      if (commissionData.provider.user_id) {
        const providerPct = Number(booking.product?.providerDesiredPct || 0);
        ledgerEntries.push({
          bookingId,
          role: 'provider',
          beneficiaryUserId: commissionData.provider.user_id,
          amount: commissionData.provider.amount || 0,
          pct: providerPct,
        });
        console.log(`  📝 Provider: User ${commissionData.provider.user_id} = ${commissionData.provider.amount} (${(providerPct * 100).toFixed(2)}%)`);
      }

      // 2. Seller revenue (always exists)
      if (commissionData.seller.user_id) {
        const sellerPct = Number(sellerShare?.pct || 0);
        ledgerEntries.push({
          bookingId,
          role: 'seller',
          beneficiaryUserId: commissionData.seller.user_id,
          amount: commissionData.seller.amount || 0,
          pct: sellerPct,
        });
        console.log(`  📝 Seller: User ${commissionData.seller.user_id} = ${commissionData.seller.amount} (${(sellerPct * 100).toFixed(2)}%)`);
      }

      // 3. Referrer revenue (may be null if no referrer)
      if (commissionData.referrer?.user_id) {
        const referrerPct = Number(referrerShare?.pct || 0);
        ledgerEntries.push({
          bookingId,
          role: 'referrer',
          beneficiaryUserId: commissionData.referrer.user_id,
          amount: commissionData.referrer.amount || 0,
          pct: referrerPct,
        });
        console.log(`  📝 Referrer: User ${commissionData.referrer.user_id} = ${commissionData.referrer.amount} (${(referrerPct * 100).toFixed(2)}%)`);
      } else {
        console.log(`  📝 Referrer: None`);
      }

      // 4. Manager revenue (may be null if no manager)
      if (commissionData.manager?.user_id) {
        const managerPct = Number(managerShare?.pct || 0);
        ledgerEntries.push({
          bookingId,
          role: 'manager',
          beneficiaryUserId: commissionData.manager.user_id,
          amount: commissionData.manager.amount || 0,
          pct: managerPct,
        });
        console.log(`  📝 Manager: User ${commissionData.manager.user_id} = ${commissionData.manager.amount} (${(managerPct * 100).toFixed(2)}%)`);
      } else {
        console.log(`  📝 Manager: None`);
      }

      // Save all entries (always save, even if amounts are 0)
      if (ledgerEntries.length > 0) {
        await this.prisma.revenueLedger.createMany({
          data: ledgerEntries
        });

        console.log(`✅ Revenue ledger entries created: ${ledgerEntries.length} for booking ${bookingId} (${booking.status})`);
      } else {
        console.log('⚠️ No ledger entries to create');
      }

    } catch (error) {
      console.error('❌ Error processing booking revenue:', error);
      throw error;
    }
  }

  /**
   * Get user's total revenue from ledger
   */
  async getUserTotalRevenue(userId: number): Promise<number> {
    const result = await this.prisma.revenueLedger.aggregate({
      where: {
        beneficiaryUserId: userId
      },
      _sum: {
        amount: true
      }
    });

    return Number(result._sum.amount || 0);
  }

  /**
   * Get user's monthly revenue from ledger
   */
  async getUserMonthlyRevenue(userId: number, year?: number, month?: number): Promise<number> {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const result = await this.prisma.revenueLedger.aggregate({
      where: {
        beneficiaryUserId: userId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });

    return Number(result._sum.amount || 0);
  }

  /**
   * Get user's revenue breakdown by role
   */
  async getUserRevenueByRole(userId: number): Promise<Array<{role: string, amount: number}>> {
    const result = await this.prisma.revenueLedger.groupBy({
      by: ['role'],
      where: {
        beneficiaryUserId: userId
      },
      _sum: {
        amount: true
      }
    });

    return result.map(item => ({
      role: item.role || 'unknown',
      amount: Number(item._sum.amount || 0)
    }));
  }

  /**
   * Get detailed revenue history for user
   */
  async getUserRevenueHistory(userId: number, limit = 50): Promise<any[]> {
    const entries = await this.prisma.revenueLedger.findMany({
      where: {
        beneficiaryUserId: userId
      },
      include: {
        booking: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return entries.map(entry => ({
      id: entry.id,
      bookingId: entry.bookingId,
      role: entry.role,
      amount: Number(entry.amount || 0),
      createdAt: entry.createdAt,
      productName: entry.booking?.product?.name || 'Unknown Product',
      bookingPrice: Number(entry.booking?.price || 0)
    }));
  }

  /**
   * Recalculate revenue for ALL bookings regardless of status (admin function)
   */
  async recalculateAllRevenue(): Promise<void> {
    console.log('🔄 Recalculating all revenue...');

    // Clear existing ledger
    await this.prisma.revenueLedger.deleteMany({});

    // Get ALL bookings (not just completed)
    const allBookings = await this.prisma.booking.findMany({
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`📊 Found ${allBookings.length} total bookings`);

    // Process each booking
    for (const booking of allBookings) {
      try {
        await this.processBookingRevenue(booking.id);
      } catch (error) {
        console.error(`❌ Error processing booking ${booking.id}:`, error);
      }
    }

    console.log('✅ Revenue recalculation completed for all bookings');
  }

  /**
   * Get total revenue across all users (admin function)
   */
  async getTotalRevenue(): Promise<number> {
    const result = await this.prisma.revenueLedger.aggregate({
      _sum: {
        amount: true
      }
    });
    return Number(result._sum.amount || 0);
  }

  /**
   * Get revenue breakdown by booking status (admin function)
   */
  async getRevenueByStatus(): Promise<Array<{ status: string; amount: number }>> {
    const result = await this.prisma.revenueLedger.groupBy({
      by: ['bookingId'],
      _sum: {
        amount: true
      }
    });

    // Group by booking status
    const statusMap = new Map<string, number>();

    for (const entry of result) {
      if (!entry.bookingId) continue;

      const booking = await this.prisma.booking.findUnique({
        where: { id: entry.bookingId },
        select: { status: true }
      });

      if (booking && entry._sum) {
        const currentAmount = statusMap.get(booking.status) || 0;
        statusMap.set(booking.status, currentAmount + Number(entry._sum.amount || 0));
      }
    }

    return Array.from(statusMap.entries()).map(([status, amount]) => ({
      status,
      amount
    }));
  }

  /**
   * Get revenue breakdown by role (admin function)
   */
  async getRevenueByRole(): Promise<Array<{ role: string; amount: number }>> {
    const result = await this.prisma.revenueLedger.groupBy({
      by: ['role'],
      _sum: {
        amount: true
      },
      orderBy: {
        role: 'asc'
      }
    });

    return result.map(entry => ({
      role: entry.role || 'unknown',
      amount: Number(entry._sum?.amount || 0)
    }));
  }

  /**
   * Get all revenue entries with pagination (admin function)
   */
  async getAllRevenueEntries(page = 1, limit = 50): Promise<any> {
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.prisma.revenueLedger.findMany({
        include: {
          beneficiaryUser: {
            select: { id: true, fullName: true, email: true }
          },
          booking: {
            include: {
              product: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.revenueLedger.count()
    ]);

    return {
      entries: entries.map(entry => ({
        id: entry.id,
        userId: entry.beneficiaryUserId,
        bookingId: entry.bookingId,
        role: entry.role,
        amount: Number(entry.amount || 0),
        createdAt: entry.createdAt,
        user: entry.beneficiaryUser,
        booking: entry.booking ? {
          id: entry.booking.id,
          price: Number(entry.booking.price || 0),
          status: entry.booking.status,
          product: entry.booking.product
        } : null
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get commission data for a booking from revenue ledger (fast query)
   */
  async getBookingCommissionFromLedger(bookingId: number): Promise<any> {
    // Get all revenue entries for this booking
    const entries = await this.prisma.revenueLedger.findMany({
      where: { bookingId },
      include: {
        beneficiaryUser: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    if (entries.length === 0) {
      return {
        bookingId,
        provider: { user: null, amount: 0, percentage: 0 },
        seller: { user: null, amount: 0, percentage: 0 },
        referrer: { user: null, amount: 0, percentage: 0 },
        manager: { user: null, amount: 0, percentage: 0 }
      };
    }

    // Get booking info for percentage calculation
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { price: true }
    });

    const bookingPrice = Number(booking?.price || 0);

    // Group entries by role
    const result: any = {
      bookingId,
      provider: { user: null, amount: 0, percentage: 0 },
      seller: { user: null, amount: 0, percentage: 0 },
      referrer: { user: null, amount: 0, percentage: 0 },
      manager: { user: null, amount: 0, percentage: 0 }
    };

    entries.forEach(entry => {
      const amount = Number(entry.amount || 0);
      const percentage = Number(entry.pct || 0);

      if (entry.role === 'provider') {
        result.provider = {
          user: entry.beneficiaryUser,
          amount,
          percentage
        };
      } else if (entry.role === 'seller') {
        result.seller = {
          user: entry.beneficiaryUser,
          amount,
          percentage
        };
      } else if (entry.role === 'referrer') {
        result.referrer = {
          user: entry.beneficiaryUser,
          amount,
          percentage
        };
      } else if (entry.role === 'manager') {
        result.manager = {
          user: entry.beneficiaryUser,
          amount,
          percentage
        };
      }
    });

    return result;
  }
}
