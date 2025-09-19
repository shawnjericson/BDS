export interface DownlineUserDto {
  id: number;
  fullName: string;
  nickname?: string; // Tạm thời dùng tên đầu
  email?: string;
  referralCode?: string;
  role: string;
  status: string;
  createdAt: string;
  
  // Statistics
  totalRevenue: number;
  totalBookings: number;
  monthlyRevenue: number;
  monthlyBookings: number;
  
  // Rank info
  currentRank?: {
    id: number;
    name: string;
  };
  
  // Referral info
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
