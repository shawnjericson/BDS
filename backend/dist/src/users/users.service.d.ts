import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, RegisterDto } from './dto/create-user.dto';
import { UserRevenueDto, UserRevenueSummary } from './dto/user-revenue.dto';
import { RevenueLedgerService } from '../revenue/revenue-ledger.service';
import { RanksService } from '../ranks/ranks.service';
export declare class UsersService {
    private prisma;
    private revenueLedgerService;
    private ranksService;
    constructor(prisma: PrismaService, revenueLedgerService: RevenueLedgerService, ranksService: RanksService);
    create(createUserDto: CreateUserDto): Promise<{
        id: number;
        role: string;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        status: string;
        createdAt: Date;
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: number;
        role: string;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        status: string;
        createdAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        id: number;
        role: string;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        password: string | null;
        referredBy: number | null;
        managerId: number | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: number): Promise<{
        id: number;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        referredBy: number | null;
        managerId: number | null;
        status: string;
        createdAt: Date;
        wallet: {
            id: number;
            balance: import("@prisma/client/runtime/library").Decimal;
        } | null;
        referrer: {
            id: number;
            email: string | null;
            referralCode: string | null;
            fullName: string;
        } | null;
        referrals: {
            id: number;
            email: string | null;
            fullName: string;
            createdAt: Date;
        }[];
        manager: {
            id: number;
            email: string | null;
            referralCode: string | null;
            fullName: string;
        } | null;
        managedUsers: {
            id: number;
            email: string | null;
            referralCode: string | null;
            fullName: string;
        }[];
    } | null>;
    validateReferralCode(referralCode: string): Promise<boolean>;
    findAll(page?: number, limit?: number): Promise<{
        users: {
            currentRank: {
                id: number;
                name: string;
            } | null;
            latestRevenue: {
                amount: number;
                date: string | undefined;
            } | null;
            manager: {
                currentRank: {
                    id: number;
                    name: string;
                } | null;
                id: number;
                email: string | null;
                referralCode: string | null;
                fullName: string;
            } | null;
            referrer: {
                currentRank: {
                    id: number;
                    name: string;
                } | null;
                id: number;
                email: string | null;
                referralCode: string | null;
                fullName: string;
            } | null;
            id: number;
            role: string;
            email: string | null;
            referralCode: string | null;
            fullName: string;
            status: string;
            createdAt: Date;
            wallet: {
                balance: import("@prisma/client/runtime/library").Decimal;
            } | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        id: number;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        referredBy: number | null;
        managerId: number | null;
        status: string;
        createdAt: Date;
        wallet: {
            id: number;
            balance: import("@prisma/client/runtime/library").Decimal;
        } | null;
        referrer: {
            id: number;
            referralCode: string | null;
            fullName: string;
        } | null;
        referrals: {
            id: number;
            email: string | null;
            fullName: string;
            createdAt: Date;
        }[];
        manager: {
            id: number;
            email: string | null;
            referralCode: string | null;
            fullName: string;
        } | null;
        managedUsers: {
            id: number;
            email: string | null;
            referralCode: string | null;
            fullName: string;
        }[];
        _count: {
            managerBookings: number;
            referrerBookings: number;
            sellerBookings: number;
            referrals: number;
        };
    }>;
    updateStatus(id: number, status: string): Promise<{
        id: number;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        status: string;
        createdAt: Date;
    }>;
    updateRole(id: number, role: string): Promise<{
        id: number;
        role: string;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        status: string;
        createdAt: Date;
    }>;
    assignManager(id: number, managerId: number | null): Promise<{
        id: number;
        role: string;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        status: string;
        createdAt: Date;
        manager: {
            id: number;
            email: string | null;
            referralCode: string | null;
            fullName: string;
        } | null;
    }>;
    private generateUniqueReferralCode;
    getDashboardStats(userId: number): Promise<{
        totalMonthlyRevenue: number;
        availableCommission: number;
        pendingBookings: number;
        monthlyPerformance: number;
        walletBalance: number;
    }>;
    getUserRevenue(userId: number): Promise<UserRevenueDto>;
    getUserRevenueSummary(userId: number): Promise<UserRevenueSummary>;
    getWalletData(userId: number): Promise<{
        totalRevenue: number;
        confirmedRevenue: number;
        pendingRevenue: number;
        cancelledRevenue: number;
        totalWithdrawn: number;
        availableBalance: number;
        revenueBreakdown: {
            role: "seller" | "referrer" | "manager" | "provider";
            totalAmount: number;
            bookingCount: number;
        }[];
        recentTransactions: any[];
    }>;
    private calculateBookingCommissionForRevenue;
    private getUserCurrentRank;
    private getRankShare;
    getTotalUsersCount(): Promise<number>;
    createByAdmin(createUserDto: any): Promise<{
        id: number;
        role: string;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        status: string;
        createdAt: Date;
    }>;
}
