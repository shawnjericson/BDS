import { PrismaService } from '../prisma/prisma.service';
import { CommissionCalculatorService } from '../commission/commission-calculator.service';
export declare class RevenueLedgerService {
    private prisma;
    private commissionCalculatorService;
    constructor(prisma: PrismaService, commissionCalculatorService: CommissionCalculatorService);
    processBookingRevenue(bookingId: number): Promise<void>;
    getUserTotalRevenue(userId: number): Promise<number>;
    getUserMonthlyRevenue(userId: number, year?: number, month?: number): Promise<number>;
    getUserRevenueByRole(userId: number): Promise<Array<{
        role: string;
        amount: number;
    }>>;
    getUserRevenueHistory(userId: number, limit?: number): Promise<any[]>;
    recalculateAllRevenue(): Promise<void>;
    getTotalRevenue(): Promise<number>;
    getRevenueByStatus(): Promise<Array<{
        status: string;
        amount: number;
    }>>;
    getRevenueByRole(): Promise<Array<{
        role: string;
        amount: number;
    }>>;
    getAllRevenueEntries(page?: number, limit?: number): Promise<any>;
    getBookingCommissionFromLedger(bookingId: number): Promise<any>;
}
