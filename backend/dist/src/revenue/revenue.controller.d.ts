import { RevenueLedgerService } from './revenue-ledger.service';
export declare class RevenueController {
    private revenueLedgerService;
    constructor(revenueLedgerService: RevenueLedgerService);
    recalculateAllRevenue(): Promise<{
        message: string;
    }>;
    getUserTotalRevenue(userId: number): Promise<{
        userId: number;
        totalRevenue: number;
    }>;
    getUserMonthlyRevenue(userId: number): Promise<{
        userId: number;
        monthlyRevenue: number;
    }>;
    getUserRevenueByRole(userId: number): Promise<{
        userId: number;
        revenueByRole: {
            role: string;
            amount: number;
        }[];
    }>;
    getUserRevenueHistory(userId: number): Promise<{
        userId: number;
        revenueHistory: any[];
    }>;
}
