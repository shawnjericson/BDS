import { PrismaService } from '../prisma/prisma.service';
export interface CommissionSplitResult {
    booking_id: number;
    base_commission: number;
    provider: {
        user_id: number | null;
        amount: number;
    };
    seller: {
        user_id: number;
        amount: number;
    };
    referrer: {
        user_id: number;
        amount: number;
    } | null;
    manager: {
        user_id: number;
        amount: number;
    } | null;
    system_residual: number;
}
export declare class CommissionCalculatorService {
    private prisma;
    constructor(prisma: PrismaService);
    calculateCommissionByBookingId(bookingId: number): Promise<CommissionSplitResult>;
    onBookingStatusChanged(bookingId: number, newStatus: 'PENDING' | 'COMPLETED' | 'CANCELED'): Promise<CommissionSplitResult | undefined>;
    private credit;
    private roundVND;
    getCommissionPreview(productId: number, price: number, sellerUserId: number, referrerUserId?: number, managerUserId?: number): Promise<CommissionSplitResult>;
}
