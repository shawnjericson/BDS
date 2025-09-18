import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  AuthUser,
  Product,
  Booking,
  Wallet,
  WalletTransaction,
  LoginForm,
  RegisterForm,
  CreateProductForm,
  CreateBookingForm,
  PaginatedResponse,
  ApiError
} from '../types';
import { API_BASE_URL } from '../config/api.config';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        console.log('🔑 API Request:', config.method?.toUpperCase(), config.url);
        console.log('🔑 Token exists:', !!token);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token added to headers:', token.substring(0, 20) + '...');
        }
        return config;
      },
      (error) => {
        console.error('🔑 Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.error('❌ API Error:', error.response?.status, error.config?.url);
        console.error('❌ Error message:', error.message);
        if (error.response?.data) {
          console.error('❌ Error data:', error.response.data);
        }
        if (error.response?.status === 401) {
          // Token expired, clear storage and redirect to login
          await AsyncStorage.multiRemove(['access_token', 'user']);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth APIs
  async login(credentials: LoginForm): Promise<AuthUser> {
    const response = await this.api.post<AuthUser>('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterForm): Promise<User> {
    const response = await this.api.post<User>('/auth/register', userData);
    return response.data;
  }

  async validateReferralCode(code: string): Promise<boolean> {
    const response = await this.api.get<boolean>(`/users/validate-referral/${code}`);
    return response.data;
  }

  // User APIs
  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/users/me');
    return response.data;
  }

  async getDashboardStats(): Promise<{
    totalMonthlyRevenue: number;
    availableCommission: number;
    pendingBookings: number;
    monthlyPerformance: number;
    walletBalance: number;
  }> {
    const response = await this.api.get('/users/me/dashboard-stats');
    return response.data;
  }

  async getUserRevenue(): Promise<{
    userId: number;
    fullName: string;
    email: string | null;
    totalRevenue: number;
    totalWithdrawn: number;
    availableBalance: number;
    totalBookings: number;
    revenueBreakdown: Array<{
      role: 'seller' | 'referrer' | 'manager' | 'provider';
      totalAmount: number;
      bookingCount: number;
      averagePerBooking: number;
    }>;
    recentBookings: Array<{
      bookingId: number;
      productName: string;
      role: 'seller' | 'referrer' | 'manager' | 'provider';
      amount: number;
      bookingDate: string;
      status: string;
    }>;
  }> {
    const response = await this.api.get('/users/revenue');
    return response.data;
  }

  async getUserRevenueSummary(): Promise<{
    userId: number;
    fullName: string;
    totalRevenue: number;
    availableBalance: number;
    totalBookings: number;
    lastBookingDate?: string;
  }> {
    const response = await this.api.get('/users/revenue-summary');
    return response.data;
  }

  async getUserTotalRevenue(userId: number): Promise<number> {
    try {
      const response = await this.api.get(`/revenue/user/${userId}/total`);
      return response.data.totalRevenue || 0;
    } catch (error) {
      console.error(`Error getting revenue for user ${userId}:`, error);
      return 0;
    }
  }

  async getWalletData(): Promise<{
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
  }> {
    try {
      const response = await this.api.get('/users/wallet');
      return response.data;
    } catch (error) {
      console.error('Error getting wallet data:', error);
      throw error;
    }
  }

  async testWalletEndpoint(): Promise<any> {
    try {
      const response = await this.api.get('/users/wallet-test');
      return response.data;
    } catch (error) {
      console.error('Error testing wallet endpoint:', error);
      throw error;
    }
  }

  async testWalletPublic(): Promise<any> {
    try {
      const response = await this.api.get('/users/wallet-test-public');
      return response.data;
    } catch (error) {
      console.error('Error testing public wallet endpoint:', error);
      throw error;
    }
  }

  // Product APIs
  async getProducts(status?: string, page = 1, limit = 20): Promise<Product[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    // Note: Backend doesn't support pagination yet, so we ignore page/limit

    const response = await this.api.get<Product[]>(`/products?${params}`);
    return response.data;
  }

  async getApprovedProducts(): Promise<Product[]> {
    const response = await this.api.get<Product[]>('/products/approved');
    return response.data;
  }

  async getMyProducts(): Promise<Product[]> {
    const response = await this.api.get<Product[]>('/products/my-products');
    return response.data;
  }

  async getProduct(id: number): Promise<Product> {
    const response = await this.api.get<Product>(`/products/${id}`);
    return response.data;
  }

  async createProduct(productData: CreateProductForm): Promise<Product> {
    const response = await this.api.post<Product>('/products', productData);
    return response.data;
  }

  async updateProduct(id: number, productData: Partial<CreateProductForm>): Promise<Product> {
    const response = await this.api.patch<Product>(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await this.api.delete(`/products/${id}`);
  }

  // Booking APIs
  async getBookings(status?: string, page = 1, limit = 20): Promise<PaginatedResponse<Booking>> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await this.api.get<PaginatedResponse<Booking>>(`/bookings?${params}`);
    return response.data;
  }

  async getMyBookings(): Promise<Booking[]> {
    const response = await this.api.get<Booking[]>('/bookings/my-bookings');
    return response.data;
  }

  async getBooking(id: number): Promise<Booking> {
    const response = await this.api.get<Booking>(`/bookings/${id}`);
    return response.data;
  }

  async createBooking(bookingData: CreateBookingForm): Promise<Booking> {
    const response = await this.api.post<Booking>('/bookings', bookingData);
    return response.data;
  }

  async getMyCommissionForBooking(bookingId: number): Promise<any> {
    const response = await this.api.get(`/bookings/${bookingId}/my-commission`);
    return response.data;
  }

  async updateBookingStatus(id: number, status: string, reason?: string): Promise<Booking> {
    const response = await this.api.patch<Booking>(`/bookings/${id}`, { status, reason });
    return response.data;
  }

  async deleteBooking(id: number): Promise<void> {
    await this.api.delete(`/bookings/${id}`);
  }

  // Wallet APIs
  async getWalletSummary(): Promise<{
    wallet: Wallet;
    recentTransactions: WalletTransaction[];
    earningsByType: Array<{ type: string; total: number }>;
  }> {
    const response = await this.api.get('/wallets/me/summary');
    return response.data;
  }

  async getWalletTransactions(page = 1, limit = 20): Promise<PaginatedResponse<WalletTransaction>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await this.api.get<PaginatedResponse<WalletTransaction>>(`/wallets/me/transactions?${params}`);
    return response.data;
  }

  async getTransactionsByType(type: string): Promise<WalletTransaction[]> {
    const response = await this.api.get<WalletTransaction[]>(`/wallets/me/transactions/type/${type}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
