import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthUser, LoginForm, RegisterForm } from '../types';
import { apiService } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  validateReferralCode: (code: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginForm) => {
    try {
      set({ isLoading: true, error: null });
      
      const authUser: AuthUser = await apiService.login(credentials);
      
      // Store token and user data
      await AsyncStorage.setItem('access_token', authUser.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(authUser.user));

      set({
        user: authUser.user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (userData: RegisterForm) => {
    try {
      set({ isLoading: true, error: null });
      
      const user: User = await apiService.register(userData);
      
      set({ isLoading: false });
      
      // After successful registration, automatically login
      await get().login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      
      // Clear storage
      await AsyncStorage.multiRemove(['access_token', 'user']);
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      
      const [token, userData] = await AsyncStorage.multiGet(['access_token', 'user']);
      
      if (token[1] && userData[1]) {
        const user = JSON.parse(userData[1]);
        
        // Verify token is still valid by fetching current user
        try {
          const currentUser = await apiService.getCurrentUser();
          set({ 
            user: currentUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          // Token is invalid, clear storage
          await AsyncStorage.multiRemove(['access_token', 'user']);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  validateReferralCode: async (code: string): Promise<boolean> => {
    try {
      return await apiService.validateReferralCode(code);
    } catch (error) {
      return false;
    }
  },
}));
