import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { message } from 'antd'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: 'http://192.168.1.14:3000', // Backend URL
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('admin_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  setAuthToken(token: string) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.api.defaults.headers.common['Authorization']
    }
  }

  // Generic methods
  async get(url: string, params?: any) {
    return this.api.get(url, { params })
  }

  async post(url: string, data?: any) {
    return this.api.post(url, data)
  }

  async put(url: string, data?: any) {
    return this.api.put(url, data)
  }

  async patch(url: string, data?: any) {
    return this.api.patch(url, data)
  }

  async delete(url: string) {
    return this.api.delete(url)
  }

  // User management
  async getUsers(page = 1, limit = 20) {
    return this.get('/admin/users', { page, limit })
  }

  async createUser(userData: any) {
    return this.post('/admin/users', userData)
  }

  async getUser(id: number) {
    return this.get(`/admin/users/${id}`)
  }

  async updateUserStatus(id: number, status: string) {
    return this.patch(`/admin/users/${id}/status`, { status })
  }

  async updateUserRole(id: number, role: string) {
    return this.patch(`/admin/users/${id}/role`, { role })
  }

  async assignUserManager(id: number, managerId: number | null) {
    return this.patch(`/admin/users/${id}/manager`, { managerId })
  }

  // Rank management
  async getRanks() {
    return this.get('/admin/ranks')
  }

  async createRank(data: any) {
    return this.post('/admin/ranks', data)
  }

  async updateRank(id: number, data: any) {
    return this.patch(`/admin/ranks/${id}`, data)
  }

  async deleteRank(id: number) {
    return this.delete(`/admin/ranks/${id}`)
  }

  async getRankShares(rankId: number) {
    return this.get(`/admin/ranks/${rankId}/shares`)
  }

  async updateRankShares(rankId: number, shares: any[]) {
    return this.patch(`/admin/ranks/${rankId}/shares`, { shares })
  }

  // User rank assignment
  async getUserRanks(userId: number) {
    return this.get(`/admin/users/${userId}/ranks`)
  }

  async assignUserRank(userId: number, rankId: number) {
    return this.post(`/admin/users/${userId}/ranks`, { rankId })
  }

  async removeUserRank(userId: number, rankId: number) {
    return this.delete(`/admin/users/${userId}/ranks/${rankId}`)
  }

  // Products
  async getProducts(status?: string) {
    return this.get('/admin/products', { status })
  }

  async updateProductStatus(id: number, status: string) {
    return this.patch(`/admin/products/${id}/status`, { status })
  }

  // Bookings
  async getBookings(status?: string) {
    return this.get('/admin/bookings', { status })
  }

  async updateBookingStatus(id: number, status: string) {
    return this.patch(`/admin/bookings/${id}/status`, { status })
  }

  // Wallets
  async getWallets(page = 1, limit = 20) {
    return this.get('/admin/wallets', { page, limit })
  }

  async getWalletStats() {
    return this.get('/admin/wallets/stats')
  }

  async createWalletAdjustment(data: any) {
    return this.post('/admin/wallet-adjustments', data)
  }

  // Revenue APIs
  async getRevenueStats(): Promise<any> {
    const response = await this.api.get('/admin/revenue/stats')
    return response.data
  }

  async getAllRevenueEntries(page = 1, limit = 50): Promise<any> {
    const response = await this.api.get('/admin/revenue/entries', { params: { page, limit } })
    return response.data
  }

  async getUserTotalRevenue(userId: number): Promise<any> {
    const response = await this.api.get(`/revenue/user/${userId}/total`)
    return response.data
  }

  async getUserRevenueByRole(userId: number): Promise<any> {
    const response = await this.api.get(`/revenue/user/${userId}/by-role`)
    return response.data
  }

  async getUserRevenueHistory(userId: number): Promise<any> {
    const response = await this.api.get(`/revenue/user/${userId}/history`)
    return response.data
  }

  async recalculateAllRevenue(): Promise<any> {
    const response = await this.api.post('/admin/revenue/recalculate')
    return response.data
  }

  // Fast commission query from revenue_ledger
  async getBookingCommissionFromLedger(bookingId: number): Promise<any> {
    const response = await this.api.get(`/admin/bookings/${bookingId}/commission-ledger`)
    return response.data
  }
}

export const apiService = new ApiService()
export default apiService
