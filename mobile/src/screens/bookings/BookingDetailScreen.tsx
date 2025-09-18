import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../../services/api';
import { Booking } from '../../types';

interface BookingCommission {
  bookingId: number;
  bookingPrice: string;
  productName: string;
  userRoles: string[];
  userCommission: number;
  commissionDetails: Array<{
    role: string;
    amount: number;
    userId: number;
  }>;
  totalCommission: number;
  createdAt: string;
  status: string;
}

export default function BookingDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { booking } = route.params as { booking: Booking };
  
  const [loading, setLoading] = useState(true);
  const [commissionData, setCommissionData] = useState<BookingCommission | null>(null);

  useEffect(() => {
    loadCommissionData();
  }, []);

  // Hide tab bar when this screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({
          tabBarStyle: { display: 'none' }
        });
      }
      return () => {
        if (parent) {
          parent.setOptions({
            tabBarStyle: {
              display: 'flex',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              backgroundColor: 'white',
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
              paddingBottom: 8,
              paddingTop: 8,
            }
          });
        }
      };
    }, [navigation])
  );

  const loadCommissionData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading commission for booking:', booking.id);
      
      const data = await apiService.getMyCommissionForBooking(booking.id);
      console.log('✅ Commission data loaded:', data);
      
      setCommissionData(data);
    } catch (error: any) {
      console.error('❌ Error loading commission:', error);
      
      if (error.response?.status === 403) {
        Alert.alert('Thông báo', 'Bạn không có quyền xem hoa hồng của booking này');
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin hoa hồng');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'completed': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getRoleText = (role: string) => {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải thông tin hoa hồng...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#007AFF', '#0056CC']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Chi tiết Booking</Text>
        <Text style={styles.headerSubtitle}>#{booking.id}</Text>
      </LinearGradient>

      {/* Booking Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin Booking</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sản phẩm:</Text>
          <Text style={styles.infoValue}>{commissionData?.productName || booking.product?.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Giá trị:</Text>
          <Text style={styles.infoValue}>{formatCurrency(booking.price)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trạng thái:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngày tạo:</Text>
          <Text style={styles.infoValue}>{formatDate(booking.createdAt)}</Text>
        </View>

        {booking.customerName && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Khách hàng:</Text>
              <Text style={styles.infoValue}>{booking.customerName}</Text>
            </View>
            
            {booking.customerPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>SĐT:</Text>
                <Text style={styles.infoValue}>{booking.customerPhone}</Text>
              </View>
            )}
            
            {booking.customerEmail && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{booking.customerEmail}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Commission Info */}
      {commissionData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin Hoa hồng</Text>
          
          <View style={styles.commissionSummary}>
            <Text style={styles.commissionLabel}>Vai trò của bạn:</Text>
            <View style={styles.rolesContainer}>
              {commissionData.userRoles.map((role, index) => (
                <View key={index} style={styles.roleBadge}>
                  <Text style={styles.roleText}>{getRoleText(role)}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.commissionSummary}>
            <Text style={styles.commissionLabel}>Hoa hồng của bạn:</Text>
            <Text style={styles.commissionAmount}>
              {formatCurrency(commissionData.userCommission)}
            </Text>
          </View>
          
          <View style={styles.commissionSummary}>
            <Text style={styles.commissionLabel}>Tổng hoa hồng:</Text>
            <Text style={styles.totalCommission}>
              {formatCurrency(commissionData.totalCommission)}
            </Text>
          </View>

          {/* Commission Details */}
          <Text style={styles.detailsTitle}>Chi tiết hoa hồng:</Text>
          {commissionData.commissionDetails.map((detail, index) => (
            <View key={index} style={styles.commissionDetail}>
              <Text style={styles.detailRole}>{getRoleText(detail.role)}</Text>
              <Text style={styles.detailAmount}>{formatCurrency(detail.amount)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={loadCommissionData}>
        <Text style={styles.refreshButtonText}>Làm mới</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  commissionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  commissionLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  commissionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  totalCommission: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 4,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 12,
  },
  commissionDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  detailRole: {
    fontSize: 14,
    color: '#64748b',
  },
  detailAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
