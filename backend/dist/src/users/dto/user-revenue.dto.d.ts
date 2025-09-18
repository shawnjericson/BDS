export interface UserRevenueDto {
    userId: number;
    fullName: string;
    email: string | null;
    totalRevenue: number;
    revenueBreakdown: RevenueSource[];
    totalWithdrawn: number;
    availableBalance: number;
    totalBookings: number;
    bookingsByRole: BookingRoleStats[];
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
