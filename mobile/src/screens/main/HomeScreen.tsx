import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../services/api';
import { Booking } from '../../types';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const [walletBalance, setWalletBalance] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [availableCommission, setAvailableCommission] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [monthlyPerformance, setMonthlyPerformance] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('pending');

  // Revenue data
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

  const filterOptions = [
    { key: 'confirmed', label: 'Đã duyệt' },
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'cancelled', label: 'Đã hủy' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'closed', label: 'Đã đóng' },
  ];

  // Fetch wallet data and bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardStats, bookingsData] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getMyBookings(),
        ]);

        setWalletBalance(dashboardStats.walletBalance);
        setMonthlyRevenue(dashboardStats.totalMonthlyRevenue);

        // Set dashboard data như ban đầu
        setTotalRevenue(dashboardStats.totalMonthlyRevenue || 0);
        setAvailableBalance(dashboardStats.walletBalance || 0);
        setTotalBookings(dashboardStats.totalBookings || 0);
        setAvailableCommission(dashboardStats.availableCommission);
        setPendingBookings(dashboardStats.pendingBookings);
        setMonthlyPerformance(dashboardStats.monthlyPerformance);
        setBookings(bookingsData || []);

        console.log('🏠 HomeScreen dashboard stats:');
        console.log('  - Monthly revenue:', dashboardStats.totalMonthlyRevenue);
        console.log('  - Available commission:', dashboardStats.availableCommission);
        console.log('  - Pending bookings:', dashboardStats.pendingBookings);
        console.log('  - Monthly performance:', dashboardStats.monthlyPerformance);
        console.log('  - Bookings loaded:', bookingsData?.length);
      } catch (error: any) {
        console.error('❌ Error fetching data:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        if (error.response) {
          console.error('❌ Response status:', error.response.status);
          console.error('❌ Response data:', error.response.data);
        }
        setWalletBalance(0);
        setMonthlyRevenue(0);
        setAvailableCommission(0);
        setPendingBookings(0);
        setMonthlyPerformance(0);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const copyReferralCode = async () => {
    if (user?.referralCode) {
      await Clipboard.setStringAsync(user.referralCode);
      Alert.alert('Thành công', 'Đã sao chép mã giới thiệu');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: logout
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'confirmed':
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
      case 'canceled':
        return '#ef4444';
      case 'closed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'confirmed':
      case 'completed':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'cancelled':
      case 'canceled':
        return 'Đã hủy';
      case 'closed':
        return 'Đã đóng';
      default:
        return status;
    }
  };



  const filteredBookings = bookings.filter(booking => {
    const backendStatus = (booking.status as string).toLowerCase();
    return backendStatus === selectedFilter;
  });

  console.log('🔍 HomeScreen filter debug:');
  console.log('  - Selected filter:', selectedFilter);
  console.log('  - Total bookings:', bookings.length);
  console.log('  - Filtered bookings:', filteredBookings.length);
  console.log('  - Booking statuses:', bookings.map(b => b.status));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Banking Header - Hạ xuống */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.fullName?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.welcomeText}>Xin chào!</Text>
                <Text style={styles.userNameModern}>
                  {user?.fullName || 'Người dùng'}
                </Text>
              </View>
            </View>

            {/* Header Actions */}
            <View style={styles.headerActions}>
              {/* Referral Code */}
              <TouchableOpacity
                onPress={copyReferralCode}
                style={styles.referralCodeHeader}
              >
                <Text style={styles.referralCodeText}>
                  {user?.referralCode || 'N/A'}
                </Text>
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                <Text style={styles.logoutText}>⏻</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Hero Section - 4 Statistics Cards */}
        <View style={styles.heroSection}>
          <View style={styles.statsGrid}>
            {/* Total Revenue */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Tổng doanh thu</Text>
              <Text style={styles.statSubLabel}>(tất cả thời gian)</Text>
              <Text style={styles.statAmount}>
                {loading ? '••••••••' : formatCurrency(totalRevenue)}
              </Text>
            </View>

            {/* Available Balance */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Số dư khả dụng</Text>
              <Text style={styles.statSubLabel}>(có thể rút)</Text>
              <Text style={styles.statAmount}>
                {loading ? '••••••••' : formatCurrency(availableBalance)}
              </Text>
            </View>

            {/* Pending Bookings */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Booking pending</Text>
              <Text style={styles.statSubLabel}>(chờ xử lý)</Text>
              <Text style={styles.statCount}>
                {loading ? '•••' : pendingBookings}
              </Text>
            </View>

            {/* Total Bookings This Month */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Tổng booking</Text>
              <Text style={styles.statSubLabel}>(trong tháng)</Text>
              <Text style={styles.statCount}>
                {loading ? '•••' : totalBookings}
              </Text>
            </View>
          </View>
        </View>

        {/* Booking List với Filter */}
        <View style={styles.bookingSection}>
          <Text style={styles.bookingTitle}>Danh sách booking</Text>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setSelectedFilter(option.key)}
                style={[
                  styles.filterButton,
                  selectedFilter === option.key && styles.filterButtonActive
                ]}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === option.key && styles.filterTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Booking List */}
          <View style={styles.bookingList}>
            {loading ? (
              <Text style={styles.loadingText}>Đang tải...</Text>
            ) : filteredBookings.length === 0 ? (
              <Text style={styles.emptyText}>Không có booking nào</Text>
            ) : (
              <>
                {filteredBookings.slice(0, 3).map((booking) => (
                  <View key={booking.id} style={styles.bookingItem}>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingName}>
                        {booking.product?.name || `Booking #${booking.id}`}
                      </Text>
                      <Text style={styles.bookingPrice}>
                        {formatCurrency(Number(booking.price))}
                      </Text>
                      <Text style={styles.bookingDate}>
                        {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(booking.status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusLabel(booking.status)}
                      </Text>
                    </View>
                  </View>
                ))}

                {filteredBookings.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewMoreButton}
                    onPress={() => navigation.navigate('Bookings' as never)}
                  >
                    <Text style={styles.viewMoreText}>
                      Xem thêm ({filteredBookings.length - 3} booking)
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding to avoid navbar overlap
  },
  // Modern Banking Header - Hạ xuống
  modernHeader: {
    backgroundColor: '#1a365d',
    paddingHorizontal: 20,
    paddingTop: 50, // Tăng padding top để hạ xuống
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  userNameModern: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  qrButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Header Actions Container
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Referral Code in Header
  referralCodeHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  referralCodeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  copyButtonHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  copyTextHeader: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  // Logout Button
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Hero Section - Statistics
  heroSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  statSubLabel: {
    color: '#94a3b8',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
  },
  statAmount: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statCount: {
    color: '#3b82f6',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  walletSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  walletInfo: {
    flex: 1,
  },
  revenueLabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 8,
  },
  revenueAmount: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  walletLabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 8,
  },
  walletAmount: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  walletSubtext: {
    color: '#64748b',
    fontSize: 10,
    marginBottom: 12,
  },
  withdrawButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  withdrawText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Booking Section
  bookingSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  bookingTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#1e293b',
    fontWeight: '600',
  },
  bookingList: {
    gap: 12,
  },
  loadingText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    paddingVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    paddingVertical: 20,
  },
  bookingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingName: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingPrice: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookingDate: {
    color: '#64748b',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  referralCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  referralLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  referralRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  referralCode: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  copyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Balance Card Section
  balanceSection: {
    paddingHorizontal: 20,
    marginTop: -10,
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  eyeText: {
    fontSize: 16,
  },
  balanceAmount: {
    color: '#1e293b',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  balanceSubtext: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 20,
  },
  referralSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  referralTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  referralContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  referralCodeModern: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  copyButtonModern: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyTextModern: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Services Section
  servicesSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  serviceTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  serviceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Transaction Section
  transactionSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 18,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    color: '#64748b',
    fontSize: 12,
  },
  transactionAmount: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },

  actionsSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activitySection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: '#111827',
    fontWeight: '500',
  },
  activityTime: {
    color: '#6b7280',
    fontSize: 14,
  },
  activityDescription: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 52,
  },
  activityIconText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewMoreButton: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  viewMoreText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;
