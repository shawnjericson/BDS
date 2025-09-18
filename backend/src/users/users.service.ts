import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, RegisterDto } from './dto/create-user.dto';
import { UserRevenueDto, UserRevenueSummary, RevenueSource, BookingRoleStats, RecentBookingRevenue } from './dto/user-revenue.dto';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { RevenueLedgerService } from '../revenue/revenue-ledger.service';
import { RanksService } from '../ranks/ranks.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private revenueLedgerService: RevenueLedgerService,
    private ranksService: RanksService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, fullName, referralCode } = createUserDto;

    // Check if email already exists
    const existingUser = await this.prisma.appUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Validate referral code if provided
    let referredBy: number | null = null;
    if (referralCode) {
      const referrer = await this.prisma.appUser.findUnique({
        where: { referralCode },
      });

      if (!referrer) {
        throw new NotFoundException('Invalid referral code');
      }
      referredBy = referrer.id;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code
    const newReferralCode = await this.generateUniqueReferralCode();

    // Create user
    const user = await this.prisma.appUser.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        referralCode: newReferralCode,
        referredBy,
        role: 'USER', // App users get USER role
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        referralCode: true,
        status: true,
        role: true,
        createdAt: true,
      },
    });

    // Create wallet for user
    await this.prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
      },
    });

    // Auto-assign rank 5 (seller) to new USER (from app registration)
    try {
      await this.ranksService.assignUserRank(user.id, 5);
      console.log(`✅ Auto-assigned rank 5 (seller) to new USER ${user.id} from app registration`);
    } catch (error) {
      console.error(`❌ Failed to auto-assign rank to user ${user.id}:`, error);
      // Don't throw error, user creation should still succeed
    }

    return user;
  }

  async register(registerDto: RegisterDto) {
    // For registration, referral code is required
    if (!registerDto.referralCode) {
      throw new ConflictException('Referral code is required for registration');
    }

    return this.create(registerDto);
  }

  async findByEmail(email: string) {
    return this.prisma.appUser.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    console.log('🔍 findById called with id:', id, typeof id);

    if (!id || typeof id !== 'number') {
      console.error('❌ Invalid id in findById:', id);
      return null;
    }

    return this.prisma.appUser.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        referralCode: true,
        status: true,
        createdAt: true,
        referredBy: true,
        managerId: true,
        referrer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            referralCode: true,
          },
        },
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true,
            referralCode: true,
          },
        },
        managedUsers: {
          select: {
            id: true,
            fullName: true,
            email: true,
            referralCode: true,
          },
        },
        referrals: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
          },
        },
        wallet: {
          select: {
            id: true,
            balance: true,
          },
        },
      },
    });
  }

  async validateReferralCode(referralCode: string) {
    const user = await this.prisma.appUser.findUnique({
      where: { referralCode },
      select: {
        id: true,
        fullName: true,
        referralCode: true,
      },
    });

    return !!user;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.appUser.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          status: true,
          role: true,
          referralCode: true,
          createdAt: true,
          wallet: {
            select: {
              balance: true,
            },
          },
          manager: {
            select: {
              id: true,
              fullName: true,
              email: true,
              referralCode: true,
            },
          },
          referrer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              referralCode: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.appUser.count(),
    ]);

    // Get current ranks for all users (including managers and referrers)
    const allUserIds = new Set<number>();
    users.forEach((user) => {
      allUserIds.add(user.id);
      if (user.manager?.id) allUserIds.add(user.manager.id);
      if (user.referrer?.id) allUserIds.add(user.referrer.id);
    });

    const currentRanks = await this.prisma.userRank.findMany({
      where: {
        userId: { in: Array.from(allUserIds) },
        effectiveTo: null,
      },
      select: {
        userId: true,
        rank: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create a map for quick lookup
    const rankMap = new Map(currentRanks.map(ur => [ur.userId, ur.rank]));

    // Get latest revenue for all users
    const latestRevenues = await this.prisma.revenueLedger.findMany({
      where: {
        beneficiaryUserId: { in: users.map((user) => user.id) },
      },
      select: {
        beneficiaryUserId: true,
        amount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      distinct: ['beneficiaryUserId'],
    });

    // Create a map for quick lookup
    const revenueMap = new Map(latestRevenues.map(rev => [
      rev.beneficiaryUserId,
      { amount: Number(rev.amount), date: rev.createdAt?.toISOString() }
    ]));

    // Attach current rank and latest revenue to each user
    const usersWithRanks = users.map((user) => ({
      ...user,
      currentRank: rankMap.get(user.id) || null,
      latestRevenue: revenueMap.get(user.id) || null,
      manager: user.manager ? {
        ...user.manager,
        currentRank: rankMap.get(user.manager.id) || null,
      } : null,
      referrer: user.referrer ? {
        ...user.referrer,
        currentRank: rankMap.get(user.referrer.id) || null,
      } : null,
    }));

    return {
      users: usersWithRanks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.appUser.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        referralCode: true,
        createdAt: true,
        referredBy: true,
        managerId: true,
        referrer: {
          select: {
            id: true,
            fullName: true,
            referralCode: true,
          },
        },
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true,
            referralCode: true,
          },
        },
        managedUsers: {
          select: {
            id: true,
            fullName: true,
            email: true,
            referralCode: true,
          },
        },
        referrals: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
          },
        },
        wallet: {
          select: {
            id: true,
            balance: true,
          },
        },
        _count: {
          select: {
            referrals: true,
            sellerBookings: true,
            referrerBookings: true,
            managerBookings: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateStatus(id: number, status: string) {
    const user = await this.prisma.appUser.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.appUser.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        referralCode: true,
        createdAt: true,
      },
    });
  }

  async updateRole(id: number, role: string) {
    const user = await this.prisma.appUser.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent changing ADMIN role (only ADMIN can change roles, but cannot change other ADMINs)
    if (user.role === 'ADMIN' && role !== 'ADMIN') {
      throw new BadRequestException('Cannot change ADMIN role');
    }

    // Validate role values
    const validRoles = ['EMPLOYEE', 'MANAGER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    return this.prisma.appUser.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        role: true,
        referralCode: true,
        createdAt: true,
      },
    });
  }

  async assignManager(id: number, managerId: number | null) {
    const user = await this.prisma.appUser.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (managerId && managerId === id) {
      throw new BadRequestException('User cannot be their own manager');
    }

    if (managerId) {
      const manager = await this.prisma.appUser.findUnique({
        where: { id: managerId },
      });

      if (!manager) {
        throw new NotFoundException('Manager not found');
      }

      // Only users with MANAGER role can be assigned as managers
      if (manager.role !== 'MANAGER') {
        throw new BadRequestException('Only users with MANAGER role can be assigned as managers');
      }
    }

    return this.prisma.appUser.update({
      where: { id },
      data: { managerId },
      select: {
        id: true,
        fullName: true,
        email: true,
        status: true,
        role: true,
        referralCode: true,
        createdAt: true,
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true,
            referralCode: true,
          },
        },
      },
    });
  }

  private async generateUniqueReferralCode(): Promise<string> {
    let referralCode: string = '';
    let isUnique = false;

    while (!isUnique) {
      referralCode = randomBytes(4).toString('hex').toUpperCase();

      const existing = await this.prisma.appUser.findUnique({
        where: { referralCode },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    return referralCode;
  }

  async getDashboardStats(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all user bookings
    const userBookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          { sellerUserId: userId },
          { referrerUserId: userId },
          { managerUserId: userId },
          { product: { ownerUserId: userId } }
        ]
      },
      include: {
        product: true
      }
    });

    // Get bookings in current month
    const monthlyBookings = await this.prisma.booking.findMany({
      where: {
        AND: [
          {
            OR: [
              { sellerUserId: userId },
              { referrerUserId: userId },
              { managerUserId: userId },
              { product: { ownerUserId: userId } }
            ]
          },
          {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        ]
      }
    });

    const completedBookings = userBookings.filter(booking => booking.status === 'COMPLETED');
    const pendingBookings = userBookings.filter(booking => booking.status === 'PENDING').length;

    // Get revenue from ledger instead of calculating
    const totalRevenue = await this.revenueLedgerService.getUserTotalRevenue(userId);
    const monthlyRevenue = await this.revenueLedgerService.getUserMonthlyRevenue(userId);
    const monthlyPerformance = monthlyBookings.length; // Total bookings in current month

    // Debug logging
    console.log('📊 Dashboard Stats Debug:');
    console.log('  - User ID:', userId);
    console.log('  - Current month:', startOfMonth.toISOString(), 'to', endOfMonth.toISOString());
    console.log('  - Total user bookings:', userBookings.length);
    console.log('  - Monthly bookings:', monthlyBookings.length);
    console.log('  - Completed bookings:', completedBookings.length);
    console.log('  - Pending bookings:', pendingBookings);
    console.log('  - Monthly performance:', monthlyPerformance);
    console.log('  - Total revenue from ledger:', totalRevenue);
    console.log('  - Monthly revenue from ledger:', monthlyRevenue);

    // Get wallet balance
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: userId }
    });

    return {
      totalMonthlyRevenue: totalRevenue, // Total revenue from ledger
      availableCommission: totalRevenue, // Available = total revenue (simplified)
      pendingBookings,
      monthlyPerformance,
      walletBalance: wallet ? Number(wallet.balance) : 0
    };
  }

  /*
  // Commented out old dashboard stats method that uses commissionCalculatorService
  async getDashboardStatsOld(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get user's bookings for calculations
    const userBookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          { sellerUserId: userId },
          { referrerUserId: userId },
          { managerUserId: userId },
          { product: { ownerUserId: userId } }
        ]
      },
      include: {
        product: true
      }
    });

    // Calculate monthly revenue and commission using commission calculator
    const monthlyBookings = userBookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= startOfMonth && bookingDate <= endOfMonth;
    });

    // Only count COMPLETED bookings for revenue calculation
    const completedBookings = userBookings.filter(booking => booking.status === 'COMPLETED');
    const monthlyCompletedBookings = monthlyBookings.filter(booking => booking.status === 'COMPLETED');

    let totalMonthlyRevenue = 0;
    let totalCommissionEarned = 0;

    // Calculate commission for each completed booking using commission calculator
    for (const booking of monthlyCompletedBookings) {
      if (!booking.product) continue;

      try {
        // Use commission calculator to get accurate commission split
        const commissionSplit = await this.commissionCalculatorService.calculateCommissionByBookingId(booking.id);

        // Add to total monthly revenue (booking price)
        totalMonthlyRevenue += Number(booking.price);

        // Calculate user's commission from this booking
        let userCommissionFromBooking = 0;

        // Check if user is provider
        if (commissionSplit.provider.user_id === userId) {
          userCommissionFromBooking += commissionSplit.provider.amount;
        }

        // Check if user is seller
        if (commissionSplit.seller.user_id === userId) {
          userCommissionFromBooking += commissionSplit.seller.amount;
        }

        // Check if user is referrer
        if (commissionSplit.referrer && commissionSplit.referrer.user_id === userId) {
          userCommissionFromBooking += commissionSplit.referrer.amount;
        }

        // Check if user is manager
        if (commissionSplit.manager && commissionSplit.manager.user_id === userId) {
          userCommissionFromBooking += commissionSplit.manager.amount;
        }

        totalCommissionEarned += userCommissionFromBooking;

      } catch (error) {
        console.error(`Error calculating commission for booking ${booking.id}:`, error);
        // Fallback to simple calculation if commission calculator fails
        totalMonthlyRevenue += Number(booking.price);
      }
    }

    // Count pending bookings
    const pendingBookings = userBookings.filter(booking => booking.status === 'PENDING').length;

    // Count total monthly bookings (performance metric)
    const monthlyPerformance = monthlyBookings.length;

    // Get wallet balance and calculate available commission
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId }
    });

    const walletBalance = Number(wallet?.balance || 0);

    // Get total withdrawn amount from wallet transactions
    const withdrawnTransactions = await this.prisma.walletTransaction.findMany({
      where: {
        wallet: { userId },
        type: { startsWith: 'WITHDRAWAL' }
      }
    });

    const totalWithdrawn = withdrawnTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Available commission = Total commission earned - Total withdrawn
    const availableCommission = Math.max(0, totalCommissionEarned - totalWithdrawn);

    return {
      totalMonthlyRevenue,
      totalCommissionEarned, // Tổng doanh thu commission
      availableCommission,   // Hoa hồng khả dụng (chưa rút)
      pendingBookings,
      monthlyPerformance,
      walletBalance
    };
  }
  */ // End of commented getDashboardStatsOld method

  async getUserRevenue(userId: number): Promise<UserRevenueDto> {
    console.log('🔍 getUserRevenue called with userId:', userId);

    // Get user info
    const user = await this.prisma.appUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error('❌ User not found:', userId);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    console.log('✅ User found:', user.fullName);

    // Get all bookings where user participated in any role
    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          { sellerUserId: userId },
          { referrerUserId: userId },
          { managerUserId: userId },
          { product: { ownerUserId: userId } }, // Provider role
        ],
        status: 'COMPLETED', // Only completed bookings count for revenue
      },
      include: {
        product: {
          include: { owner: true },
        },
        seller: true,
        referrer: true,
        manager: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate revenue for each booking
    let totalRevenue = 0;
    const revenueByRole: { [key: string]: { amount: number; count: number } } = {
      seller: { amount: 0, count: 0 },
      referrer: { amount: 0, count: 0 },
      manager: { amount: 0, count: 0 },
      provider: { amount: 0, count: 0 },
    };

    const recentBookings: RecentBookingRevenue[] = [];

    for (const booking of bookings) {
      // Calculate commission for this booking
      const commission = await this.calculateBookingCommissionForRevenue(booking);

      // Check each role and add to revenue
      commission.participants.forEach(participant => {
        if (participant.userId === userId) {
          totalRevenue += participant.calculatedAmount;
          revenueByRole[participant.role].amount += participant.calculatedAmount;
          revenueByRole[participant.role].count += 1;

          // Add to recent bookings (limit to 10)
          if (recentBookings.length < 10) {
            recentBookings.push({
              bookingId: booking.id,
              productName: booking.product?.name || 'Unknown Product',
              role: participant.role,
              amount: participant.calculatedAmount,
              bookingDate: booking.createdAt,
              status: booking.status,
            });
          }
        }
      });
    }

    // Get withdrawal amount (from wallet transactions)
    const withdrawals = await this.prisma.walletTransaction.findMany({
      where: {
        wallet: { userId: userId },
        type: 'WITHDRAWAL',
      },
      include: { wallet: true },
    });

    const totalWithdrawn = withdrawals.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const availableBalance = totalRevenue - totalWithdrawn;

    // Build revenue sources
    const revenueBreakdown: RevenueSource[] = Object.entries(revenueByRole)
      .filter(([_, data]) => data.count > 0)
      .map(([role, data]) => ({
        role: role as 'seller' | 'referrer' | 'manager' | 'provider',
        totalAmount: data.amount,
        bookingCount: data.count,
        averagePerBooking: data.amount / data.count,
      }));

    // Build booking role stats
    const bookingsByRole: BookingRoleStats[] = Object.entries(revenueByRole)
      .filter(([_, data]) => data.count > 0)
      .map(([role, data]) => ({
        role: role as 'seller' | 'referrer' | 'manager' | 'provider',
        count: data.count,
        totalRevenue: data.amount,
      }));

    return {
      userId: user.id,
      fullName: user.fullName || '',
      email: user.email,
      totalRevenue,
      revenueBreakdown,
      totalWithdrawn,
      availableBalance,
      totalBookings: bookings.length,
      bookingsByRole,
      recentBookings,
    };
  }

  async getUserRevenueSummary(userId: number): Promise<UserRevenueSummary> {
    try {
      console.log('🔍 getUserRevenueSummary called with userId:', userId);

      // Get user info
      const user = await this.prisma.appUser.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      console.log('✅ User found:', user.fullName);

    // Get completed bookings where user participated
    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          { sellerUserId: userId },
          { referrerUserId: userId },
          { managerUserId: userId },
          { product: { ownerUserId: userId } }
        ],
        status: 'COMPLETED'
      },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Simple revenue calculation
    let totalRevenue = 0;

    for (const booking of bookings) {
      if (!booking.product) continue;

      const totalCommission = Number(booking.price) * Number(booking.product.commissionPct || 0);
      const providerAmount = Number(booking.price) * Number(booking.product.providerDesiredPct || 0);
      const remainingCommission = totalCommission - providerAmount;

      // Check user role and add revenue
      if (booking.product.ownerUserId === userId) {
        // User is provider
        totalRevenue += providerAmount;
      }

      if (booking.sellerUserId === userId) {
        // User is seller - assume 75% of remaining commission
        totalRevenue += remainingCommission * 0.75;
      }

      if (booking.referrerUserId === userId) {
        // User is referrer - assume 6% of remaining commission
        totalRevenue += remainingCommission * 0.06;
      }

      if (booking.managerUserId === userId) {
        // User is manager - assume 1% of remaining commission
        totalRevenue += remainingCommission * 0.01;
      }
    }

    // Get withdrawals (assume 0 for now since no data)
    const totalWithdrawn = 0;
    const availableBalance = totalRevenue - totalWithdrawn;

      const result = {
        userId: user.id,
        fullName: user.fullName || '',
        totalRevenue: Math.round(totalRevenue),
        availableBalance: Math.round(availableBalance),
        totalBookings: bookings.length,
        lastBookingDate: bookings[0]?.createdAt || null,
      };

      console.log('✅ getUserRevenueSummary result:', result);
      return result;

    } catch (error) {
      console.error('❌ Error in getUserRevenueSummary:', error);
      throw error;
    }
  }

  async getWalletData(userId: number) {
    try {
      console.log('🔍 getWalletData called with userId:', userId);

      // Get user info
      const user = await this.prisma.appUser.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.error('❌ User not found:', userId);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      console.log('✅ User found:', user.fullName);

      // Lấy tất cả revenue entries của user từ revenue_ledger
      const revenueEntries = await this.prisma.revenueLedger.findMany({
        where: { beneficiaryUserId: userId },
        include: {
          booking: {
            select: {
              status: true,
              product: { select: { name: true } }
            }
          }
        }
      });

      console.log(`📊 Found ${revenueEntries.length} revenue entries`);

      // Tính toán dựa vào status
      let totalRevenue = 0;
      let confirmedRevenue = 0;  // completed bookings
      let pendingRevenue = 0;    // pending bookings
      let cancelledRevenue = 0;  // cancelled bookings

      const revenueByRole: {[key: string]: {amount: number, count: number}} = {};
      const recentTransactions: any[] = [];

      revenueEntries.forEach(entry => {
        const amount = Number(entry.amount || 0);
        const status = entry.booking?.status?.toLowerCase() || 'unknown';
        const role = entry.role || 'unknown';

        totalRevenue += amount;

        // Phân loại theo status
        if (status === 'completed') {
          confirmedRevenue += amount;
        } else if (status === 'pending') {
          pendingRevenue += amount;
        } else if (status === 'cancelled') {
          cancelledRevenue += amount;
        }

        // Phân loại theo role
        if (!revenueByRole[role]) {
          revenueByRole[role] = { amount: 0, count: 0 };
        }
        revenueByRole[role].amount += amount;
        revenueByRole[role].count += 1;

        // Recent transactions (top 10)
        if (recentTransactions.length < 10) {
          recentTransactions.push({
            id: entry.bookingId || 0,
            type: 'BOOKING',
            amount: amount,
            status: status,
            createdAt: entry.createdAt?.toISOString() || new Date().toISOString(),
            description: `Booking #${entry.bookingId} - ${entry.booking?.product?.name || 'Unknown'} (${role})`
          });
        }
      });

      // Convert revenueByRole to array
      const revenueBreakdown = Object.entries(revenueByRole).map(([role, data]) => ({
        role: role as 'seller' | 'referrer' | 'manager' | 'provider',
        totalAmount: data.amount,
        bookingCount: data.count
      }));

      // Số dư khả dụng = confirmed revenue - withdrawn (giả sử chưa rút tiền)
      const totalWithdrawn = 0;
      const availableBalance = confirmedRevenue - totalWithdrawn;

      const walletData = {
        totalRevenue,
        confirmedRevenue,
        pendingRevenue,
        cancelledRevenue,
        totalWithdrawn,
        availableBalance,
        revenueBreakdown,
        recentTransactions
      };

      console.log('✅ getWalletData result:', {
        totalRevenue,
        confirmedRevenue,
        pendingRevenue,
        cancelledRevenue,
        availableBalance,
        entriesCount: revenueEntries.length
      });

      return walletData;

    } catch (error) {
      console.error('❌ Error in getWalletData:', error);
      throw error;
    }
  }



  private async calculateBookingCommissionForRevenue(booking: any) {
    // Calculate commission similar to BookingsService.calculateCommission
    const totalCommission = Number(booking.price) * Number(booking.product?.commissionPct || 0);
    const providerAmount = Number(booking.price) * Number(booking.product?.providerDesiredPct || 0);
    const remainingCommission = totalCommission - providerAmount;

    const participants: any[] = [];

    // Add provider (fixed rate)
    if (booking.product?.owner) {
      participants.push({
        userId: booking.product.owner.id,
        fullName: booking.product.owner.fullName,
        role: 'provider',
        calculatedAmount: providerAmount,
      });
    }

    // Add seller (rank-based)
    if (booking.seller) {
      const sellerRank = await this.getUserCurrentRank(booking.seller.id);
      const sellerShare = await this.getRankShare(sellerRank?.rankId, 'SELLER');
      if (sellerShare) {
        const amount = remainingCommission * Number(sellerShare.pct);
        participants.push({
          userId: booking.seller.id,
          fullName: booking.seller.fullName,
          role: 'seller',
          calculatedAmount: amount,
        });
      }
    }

    // Add referrer (rank-based)
    if (booking.referrer) {
      const referrerRank = await this.getUserCurrentRank(booking.referrer.id);
      const referrerShare = await this.getRankShare(referrerRank?.rankId, 'REFERRER');
      if (referrerShare) {
        const amount = remainingCommission * Number(referrerShare.pct);
        participants.push({
          userId: booking.referrer.id,
          fullName: booking.referrer.fullName,
          role: 'referrer',
          calculatedAmount: amount,
        });
      }
    }

    // Add manager (rank-based)
    if (booking.manager) {
      const managerRank = await this.getUserCurrentRank(booking.manager.id);
      const managerShare = await this.getRankShare(managerRank?.rankId, 'MANAGER');
      if (managerShare) {
        const amount = remainingCommission * Number(managerShare.pct);
        participants.push({
          userId: booking.manager.id,
          fullName: booking.manager.fullName,
          role: 'manager',
          calculatedAmount: amount,
        });
      }
    }

    return { participants };
  }

  private async getUserCurrentRank(userId: number) {
    return await this.prisma.userRank.findFirst({
      where: {
        userId: userId,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
      },
      include: { rank: true },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  private async getRankShare(rankId: number | undefined, role: string) {
    if (!rankId) return null;

    return await this.prisma.rankShare.findFirst({
      where: {
        rankId: rankId,
        role: role,
      },
    });
  }

  /**
   * Get total users count (admin function)
   */
  async getTotalUsersCount(): Promise<number> {
    return await this.prisma.appUser.count();
  }

  /**
   * Create user by admin (admin function)
   */
  async createByAdmin(createUserDto: any) {
    const { fullName, email, password, referralCode, role = 'EMPLOYEE' } = createUserDto;

    // Check if email already exists
    const existingUser = await this.prisma.appUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Validate referral code - REQUIRED for admin creation
    if (!referralCode) {
      throw new BadRequestException('Referral code is required');
    }

    const referrer = await this.prisma.appUser.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      throw new NotFoundException('Invalid referral code');
    }

    const referredBy = referrer.id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code
    const newReferralCode = await this.generateUniqueReferralCode();

    // Validate role
    const validRoles = ['EMPLOYEE', 'MANAGER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException('Invalid role. Must be EMPLOYEE, MANAGER, or ADMIN');
    }

    // Create user
    const user = await this.prisma.appUser.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        referralCode: newReferralCode,
        referredBy,
        status: 'ACTIVE', // Admin created users are active by default
        role: role, // Use provided role
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        referralCode: true,
        status: true,
        role: true,
        createdAt: true,
      },
    });

    // Admin created users do NOT get auto-assigned ranks
    console.log(`✅ Admin created user ${user.id} with role ${role} - no auto-rank assignment`);

    return user;
  }
}
