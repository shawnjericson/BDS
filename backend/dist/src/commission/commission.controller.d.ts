import { CommissionService } from './commission.service';
import { CommissionCalculatorService } from './commission-calculator.service';
import { CalculateCommissionDto, CommissionResult } from './dto/calculate-commission.dto';
export declare class CommissionController {
    private readonly commissionService;
    private readonly commissionCalculatorService;
    constructor(commissionService: CommissionService, commissionCalculatorService: CommissionCalculatorService);
    calculateCommission(dto: CalculateCommissionDto): Promise<CommissionResult>;
    executeCommissionPayout(dto: CalculateCommissionDto & {
        transaction_ref_id: number;
        transaction_type?: string;
    }): Promise<{
        message: string;
        commission_result: CommissionResult;
        payout_records: any[];
    }>;
    getUserCommissionPayouts(userId: number, page?: string, limit?: string): Promise<{
        message: string;
        user_id: number;
        data: never[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTransactionCommissionPayouts(refId: number, type?: string): Promise<{
        message: string;
        transaction_ref_id: number;
        transaction_type: string;
        total_commission_paid: number;
        payouts: never[];
    }>;
    demoCommissionCalculation(): Promise<{
        message: string;
        input: CalculateCommissionDto;
        result: CommissionResult;
        explanation: {
            commission_pool: string;
            allocations_explanation: {
                direct_sales: string;
                referrer: string;
                head_owner: string;
                mgr_sales: string;
                mgr_product: string;
                mgr_region: string;
            };
            total_proposed: string;
            remaining: string;
            policy: string;
        };
    }>;
    getCommissionPreview(productId: number, price: number, sellerUserId: number, referrerUserId?: string, managerUserId?: string): Promise<import("./commission-calculator.service").CommissionSplitResult>;
    calculateCommissionByBooking(bookingId: number): Promise<import("./commission-calculator.service").CommissionSplitResult>;
    executeCommissionByBooking(bookingId: number, body: {
        status: 'PENDING' | 'COMPLETED' | 'CANCELED';
    }): Promise<import("./commission-calculator.service").CommissionSplitResult | undefined>;
}
