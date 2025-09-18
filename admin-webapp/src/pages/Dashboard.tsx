import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'

interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalBookings: number
  totalWalletBalance: number
  recentUsers: any[]
  recentBookings: any[]
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalBookings: 0,
    totalWalletBalance: 0,
    recentUsers: [],
    recentBookings: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load basic stats
      const [usersRes, productsRes, bookingsRes, walletsRes] = await Promise.all([
        apiService.getUsers(1, 1),
        apiService.getProducts(),
        apiService.getBookings(),
        apiService.getWalletStats()
      ])

      // Load recent data
      const [recentUsersRes, recentBookingsRes] = await Promise.all([
        apiService.getUsers(1, 5),
        apiService.getBookings()
      ])

      setStats({
        totalUsers: usersRes.data.pagination?.total || usersRes.data.data?.length || 0,
        totalProducts: productsRes.data.length || 0,
        totalBookings: bookingsRes.data.length || 0,
        totalWalletBalance: walletsRes.data.totalBalance || 0,
        recentUsers: recentUsersRes.data.data || [],
        recentBookings: (recentBookingsRes.data || []).slice(0, 5)
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users Loading */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings Loading */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-600">Thống kê tổng quan về hệ thống BDS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Tổng booking</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Tổng số dư ví</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalWalletBalance.toLocaleString()} VND
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-yellow-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Người dùng mới nhất</h3>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className={`badge ${
                  user.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'
                }`}>
                  {user.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking gần đây</h3>
          <div className="space-y-3">
            {stats.recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    #{booking.id} - {booking.product?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.price?.toLocaleString()} VND
                  </p>
                </div>
                <span className={`badge ${
                  booking.status === 'CONFIRMED' 
                    ? 'badge-success' 
                    : booking.status === 'PENDING' 
                    ? 'badge-warning' 
                    : 'badge-danger'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Quản lý người dùng</h4>
            <p className="text-sm text-gray-500 mt-1">Xem và quản lý tài khoản người dùng</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Quản lý sản phẩm</h4>
            <p className="text-sm text-gray-500 mt-1">Duyệt và quản lý sản phẩm BDS</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Quản lý cấp bậc</h4>
            <p className="text-sm text-gray-500 mt-1">Cấu hình cấp bậc và hoa hồng</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
