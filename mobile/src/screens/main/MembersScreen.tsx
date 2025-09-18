import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { User } from '../../types';

const MembersScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [members, setMembers] = useState<User[]>([]);
  const [memberRevenues, setMemberRevenues] = useState<{[key: number]: number}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMembers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading referred members...');

      // Get current user with referrals
      const currentUser = await apiService.getCurrentUser();
      console.log('👥 Current user referrals:', currentUser.referrals?.length || 0);

      if (currentUser.referrals && currentUser.referrals.length > 0) {
        // Map referrals to User format
        const referredMembers: User[] = currentUser.referrals.map((referral: any) => ({
          id: referral.id,
          fullName: referral.fullName,
          email: referral.email,
          role: 'EMPLOYEE', // Default role for referred users
          status: 'ACTIVE', // Default status
          referralCode: referral.referralCode || 'N/A',
          createdAt: referral.createdAt,
          updatedAt: referral.createdAt,
        }));

        setMembers(referredMembers);
        console.log('✅ Loaded referred members:', referredMembers.length);

        // Load revenue for each member
        await loadMemberRevenues(referredMembers);
      } else {
        setMembers([]);
        console.log('ℹ️ No referred members found');
      }
    } catch (error) {
      console.error('❌ Error loading members:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách thành viên được giới thiệu');
      setMembers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMemberRevenues = async (memberList: User[]) => {
    try {
      const revenuePromises = memberList.map(async (member) => {
        try {
          const revenue = await apiService.getUserTotalRevenue(member.id);
          return { userId: member.id, revenue };
        } catch (error) {
          console.error(`Error loading revenue for user ${member.id}:`, error);
          return { userId: member.id, revenue: 0 };
        }
      });

      const revenueResults = await Promise.all(revenuePromises);
      const revenueMap: {[key: number]: number} = {};

      revenueResults.forEach(({ userId, revenue }) => {
        revenueMap[userId] = revenue;
      });

      setMemberRevenues(revenueMap);
    } catch (error) {
      console.error('❌ Error loading member revenues:', error);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMembers();
  };

  const renderMember = ({ item }: { item: User }) => {
    const memberRevenue = memberRevenues[item.id] || 0;

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{item.fullName}</Text>
            <Text style={styles.memberEmail}>{item.email}</Text>
            <Text style={styles.memberDate}>
              Tham gia: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
            <Text style={styles.memberRevenue}>
              Tổng doanh thu: {memberRevenue.toLocaleString('vi-VN')} VND
            </Text>
            {item.referralCode && item.referralCode !== 'N/A' && (
              <Text style={styles.referralCode}>
                Mã giới thiệu của họ: {item.referralCode}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Được giới thiệu</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>Chưa có ai sử dụng mã giới thiệu của bạn</Text>
      <Text style={styles.emptySubText}>
        Chia sẻ mã giới thiệu của bạn: {user?.referralCode || 'N/A'}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thành viên được giới thiệu</Text>
        <Text style={styles.subtitle}>
          Tổng: {members.length} người đã sử dụng mã giới thiệu của bạn
        </Text>
        <Text style={styles.referralInfo}>
          Mã giới thiệu của bạn: {user?.referralCode || 'N/A'}
        </Text>
      </View>

      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 30,
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
    marginBottom: 8,
  },
  referralInfo: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  listContainer: {
    padding: 16,
  },
  memberCard: {
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
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  memberDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  referralCode: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  memberRevenue: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginTop: 4,
  },
});

export default MembersScreen;
