// User Types
export interface User {
  id: number;
  fullName: string;
  email: string;
  referralCode: string;
  status: string;
  role?: string;
  createdAt: string;
  updatedAt?: string;
  referrals?: {
    id: number;
    fullName: string;
    email: string;
    referralCode?: string;
    createdAt: string;
  }[];
}

export interface AuthUser extends User {
  access_token: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  images?: string | string[]; // Can be JSON string from API or parsed array
  commissionPct: number | string; // API returns string, but we handle both
  providerDesiredPct: number | string; // API returns string, but we handle both
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    fullName: string;
    email: string;
  };
  ownerUserId?: number; // Additional field from API
  _count?: any; // Additional field from API
}

export enum ProductStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Booking Types
export interface Booking {
  id: number;
  productId: number;
  sellerUserId?: number;
  referrerUserId?: number;
  managerUserId?: number;
  price: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  product?: Product;
  seller?: User;
  referrer?: User;
  manager?: User;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

// Wallet Types
export interface Wallet {
  id: number;
  userId: number;
  balance: number;
  user?: User;
}

export interface WalletTransaction {
  id: number;
  walletId: number;
  amount: number;
  type: TransactionType;
  refId?: number;
  description?: string;
  balanceAfter: number;
  createdAt: string;
  creator?: {
    id: number;
    fullName: string;
  };
}

export enum TransactionType {
  COMMISSION_DIRECT = 'COMMISSION_DIRECT',
  COMMISSION_REFERRAL = 'COMMISSION_REFERRAL',
  ADJUSTMENT_CREDIT = 'ADJUSTMENT_CREDIT',
  ADJUSTMENT_DEBIT = 'ADJUSTMENT_DEBIT',
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  referralCode: string;
}

export interface CreateProductForm {
  name: string;
  description: string;
  price: number;
  images: string;
  commissionPercentage: number;
  providerDesiredPercentage: number;
}

export interface CreateBookingForm {
  productId: number;
  price: number;
  sellerUserId?: number;
  referrerUserId?: number;
  managerUserId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ProductDetail: { productId: number };
  CreateProduct: undefined;
  CreateBooking: undefined;
  AddBooking: undefined;
  BookingDetail: { booking: Booking };
  WalletDetail: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Bookings: undefined;
  Members: undefined;
  Wallet: undefined;
};

// Error Types
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
