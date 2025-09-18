import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'

interface RevenueEntry {
  id: number
  userId: number
  bookingId: number
  role: 'seller' | 'referrer' | 'manager' | 'provider'
  amount: number
  createdAt: string
  user: {
    id: number
    fullName: string
    email: string
  }
  booking: {
    id: number
    price: number
    status: string
    product: {
      name: string
    }
  } | null
}

interface RevenueStats {
  totalRevenue: number
  confirmedRevenue: number
  pendingRevenue: number
  cancelledRevenue: number
  totalUsers: number
  totalBookings: number
}

function Revenue() {
  const [revenues, setRevenues] = useState<RevenueEntry[]>([])
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    loadRevenues()
    loadStats()
  }, [])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
  }

  const loadRevenues = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAllRevenueEntries(1, 100)
      setRevenues(response.entries || [])
    } catch (error) {
      showMessage('Không thể tải dữ liệu doanh thu', 'error')
      console.error('Error loading revenues:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiService.getRevenueStats()

      // Transform the response to match our interface
      const confirmedRevenue = response.revenueByStatus?.find((s: any) => s.status === 'COMPLETED')?.amount || 0
      const pendingRevenue = response.revenueByStatus?.find((s: any) => s.status === 'PENDING')?.amount || 0
      const cancelledRevenue = response.revenueByStatus?.find((s: any) => s.status === 'CANCELLED')?.amount || 0

      const transformedStats: RevenueStats = {
        totalRevenue: response.totalRevenue || 0,
        confirmedRevenue,
        pendingRevenue,
        cancelledRevenue,
        totalUsers: response.totalUsers || 0,
        totalBookings: response.totalBookings || 0
      }
      setStats(transformedStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)}B`
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `${(price / 1000).toFixed(1)}K`
    return price.toString()
  }

  const getFilteredRevenues = () => {
    return revenues.filter(revenue => {
      const matchesSearch = !searchTerm ||
        revenue.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        revenue.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (revenue.booking?.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = !roleFilter || revenue.role === roleFilter
      const matchesStatus = !statusFilter || revenue.booking?.status === statusFilter
      
      return matchesSearch && matchesRole && matchesStatus
    })
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'seller': return 'Người bán'
      case 'referrer': return 'Người giới thiệu'
      case 'manager': return 'Quản lý'
      case 'provider': return 'Chủ sở hữu'
      default: return role
    }
  }

  if (loading && revenues.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý doanh thu</h1>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              <div className="text-center">
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Loading */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>

        {/* Table Loading */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
          <div className="p-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý doanh thu</h1>
        <button
          onClick={() => { loadRevenues(); loadStats(); }}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</div>
              <div className="text-sm text-gray-500">Tổng doanh thu</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{formatPrice(stats.confirmedRevenue)}</div>
              <div className="text-sm text-gray-500">Đã xác nhận</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600">{formatPrice(stats.pendingRevenue)}</div>
              <div className="text-sm text-gray-500">Chờ xử lý</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{formatPrice(stats.cancelledRevenue)}</div>
              <div className="text-sm text-gray-500">Đã hủy</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{stats.totalUsers}</div>
              <div className="text-sm text-gray-500">Người dùng</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{stats.totalBookings}</div>
              <div className="text-sm text-gray-500">Booking</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Tìm kiếm người dùng, sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả vai trò</option>
              <option value="seller">Người bán</option>
              <option value="referrer">Người giới thiệu</option>
              <option value="manager">Quản lý</option>
              <option value="provider">Chủ sở hữu</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            {getFilteredRevenues().length} / {revenues.length} bản ghi
          </div>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-3 py-3 text-center">ID</th>
                <th className="border border-gray-200 px-3 py-3 text-center">Người dùng</th>
                <th className="border border-gray-200 px-3 py-3 text-center">Booking</th>
                <th className="border border-gray-200 px-3 py-3 text-center">Vai trò</th>
                <th className="border border-gray-200 px-3 py-3 text-center">Số tiền</th>
                <th className="border border-gray-200 px-3 py-3 text-center">Trạng thái</th>
                <th className="border border-gray-200 px-3 py-3 text-center">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredRevenues().map((revenue) => (
                <tr key={revenue.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-3 py-3 text-center">#{revenue.id}</td>
                  <td className="border border-gray-200 px-3 py-3 text-center">
                    <div className="text-xs">
                      <div className="font-medium">{revenue.user.fullName}</div>
                      <div className="text-gray-500">{revenue.user.email}</div>
                    </div>
                  </td>
                  <td className="border border-gray-200 px-3 py-3 text-center">
                    <div className="text-xs">
                      <div className="font-medium">#{revenue.bookingId}</div>
                      <div className="text-gray-500">{revenue.booking?.product?.name || 'N/A'}</div>
                      <div className="text-green-600">{formatPrice(revenue.booking?.price || 0)} VND</div>
                    </div>
                  </td>
                  <td className="border border-gray-200 px-3 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      revenue.role === 'seller' ? 'bg-blue-100 text-blue-700' :
                      revenue.role === 'referrer' ? 'bg-green-100 text-green-700' :
                      revenue.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {getRoleText(revenue.role)}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-3 py-3 text-center">
                    <span className="font-medium text-green-600">
                      {formatPrice(revenue.amount)} VND
                    </span>
                  </td>
                  <td className="border border-gray-200 px-3 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      revenue.booking?.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      revenue.booking?.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {revenue.booking?.status === 'COMPLETED' ? 'Hoàn thành' :
                       revenue.booking?.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ xử lý'}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-3 py-3 text-center text-xs text-gray-500">
                    {new Date(revenue.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Revenue
