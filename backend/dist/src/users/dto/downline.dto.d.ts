export interface DownlineUserDto {
    id: number;
    fullName: string;
    nickname?: string;
    email?: string;
    referralCode?: string;
    role: string;
    status: string;
    createdAt: string;
    totalRevenue: number;
    totalBookings: number;
    monthlyRevenue: number;
    monthlyBookings: number;
    currentRank?: {
        id: number;
        name: string;
    };
    totalReferrals: number;
    activeReferrals: number;
}
export interface DownlineStatsDto {
    totalMembers: number;
    activeMembers: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalBookings: number;
    monthlyBookings: number;
    topPerformers: DownlineUserDto[];
}
