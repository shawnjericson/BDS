export interface CommissionInfoDto {
    bookingId: number;
    productId: number;
    productName?: string | null;
    price: number;
    commissionPct: number;
    providerDesiredPct: number;
    sellerUserId?: number;
    referrerUserId?: number;
    managerUserId?: number;
    providerUserId?: number;
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
    currentRank?: {
        id: number;
        name: string;
        effectiveFrom: Date;
        effectiveTo?: Date;
    };
    rankShares?: RankShareInfo[];
}
export interface RankShareInfo {
    id: number;
    role: string;
    pct: number;
}
