export interface CommissionCalculationDto {
    bookingId: number;
    productId: number;
    productName: string;
    price: number;
    commissionPct: number;
    providerDesiredPct: number;
    totalCommission: number;
    providerAmount: number;
    remainingCommission: number;
    participants: ParticipantShare[];
    systemResidual: number;
    systemResidualPct: number;
    totalDistributed: number;
    distributionComplete: boolean;
}
export interface ParticipantShare {
    userId: number;
    fullName: string;
    role: 'seller' | 'referrer' | 'manager' | 'provider';
    userRank?: {
        id: number;
        name: string;
    };
    rankSharePct?: number;
    shareOfRemainingCommission?: number;
    calculatedAmount: number;
    isFixedRate?: boolean;
    fixedRatePct?: number;
}
export interface CommissionBreakdown {
    step1_totalCommission: {
        price: number;
        commissionPct: number;
        totalCommission: number;
    };
    step2_providerShare: {
        providerDesiredPct: number;
        providerAmount: number;
        remainingCommission: number;
    };
    step3_rankDistribution: {
        totalRankShares: number;
        participants: {
            role: string;
            rankSharePct: number;
            amount: number;
        }[];
        totalDistributed: number;
    };
    step4_systemResidual: {
        amount: number;
        percentage: number;
    };
}
