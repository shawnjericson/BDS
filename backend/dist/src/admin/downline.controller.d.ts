import { PrismaService } from '../prisma/prisma.service';
interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
    };
}
export declare class DownlineController {
    private prisma;
    constructor(prisma: PrismaService);
    getMyDownline(req: AuthenticatedRequest): Promise<{
        id: number;
        fullName: string;
        nickname: string;
        email: string | undefined;
        referralCode: string | undefined;
        role: string;
        status: string;
        createdAt: string;
        totalRevenue: number;
        totalBookings: number;
        monthlyRevenue: number;
        monthlyBookings: number;
        currentRank: {
            id: number;
            name: string;
        } | undefined;
        totalReferrals: number;
        activeReferrals: number;
    }[]>;
    getDownlineStats(req: AuthenticatedRequest): Promise<{
        totalMembers: number;
        activeMembers: number;
        totalRevenue: number;
        monthlyRevenue: number;
        totalBookings: number;
        monthlyBookings: number;
        topPerformers: {
            id: number;
            fullName: string;
            nickname: string;
            email: string | undefined;
            referralCode: string | undefined;
            role: string;
            status: string;
            createdAt: string;
            totalRevenue: number;
            totalBookings: number;
            monthlyRevenue: number;
            monthlyBookings: number;
            currentRank: {
                id: number;
                name: string;
            } | undefined;
            totalReferrals: number;
            activeReferrals: number;
        }[];
    }>;
}
export {};
