import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
    };
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        id: number;
        role: string;
        email: string | null;
        referralCode: string | null;
        fullName: string;
        status: string;
        createdAt: Date;
    }>;
    getProfile(req: AuthenticatedRequest): Promise<{
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
    getDashboardStats(req: AuthenticatedRequest): Promise<{
        totalMonthlyRevenue: number;
        availableCommission: number;
        pendingBookings: number;
        monthlyPerformance: number;
        walletBalance: number;
    }>;
    findAll(): Promise<{
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
    findOne(id: string): Promise<{
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
    validateReferralCode(code: string): Promise<{
        valid: boolean;
    }>;
    getUserRevenue(req: AuthenticatedRequest): Promise<import("./dto/user-revenue.dto").UserRevenueDto>;
    getWalletData(req: AuthenticatedRequest): Promise<{
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
    getWalletTest(req: AuthenticatedRequest): {
        message: string;
        userId: number;
        timestamp: string;
    };
    getWalletTestPublic(): {
        message: string;
        timestamp: string;
    };
}
export {};
