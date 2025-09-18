import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../../services/api';

interface WalletData {
  totalRevenue: number;
  confirmedRevenue: number;
  pendingRevenue: number;
  cancelledRevenue: number;
  totalWithdrawn: number;
  availableBalance: number;
  revenueBreakdown: Array<{
    role: 'seller' | 'referrer' | 'manager' | 'provider';
    totalAmount: number;
    bookingCount: number;
  }>;
  recentTransactions: Array<{
    id: number;
    type: 'BOOKING' | 'WITHDRAWAL';
    amount: number;
    status: string;
    createdAt: string;
    description: string;
  }>;
}

const WalletScreen = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading wallet data from revenue_ledger...');

      const walletInfo = await apiService.getWalletData();

      setWalletData(walletInfo);
      console.log('✅ Wallet data loaded:', walletInfo);
    } catch (error) {
      console.error('❌ Error loading wallet data:', error);
      Alert.alert('Lỗi', `Không thể tải thông tin ví: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#059669';
      case 'pending': return '#d97706';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Chờ xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'seller': return 'Người bán';
      case 'referrer': return 'Người giới thiệu';
      case 'manager': return 'Quản lý';
      case 'provider': return 'Nhà cung cấp';
      default: return role;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Đang tải thông tin ví...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!walletData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không thể tải thông tin ví</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadWalletData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ví của tôi</Text>
          <Text style={styles.headerSubtitle}>Quản lý doanh thu và giao dịch</Text>
        </View>

        {/* Revenue Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Tổng quan doanh thu</Text>

          <View style={styles.revenueCard}>
            <View style={styles.revenueItem}>
              <Text style={styles.revenueLabel}>Tổng doanh thu</Text>
              <Text style={styles.revenueAmount}>{formatCurrency(walletData.totalRevenue)}</Text>
            </View>

            <View style={styles.revenueDivider} />

            <View style={styles.revenueBreakdown}>
              <View style={styles.revenueBreakdownItem}>
                <Text style={styles.revenueBreakdownLabel}>✅ Đã xác nhận</Text>
                <Text style={[styles.revenueBreakdownAmount, { color: '#059669' }]}>
                  {formatCurrency(walletData.confirmedRevenue)}
                </Text>
              </View>

              <View style={styles.revenueBreakdownItem}>
                <Text style={styles.revenueBreakdownLabel}>⏳ Chờ xử lý</Text>
                <Text style={[styles.revenueBreakdownAmount, { color: '#d97706' }]}>
                  {formatCurrency(walletData.pendingRevenue)}
                </Text>
              </View>

              <View style={styles.revenueBreakdownItem}>
                <Text style={styles.revenueBreakdownLabel}>❌ Đã hủy</Text>
                <Text style={[styles.revenueBreakdownAmount, { color: '#dc2626' }]}>
                  {formatCurrency(walletData.cancelledRevenue)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Wallet Balance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Số dư ví thực tế</Text>

          <View style={styles.balanceCard}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(walletData.availableBalance)}</Text>
              <Text style={styles.balanceNote}>
                = Doanh thu đã xác nhận - Đã rút
              </Text>
            </View>

            <View style={styles.balanceDivider} />

            <View style={styles.balanceBreakdown}>
              <View style={styles.balanceBreakdownItem}>
                <Text style={styles.balanceBreakdownLabel}>Đã rút</Text>
                <Text style={styles.balanceBreakdownAmount}>
                  {formatCurrency(walletData.totalWithdrawn)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Revenue by Role */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Doanh thu theo vai trò</Text>

          {walletData.revenueBreakdown.map((item, index) => (
            <View key={index} style={styles.roleCard}>
              <View style={styles.roleInfo}>
                <Text style={styles.roleName}>{getRoleLabel(item.role)}</Text>
                <Text style={styles.roleBookings}>{item.bookingCount} booking</Text>
              </View>
              <Text style={styles.roleAmount}>{formatCurrency(item.totalAmount)}</Text>
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Giao dịch gần đây</Text>

          {walletData.recentTransactions.length > 0 ? (
            walletData.recentTransactions.slice(0, 10).map((transaction, index) => (
              <View key={index} style={styles.transactionCard}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>
                    +{formatCurrency(transaction.amount)}
                  </Text>
                  <View style={[
                    styles.transactionStatus,
                    { backgroundColor: getStatusColor(transaction.status) }
                  ]}>
                    <Text style={styles.transactionStatusText}>
                      {getStatusLabel(transaction.status)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyTransactions}>
              <Text style={styles.emptyTransactionsText}>Chưa có giao dịch nào</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bfdbfe',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  revenueCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  revenueItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  revenueLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  revenueDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  revenueBreakdown: {
    gap: 12,
  },
  revenueBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueBreakdownLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  revenueBreakdownAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  balanceNote: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  balanceDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  balanceBreakdown: {
    gap: 12,
  },
  balanceBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceBreakdownLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  balanceBreakdownAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  roleCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  roleBookings: {
    fontSize: 12,
    color: '#6b7280',
  },
  roleAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  transactionCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  transactionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  transactionStatusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  emptyTransactions: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
  },
  emptyTransactionsText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default WalletScreen;
