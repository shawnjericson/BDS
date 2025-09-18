export declare enum TransactionType {
    COMMISSION_DIRECT = "COMMISSION_DIRECT",
    COMMISSION_REFERRAL = "COMMISSION_REFERRAL",
    ADJUSTMENT_CREDIT = "ADJUSTMENT_CREDIT",
    ADJUSTMENT_DEBIT = "ADJUSTMENT_DEBIT"
}
export declare class CreateWalletTransactionDto {
    walletId: number;
    amount: number;
    type: TransactionType;
    refId?: number;
    description?: string;
}
export declare class CreateAdjustmentDto {
    userId: number;
    amount: number;
    description: string;
}
