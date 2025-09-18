export interface UserRevenueDto {
  userId: number;
  fullName: string;
  email: string | null;
  
  // Revenue breakdown
  totalRevenue: number;
  revenueBreakdown: RevenueSource[];
  
  // Wallet info
  totalWithdrawn: number;
  availableBalance: number;
  
  // Statistics
  totalBookings: number;
  bookingsByRole: BookingRoleStats[];
  
  // Recent activity
  recentBookings: RecentBookingRevenue[];
}

export interface RevenueSource {
  role: 'seller' | 'referrer' | 'manager' | 'provider';
  totalAmount: number;
  bookingCount: number;
  averagePerBooking: number;
}

export interface BookingRoleStats {
  role: 'seller' | 'referrer' | 'manager' | 'provider';
  count: number;
  totalRevenue: number;
}

export interface RecentBookingRevenue {
  bookingId: number;
  productName: string;
  role: 'seller' | 'referrer' | 'manager' | 'provider';
  amount: number;
  bookingDate: Date;
  status: string;
}

export interface UserRevenueSummary {
  userId: number;
  fullName: string;
  totalRevenue: number;
  availableBalance: number;
  totalBookings: number;
  lastBookingDate?: Date;
}
