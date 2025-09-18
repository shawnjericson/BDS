import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'

interface User {
  id: number
  fullName: string
  email: string
  status: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('admin_token')
      if (token) {
        try {
          apiService.setAuthToken(token)
          console.log('Verifying token...')
          // Verify token and get user info
          const response = await apiService.get('/users/me')
          console.log('Token verification successful:', response.data)
          setUser(response.data)
        } catch (error: any) {
          console.log('Token verification failed:', error.response?.status, error.response?.data)
          // Token is invalid, clear it
          localStorage.removeItem('admin_token')
          apiService.setAuthToken('')
          setUser(null)
        }
      }
      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.post('/auth/login', { email, password })
      const { access_token, user: userData } = response.data
      
      localStorage.setItem('admin_token', access_token)
      apiService.setAuthToken(access_token)
      setUser(userData)
      
      return true
    } catch (error: any) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    apiService.setAuthToken('')
    setUser(null)
    console.log('Đăng xuất thành công!')
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
