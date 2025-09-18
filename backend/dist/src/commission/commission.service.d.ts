import { PrismaService } from '../prisma/prisma.service';
import { CalculateCommissionDto, CommissionResult } from './dto/calculate-commission.dto';
export declare class CommissionService {
    prisma: PrismaService;
    constructor(prisma: PrismaService);
    calculateCommission(dto: CalculateCommissionDto): Promise<CommissionResult>;
    private allocateByPriority;
    private applyRounding;
    executeCommissionPayout(dto: CalculateCommissionDto, result: CommissionResult, transaction_ref_id: number, transaction_type?: string): Promise<{
        payout_records: any[];
        commission_result: CommissionResult;
    }>;
    private updateUserWallet;
    private getTransactionType;
}
