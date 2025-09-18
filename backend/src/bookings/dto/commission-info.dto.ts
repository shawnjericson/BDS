export interface CommissionInfoDto {
  bookingId: number;
  productId: number;
  productName?: string | null;
  price: number;
  
  // Product commission info
  commissionPct: number;
  providerDesiredPct: number;
  
  // User IDs
  sellerUserId?: number;
  referrerUserId?: number;
  managerUserId?: number;
  providerUserId?: number; // From product.ownerUserId
  
  // User details with ranks
  seller?: UserWithRank;
  referrer?: UserWithRank;
  manager?: UserWithRank;
  provider?: UserWithRank;
}

export interface UserWithRank {
  id: number;
  fullName: string;
  email: string | null;
  role: string;
  
  // Current rank info
  currentRank?: {
    id: number;
    name: string;
    effectiveFrom: Date;
    effectiveTo?: Date;
  };
  
  // Rank shares for this user's rank
  rankShares?: RankShareInfo[];
}

export interface RankShareInfo {
  id: number;
  role: string;
  pct: number;
}
