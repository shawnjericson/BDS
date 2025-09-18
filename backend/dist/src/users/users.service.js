"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = require("crypto");
const revenue_ledger_service_1 = require("../revenue/revenue-ledger.service");
const ranks_service_1 = require("../ranks/ranks.service");
let UsersService = class UsersService {
    prisma;
    revenueLedgerService;
    ranksService;
    constructor(prisma, revenueLedgerService, ranksService) {
        this.prisma = prisma;
        this.revenueLedgerService = revenueLedgerService;
        this.ranksService = ranksService;
    }
    async create(createUserDto) {
        const { email, password, fullName, referralCode } = createUserDto;
        const existingUser = await this.prisma.appUser.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        let referredBy = null;
        if (referralCode) {
            const referrer = await this.prisma.appUser.findUnique({
                where: { referralCode },
            });
            if (!referrer) {
                throw new common_1.NotFoundException('Invalid referral code');
            }
            referredBy = referrer.id;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newReferralCode = await this.generateUniqueReferralCode();
        const user = await this.prisma.appUser.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                referralCode: newReferralCode,
                referredBy,
                role: 'USER',
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
        await this.prisma.wallet.create({
            data: {
                userId: user.id,
                balance: 0,
            },
        });
        try {
            await this.ranksService.assignUserRank(user.id, 5);
            console.log(`✅ Auto-assigned rank 5 (seller) to new USER ${user.id} from app registration`);
        }
        catch (error) {
            console.error(`❌ Failed to auto-assign rank to user ${user.id}:`, error);
        }
        return user;
    }
    async register(registerDto) {
        if (!registerDto.referralCode) {
            throw new common_1.ConflictException('Referral code is required for registration');
        }
        return this.create(registerDto);
    }
    async findByEmail(email) {
        return this.prisma.appUser.findUnique({
            where: { email },
        });
    }
    async findById(id) {
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
    async validateReferralCode(referralCode) {
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
        const allUserIds = new Set();
        users.forEach((user) => {
            allUserIds.add(user.id);
            if (user.manager?.id)
                allUserIds.add(user.manager.id);
            if (user.referrer?.id)
                allUserIds.add(user.referrer.id);
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
        const rankMap = new Map(currentRanks.map(ur => [ur.userId, ur.rank]));
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
        const revenueMap = new Map(latestRevenues.map(rev => [
            rev.beneficiaryUserId,
            { amount: Number(rev.amount), date: rev.createdAt?.toISOString() }
        ]));
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateStatus(id, status) {
        const user = await this.prisma.appUser.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
    async updateRole(id, role) {
        const user = await this.prisma.appUser.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role === 'ADMIN' && role !== 'ADMIN') {
            throw new common_1.BadRequestException('Cannot change ADMIN role');
        }
        const validRoles = ['EMPLOYEE', 'MANAGER', 'ADMIN'];
        if (!validRoles.includes(role)) {
            throw new common_1.BadRequestException('Invalid role');
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
    async assignManager(id, managerId) {
        const user = await this.prisma.appUser.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (managerId && managerId === id) {
            throw new common_1.BadRequestException('User cannot be their own manager');
        }
        if (managerId) {
            const manager = await this.prisma.appUser.findUnique({
                where: { id: managerId },
            });
            if (!manager) {
                throw new common_1.NotFoundException('Manager not found');
            }
            if (manager.role !== 'MANAGER') {
                throw new common_1.BadRequestException('Only users with MANAGER role can be assigned as managers');
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
    async generateUniqueReferralCode() {
        let referralCode = '';
        let isUnique = false;
        while (!isUnique) {
            referralCode = (0, crypto_1.randomBytes)(4).toString('hex').toUpperCase();
            const existing = await this.prisma.appUser.findUnique({
                where: { referralCode },
            });
            if (!existing) {
                isUnique = true;
            }
        }
        return referralCode;
    }
    async getDashboardStats(userId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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
        const totalRevenue = await this.revenueLedgerService.getUserTotalRevenue(userId);
        const monthlyRevenue = await this.revenueLedgerService.getUserMonthlyRevenue(userId);
        const monthlyPerformance = monthlyBookings.length;
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
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId: userId }
        });
        return {
            totalMonthlyRevenue: totalRevenue,
            availableCommission: totalRevenue,
            pendingBookings,
            monthlyPerformance,
            walletBalance: wallet ? Number(wallet.balance) : 0
        };
    }
    async getUserRevenue(userId) {
        console.log('🔍 getUserRevenue called with userId:', userId);
        const user = await this.prisma.appUser.findUnique({
            where: { id: userId },
        });
        if (!user) {
            console.error('❌ User not found:', userId);
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        console.log('✅ User found:', user.fullName);
        const bookings = await this.prisma.booking.findMany({
            where: {
                OR: [
                    { sellerUserId: userId },
                    { referrerUserId: userId },
                    { managerUserId: userId },
                    { product: { ownerUserId: userId } },
                ],
                status: 'COMPLETED',
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
        let totalRevenue = 0;
        const revenueByRole = {
            seller: { amount: 0, count: 0 },
            referrer: { amount: 0, count: 0 },
            manager: { amount: 0, count: 0 },
            provider: { amount: 0, count: 0 },
        };
        const recentBookings = [];
        for (const booking of bookings) {
            const commission = await this.calculateBookingCommissionForRevenue(booking);
            commission.participants.forEach(participant => {
                if (participant.userId === userId) {
                    totalRevenue += participant.calculatedAmount;
                    revenueByRole[participant.role].amount += participant.calculatedAmount;
                    revenueByRole[participant.role].count += 1;
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
        const withdrawals = await this.prisma.walletTransaction.findMany({
            where: {
                wallet: { userId: userId },
                type: 'WITHDRAWAL',
            },
            include: { wallet: true },
        });
        const totalWithdrawn = withdrawals.reduce((sum, tx) => sum + Number(tx.amount), 0);
        const availableBalance = totalRevenue - totalWithdrawn;
        const revenueBreakdown = Object.entries(revenueByRole)
            .filter(([_, data]) => data.count > 0)
            .map(([role, data]) => ({
            role: role,
            totalAmount: data.amount,
            bookingCount: data.count,
            averagePerBooking: data.amount / data.count,
        }));
        const bookingsByRole = Object.entries(revenueByRole)
            .filter(([_, data]) => data.count > 0)
            .map(([role, data]) => ({
            role: role,
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
    async getUserRevenueSummary(userId) {
        try {
            console.log('🔍 getUserRevenueSummary called with userId:', userId);
            const user = await this.prisma.appUser.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            console.log('✅ User found:', user.fullName);
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
            let totalRevenue = 0;
            for (const booking of bookings) {
                if (!booking.product)
                    continue;
                const totalCommission = Number(booking.price) * Number(booking.product.commissionPct || 0);
                const providerAmount = Number(booking.price) * Number(booking.product.providerDesiredPct || 0);
                const remainingCommission = totalCommission - providerAmount;
                if (booking.product.ownerUserId === userId) {
                    totalRevenue += providerAmount;
                }
                if (booking.sellerUserId === userId) {
                    totalRevenue += remainingCommission * 0.75;
                }
                if (booking.referrerUserId === userId) {
                    totalRevenue += remainingCommission * 0.06;
                }
                if (booking.managerUserId === userId) {
                    totalRevenue += remainingCommission * 0.01;
                }
            }
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
        }
        catch (error) {
            console.error('❌ Error in getUserRevenueSummary:', error);
            throw error;
        }
    }
    async getWalletData(userId) {
        try {
            console.log('🔍 getWalletData called with userId:', userId);
            const user = await this.prisma.appUser.findUnique({
                where: { id: userId },
            });
            if (!user) {
                console.error('❌ User not found:', userId);
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            console.log('✅ User found:', user.fullName);
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
            let totalRevenue = 0;
            let confirmedRevenue = 0;
            let pendingRevenue = 0;
            let cancelledRevenue = 0;
            const revenueByRole = {};
            const recentTransactions = [];
            revenueEntries.forEach(entry => {
                const amount = Number(entry.amount || 0);
                const status = entry.booking?.status?.toLowerCase() || 'unknown';
                const role = entry.role || 'unknown';
                totalRevenue += amount;
                if (status === 'completed') {
                    confirmedRevenue += amount;
                }
                else if (status === 'pending') {
                    pendingRevenue += amount;
                }
                else if (status === 'cancelled') {
                    cancelledRevenue += amount;
                }
                if (!revenueByRole[role]) {
                    revenueByRole[role] = { amount: 0, count: 0 };
                }
                revenueByRole[role].amount += amount;
                revenueByRole[role].count += 1;
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
            const revenueBreakdown = Object.entries(revenueByRole).map(([role, data]) => ({
                role: role,
                totalAmount: data.amount,
                bookingCount: data.count
            }));
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
        }
        catch (error) {
            console.error('❌ Error in getWalletData:', error);
            throw error;
        }
    }
    async calculateBookingCommissionForRevenue(booking) {
        const totalCommission = Number(booking.price) * Number(booking.product?.commissionPct || 0);
        const providerAmount = Number(booking.price) * Number(booking.product?.providerDesiredPct || 0);
        const remainingCommission = totalCommission - providerAmount;
        const participants = [];
        if (booking.product?.owner) {
            participants.push({
                userId: booking.product.owner.id,
                fullName: booking.product.owner.fullName,
                role: 'provider',
                calculatedAmount: providerAmount,
            });
        }
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
    async getUserCurrentRank(userId) {
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
    async getRankShare(rankId, role) {
        if (!rankId)
            return null;
        return await this.prisma.rankShare.findFirst({
            where: {
                rankId: rankId,
                role: role,
            },
        });
    }
    async getTotalUsersCount() {
        return await this.prisma.appUser.count();
    }
    async createByAdmin(createUserDto) {
        const { fullName, email, password, referralCode, role = 'EMPLOYEE' } = createUserDto;
        const existingUser = await this.prisma.appUser.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        if (!referralCode) {
            throw new common_1.BadRequestException('Referral code is required');
        }
        const referrer = await this.prisma.appUser.findUnique({
            where: { referralCode },
        });
        if (!referrer) {
            throw new common_1.NotFoundException('Invalid referral code');
        }
        const referredBy = referrer.id;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newReferralCode = await this.generateUniqueReferralCode();
        const validRoles = ['EMPLOYEE', 'MANAGER', 'ADMIN'];
        if (!validRoles.includes(role)) {
            throw new common_1.BadRequestException('Invalid role. Must be EMPLOYEE, MANAGER, or ADMIN');
        }
        const user = await this.prisma.appUser.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                referralCode: newReferralCode,
                referredBy,
                status: 'ACTIVE',
                role: role,
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
        console.log(`✅ Admin created user ${user.id} with role ${role} - no auto-rank assignment`);
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        revenue_ledger_service_1.RevenueLedgerService,
        ranks_service_1.RanksService])
], UsersService);
//# sourceMappingURL=users.service.js.map