import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { apiService } from '../../services/api';
import { Booking } from '../../types';

type BookingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BookingsScreen = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('pending');

  const filterOptions = [
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'confirmed', label: 'Đã duyệt' },
    { key: 'cancelled', label: 'Đã hủy' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'closed', label: 'Đã đóng' },
  ];

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyBookings();
      console.log('📊 Booking data loaded:', data);
      console.log('📊 Number of bookings:', data?.length);
      console.log('📊 First booking:', data?.[0]);
      setBookings(data || []);
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách booking');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const filteredBookings = bookings.filter(booking => {
    // Map backend status to filter
    const backendStatus = booking.status.toLowerCase();
    const statusMatch = backendStatus === selectedFilter;

    // Search filter
    if (searchQuery.trim() === '') {
      return statusMatch;
    }

    const searchLower = searchQuery.toLowerCase();
    const searchMatch =
      booking.customerName?.toLowerCase().includes(searchLower) ||
      booking.customerPhone?.toLowerCase().includes(searchLower) ||
      booking.customerEmail?.toLowerCase().includes(searchLower) ||
      booking.product?.name?.toLowerCase().includes(searchLower) ||
      booking.id.toString().includes(searchQuery);

    return statusMatch && searchMatch;
  });

  console.log('🔍 Filter debug:');
  console.log('  - Total bookings:', bookings.length);
  console.log('  - Selected filter:', selectedFilter);
  console.log('  - Filtered bookings:', filteredBookings.length);
  console.log('  - Booking statuses:', bookings.map(b => b.status));
  console.log('  - First filtered booking:', filteredBookings[0]);

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
        return '#10b981'; // Green
      case 'pending':
        return '#f59e0b'; // Orange
      case 'cancelled':
      case 'canceled':
        return '#ef4444'; // Red
      case 'closed':
        return '#6b7280'; // Gray
      case 'refunded':
        return '#8b5cf6'; // Purple
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'confirmed':
        return 'Đã duyệt';
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Chờ duyệt';
      case 'cancelled':
      case 'canceled':
        return 'Đã hủy';
      case 'closed':
        return 'Đã đóng';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  };

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate('BookingDetail', { booking });
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => handleBookingPress(item)}
    >
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingId}>Booking #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <View style={styles.bookingInfo}>
        {item.product && (
          <Text style={styles.productName}>{item.product.name}</Text>
        )}
        <Text style={styles.bookingPrice}>{formatCurrency(item.price)}</Text>
        <Text style={styles.bookingDate}>
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>

        {item.seller && (
          <Text style={styles.sellerInfo}>
            Người bán: {item.seller.fullName}
          </Text>
        )}

        {item.referrer && (
          <Text style={styles.referrerInfo}>
            Người giới thiệu: {item.referrer.fullName}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        Không có booking nào với trạng thái "{filterOptions.find(f => f.key === selectedFilter)?.label}"
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Đang tải booking...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Booking</Text>
          <Text style={styles.subtitle}>
            Tổng: {bookings.length} booking
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddBooking' as never)}
        >
          <Text style={styles.addButtonText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm booking (ID, tên KH, SĐT,...)"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

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
      <FlatList
        data={filteredBookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Booking Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => (navigation as any).navigate('CreateBooking', { productId: 1 })}
      >
        <Text style={styles.createButtonText}>+ Tạo Booking</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    margin: 16,
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
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
  bookingInfo: {
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  bookingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  sellerInfo: {
    fontSize: 14,
    color: '#64748b',
  },
  referrerInfo: {
    fontSize: 14,
    color: '#64748b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6b7280',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 'bold',
  },
});

export default BookingsScreen;
