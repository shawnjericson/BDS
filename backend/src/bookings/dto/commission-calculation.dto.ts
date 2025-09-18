export interface CommissionCalculationDto {
  bookingId: number;
  productId: number;
  productName: string;
  price: number;
  
  // Commission rates
  commissionPct: number;
  providerDesiredPct: number;
  
  // Calculated amounts
  totalCommission: number;
  providerAmount: number;
  remainingCommission: number; // After provider gets their share
  
  // Participant shares
  participants: ParticipantShare[];
  
  // System residual
  systemResidual: number;
  systemResidualPct: number;
  
  // Summary
  totalDistributed: number;
  distributionComplete: boolean;
}

export interface ParticipantShare {
  userId: number;
  fullName: string;
  role: 'seller' | 'referrer' | 'manager' | 'provider';
  
  // For ranked participants (seller, referrer, manager)
  userRank?: {
    id: number;
    name: string;
  };
  rankSharePct?: number; // Their rank's percentage for this role
  
  // Calculated amounts
  shareOfRemainingCommission?: number; // % of remaining commission (after provider)
  calculatedAmount: number;
  
  // For provider (fixed)
  isFixedRate?: boolean;
  fixedRatePct?: number;
}

export interface CommissionBreakdown {
  // Step 1: Total commission
  step1_totalCommission: {
    price: number;
    commissionPct: number;
    totalCommission: number;
  };
  
  // Step 2: Provider share (fixed)
  step2_providerShare: {
    providerDesiredPct: number;
    providerAmount: number;
    remainingCommission: number;
  };
  
  // Step 3: Rank-based distribution
  step3_rankDistribution: {
    totalRankShares: number; // Sum of all rank shares
    participants: {
      role: string;
      rankSharePct: number;
      amount: number;
    }[];
    totalDistributed: number;
  };
  
  // Step 4: System residual
  step4_systemResidual: {
    amount: number;
    percentage: number;
  };
}
