import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { useAuthStore } from '../../stores/authStore';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Hồ sơ
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 5 }}>
        Tên: {user?.fullName}
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 5 }}>
        Email: {user?.email}
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        Mã: {user?.referralCode}
      </Text>

      <TouchableOpacity
        style={{ padding: 15, backgroundColor: '#f0f0f0', marginBottom: 10, borderRadius: 8 }}
        onPress={() => {}}
      >
        <Text style={{ fontSize: 16 }}>Thông tin cá nhân</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ padding: 15, backgroundColor: '#f0f0f0', marginBottom: 10, borderRadius: 8 }}
        onPress={() => {}}
      >
        <Text style={{ fontSize: 16 }}>Cài đặt</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ padding: 15, backgroundColor: '#f0f0f0', marginBottom: 10, borderRadius: 8 }}
        onPress={() => {}}
      >
        <Text style={{ fontSize: 16 }}>Hỗ trợ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ padding: 15, backgroundColor: '#f0f0f0', marginBottom: 10, borderRadius: 8 }}
        onPress={() => {}}
      >
        <Text style={{ fontSize: 16 }}>Về ứng dụng</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ padding: 15, backgroundColor: '#ff4444', marginBottom: 10, borderRadius: 8 }}
        onPress={handleLogout}
      >
        <Text style={{ fontSize: 16, color: '#fff', textAlign: 'center' }}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;
