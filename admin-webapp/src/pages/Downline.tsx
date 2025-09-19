import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'

interface DownlineUser {
  id: number
  fullName: string
  nickname?: string
  email?: string
  referralCode?: string
  role: string
  status: string
  createdAt: string
  totalRevenue: number
  totalBookings: number
  monthlyRevenue: number
  monthlyBookings: number
  currentRank?: {
    id: number
    name: string
  }
  totalReferrals: number
  activeReferrals: number
}

interface DownlineStats {
  totalMembers: number
  activeMembers: number
  totalRevenue: number
  monthlyRevenue: number
  totalBookings: number
  monthlyBookings: number
  topPerformers: DownlineUser[]
}

const Downline: React.FC = () => {
  const [downlineUsers, setDownlineUsers] = useState<DownlineUser[]>([])
  const [stats, setStats] = useState<DownlineStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'revenue' | 'bookings' | 'referrals'>('revenue')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('')

  useEffect(() => {
    loadDownlineData()
  }, [])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
  }

  const loadDownlineData = async () => {
    try {
      setLoading(true)
      const [downlineResponse, statsResponse] = await Promise.all([
        apiService.getMyDownline(),
        apiService.getDownlineStats()
      ])
      setDownlineUsers(downlineResponse)
      setStats(statsResponse)
    } catch (error) {
      showMessage('Không thể tải dữ liệu tuyến dưới', 'error')
      console.error('Error loading downline data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format price function
  const formatPrice = (price: number | null | undefined) => {
    if (!price || price === 0) return '0 VND';

    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`;
    } else {
      return `${price.toLocaleString()} VND`;
    }
  };

  // Filter and sort users
  const getFilteredAndSortedUsers = () => {
    let filtered = downlineUsers.filter(user =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.monthlyRevenue - a.monthlyRevenue
        case 'bookings':
          return b.monthlyBookings - a.monthlyBookings
        case 'referrals':
          return b.totalReferrals - a.totalReferrals
        default:
          return 0
      }
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý tuyến dưới</h1>
        <button
          onClick={loadDownlineData}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalMembers}</div>
              <div className="text-sm text-gray-500">Tổng thành viên</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeMembers}</div>
              <div className="text-sm text-gray-500">Thành viên hoạt động</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{formatPrice(stats.totalRevenue)}</div>
              <div className="text-sm text-gray-500">Tổng doanh thu</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{formatPrice(stats.monthlyRevenue)}</div>
              <div className="text-sm text-gray-500">Doanh thu tháng</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.totalBookings}</div>
              <div className="text-sm text-gray-500">Tổng booking</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{stats.monthlyBookings}</div>
              <div className="text-sm text-gray-500">Booking tháng</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Sort */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, nickname, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'revenue' | 'bookings' | 'referrals')}
              className="select"
            >
              <option value="revenue">Sắp xếp theo doanh thu</option>
              <option value="bookings">Sắp xếp theo booking</option>
              <option value="referrals">Sắp xếp theo giới thiệu</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {getFilteredAndSortedUsers().length} / {downlineUsers.length} thành viên
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-64">Thông tin thành viên</th>
                <th>Hạng</th>
                <th>Doanh số tháng</th>
                <th>Booking tháng</th>
                <th>Tổng doanh thu</th>
                <th>Tổng booking</th>
                <th>Giới thiệu</th>
                <th>Trạng thái</th>
                <th>Ngày tham gia</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredAndSortedUsers().map((user) => (
                <tr key={user.id}>
                  <td className="w-64">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {user.fullName}
                      </div>
                      {user.nickname && (
                        <div className="text-xs text-blue-600 font-medium">
                          @{user.nickname}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {user.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        Mã: {user.referralCode}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {user.currentRank?.name || 'Chưa có hạng'}
                    </span>
                  </td>
                  <td>
                    <div className="font-semibold text-green-600">
                      {formatPrice(user.monthlyRevenue)}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium text-blue-600">
                      {user.monthlyBookings}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium text-purple-600">
                      {formatPrice(user.totalRevenue)}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium text-indigo-600">
                      {user.totalBookings}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <div className="font-medium">{user.totalReferrals}</div>
                      <div className="text-gray-500">({user.activeReferrals} hoạt động)</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      user.status === 'ACTIVE' 
                        ? 'badge-success' 
                        : 'badge-danger'
                    }`}>
                      {user.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {getFilteredAndSortedUsers().length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {downlineUsers.length === 0 
            ? 'Bạn chưa có thành viên tuyến dưới nào' 
            : 'Không tìm thấy thành viên nào phù hợp'
          }
        </div>
      )}
    </div>
  )
}

export default Downline
