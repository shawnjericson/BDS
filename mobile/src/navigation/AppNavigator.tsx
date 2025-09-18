import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';

import { useAuthStore } from '../stores/authStore';
import { RootStackParamList, MainTabParamList } from '../types';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProductsScreen from '../screens/main/ProductsScreen';
import BookingsScreen from '../screens/main/BookingsScreen';
import WalletScreen from '../screens/main/WalletScreen';
import MembersScreen from '../screens/main/MembersScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import CreateProductScreen from '../screens/main/CreateProductScreen';
import CreateBookingScreen from '../screens/main/CreateBookingScreen';
import AddBookingScreen from '../screens/bookings/AddBookingScreen';
import BookingDetailScreen from '../screens/bookings/BookingDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Loading component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#3b82f6" />
  </View>
);

// Auth Stack Navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Tab Icon Component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <View style={{
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: focused ? '#3b82f6' : '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <Text style={{
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    }}>
      {name.charAt(0)}
    </Text>
  </View>
);



// Bottom Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingBottom: 45, // Tăng padding nhiều hơn để tránh 3 nút navigation
        paddingTop: 8,
        height: 125, // Tăng height để có đủ không gian
        position: 'absolute',
        bottom: 0,
      },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: '#64748b',
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ focused }) => <TabIcon name="D" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Products"
      component={ProductsScreen}
      options={{
        tabBarLabel: 'Sản phẩm',
        tabBarIcon: ({ focused }) => <TabIcon name="S" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Bookings"
      component={BookingsScreen}
      options={{
        tabBarLabel: 'Booking',
        tabBarIcon: ({ focused }) => <TabIcon name="B" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Members"
      component={MembersScreen}
      options={{
        tabBarLabel: 'Thành viên',
        tabBarIcon: ({ focused }) => <TabIcon name="T" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Wallet"
      component={WalletScreen}
      options={{
        tabBarLabel: 'Ví',
        tabBarIcon: ({ focused }) => <TabIcon name="V" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

// Main Stack Navigator with Tabs
const MainNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={MainTabNavigator} />
    <Stack.Screen
      name="ProductDetail"
      component={ProductDetailScreen}
      options={{
        headerShown: true,
        title: 'Chi tiết sản phẩm',
        headerStyle: { backgroundColor: '#3b82f6' },
        headerTintColor: '#fff'
      }}
    />
    <Stack.Screen
      name="CreateProduct"
      component={CreateProductScreen}
      options={{
        headerShown: true,
        title: 'Tạo sản phẩm',
        headerStyle: { backgroundColor: '#3b82f6' },
        headerTintColor: '#fff'
      }}
    />
    <Stack.Screen
      name="CreateBooking"
      component={CreateBookingScreen}
      options={{
        headerShown: true,
        title: 'Tạo booking',
        headerStyle: { backgroundColor: '#3b82f6' },
        headerTintColor: '#fff'
      }}
    />
    <Stack.Screen
      name="AddBooking"
      component={AddBookingScreen}
      options={{
        headerShown: true,
        title: 'Thêm Booking',
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff'
      }}
    />
    <Stack.Screen
      name="BookingDetail"
      component={BookingDetailScreen}
      options={{
        headerShown: false,
        title: 'Chi tiết Booking'
      }}
    />
  </Stack.Navigator>
);

// Root App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
