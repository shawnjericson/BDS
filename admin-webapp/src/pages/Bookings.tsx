import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'

interface Booking {
  id: number
  price: number
  status: string
  createdAt: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  product?: {
    id: number
    name: string
    owner?: {
      id: number
      fullName: string
      email: string
    }
  }
  seller?: any
  referrer?: any
  manager?: any
}

function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBookings, setSelectedBookings] = useState<number[]>([])
  const [bulkStatus, setBulkStatus] = useState('')
  const [commissionData, setCommissionData] = useState<{[key: number]: any}>({})
  const [loadingCommissions, setLoadingCommissions] = useState<{[key: number]: boolean}>({})

  // Load commission data for a booking from revenue_ledger (fast)
  const loadCommissionData = async (bookingId: number) => {
    if (commissionData[bookingId] || loadingCommissions[bookingId]) return

    try {
      setLoadingCommissions(prev => ({ ...prev, [bookingId]: true }))
      console.log(`🔍 Loading commission from ledger for booking ${bookingId}`)
      const data = await apiService.getBookingCommissionFromLedger(bookingId)
      console.log(`✅ Commission data from ledger for booking ${bookingId}:`, data)
      setCommissionData(prev => ({ ...prev, [bookingId]: data }))
    } catch (error) {
      console.error(`❌ Error loading commission from ledger for booking ${bookingId}:`, error)
    } finally {
      setLoadingCommissions(prev => ({ ...prev, [bookingId]: false }))
    }
  }

  // Helper to format commission display
  const formatCommission = (commissionPct: number, amount?: number) => {
    const percentage = (commissionPct * 100).toFixed(4)
    if (amount) {
      return `${percentage}% (${formatPrice(amount)})`
    }
    return `${percentage}%`
  }

  // Calculate commission amount from percentage
  const calculateCommissionAmount = (price: number, commissionPct: number, providerDesiredPct: number, role: 'provider' | 'seller' | 'referrer' | 'manager') => {
    const totalCommission = price * commissionPct

    if (role === 'provider') {
      return totalCommission * (providerDesiredPct / commissionPct)
    }

    // For other roles, we need rank data which we don't have in commission-info
    // Return estimated based on typical distribution
    const remainingCommission = totalCommission * (1 - providerDesiredPct / commissionPct)
    const roleShare = role === 'seller' ? 0.6 : role === 'referrer' ? 0.25 : 0.15 // Estimated
    return remainingCommission * roleShare
  }

  // Helper function to format price
  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}B`
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`
    }
    return price.toLocaleString()
  }

  useEffect(() => {
    loadBookings()
  }, [statusFilter])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
  }

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBookings()
      setBookings(response.data || [])
    } catch (error) {
      showMessage('Không thể tải danh sách booking', 'error')
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(booking =>
        booking.id.toString().includes(term) ||
        booking.product?.name?.toLowerCase().includes(term) ||
        booking.product?.owner?.fullName?.toLowerCase().includes(term) ||
        booking.product?.owner?.email?.toLowerCase().includes(term) ||
        booking.seller?.fullName?.toLowerCase().includes(term) ||
        booking.seller?.email?.toLowerCase().includes(term) ||
        booking.referrer?.fullName?.toLowerCase().includes(term) ||
        booking.referrer?.email?.toLowerCase().includes(term) ||
        booking.manager?.fullName?.toLowerCase().includes(term) ||
        booking.manager?.email?.toLowerCase().includes(term)
      )
    }

    setFilteredBookings(filtered)
  }

  const handleUpdateStatus = async (bookingId: number, status: string) => {
    try {
      console.log(`🔄 Updating booking ${bookingId} to status: ${status}`)
      const response = await apiService.updateBookingStatus(bookingId, status)
      console.log('✅ Update response:', response.data)
      showMessage('Cập nhật trạng thái thành công!', 'success')
      loadBookings()
    } catch (error) {
      console.error('❌ Error updating booking status:', error)
      showMessage('Không thể cập nhật trạng thái', 'error')
    }
  }

  const handleSelectAll = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([])
    } else {
      setSelectedBookings(filteredBookings.map(b => b.id))
    }
  }

  const handleSelectBooking = (bookingId: number) => {
    if (selectedBookings.includes(bookingId)) {
      setSelectedBookings(selectedBookings.filter(id => id !== bookingId))
    } else {
      setSelectedBookings([...selectedBookings, bookingId])
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedBookings.length === 0) return

    try {
      console.log(`🔄 Bulk updating ${selectedBookings.length} bookings to status: ${bulkStatus}`)

      // Update each selected booking
      const promises = selectedBookings.map(bookingId =>
        apiService.updateBookingStatus(bookingId, bulkStatus)
      )

      await Promise.all(promises)

      showMessage(`Đã cập nhật ${selectedBookings.length} booking thành công!`, 'success')
      setSelectedBookings([])
      setBulkStatus('')
      loadBookings()
    } catch (error) {
      console.error('❌ Error bulk updating booking status:', error)
      showMessage('Không thể cập nhật hàng loạt', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý booking</h1>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Tìm kiếm booking, sản phẩm, người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
            <button
              onClick={loadBookings}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-700">
              Đã chọn {selectedBookings.length} booking
            </span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="text-sm px-2 py-1 border border-blue-300 rounded"
            >
              <option value="">Chọn trạng thái</option>
              <option value="CONFIRMED">Xác nhận</option>
              <option value="CANCELLED">Hủy</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
            <button
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatus}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Cập nhật
            </button>
            <button
              onClick={() => setSelectedBookings([])}
              className="text-sm px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Bỏ chọn
            </button>
          </div>
        )}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredBookings.length}</div>
            <div className="text-sm text-gray-500">Hiển thị</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredBookings.filter(b => b.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-500">Chờ xác nhận</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredBookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-gray-500">Đã xác nhận</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredBookings.filter(b => b.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-500">Hoàn thành</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredBookings.filter(b => b.status === 'CANCELLED').length}
            </div>
            <div className="text-sm text-gray-500">Đã hủy</div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 border border-gray-200 px-2 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="w-16 border border-gray-200 px-2 py-3 text-center">ID</th>
                <th className="w-40 border border-gray-200 px-2 py-3 text-center">Sản phẩm & Giá</th>
                <th className="w-36 border border-gray-200 px-2 py-3 text-center">Chủ sở hữu</th>
                <th className="w-36 border border-gray-200 px-2 py-3 text-center">Người giới thiệu</th>
                <th className="w-36 border border-gray-200 px-2 py-3 text-center">Người bán</th>
                <th className="w-36 border border-gray-200 px-2 py-3 text-center">Quản lý</th>
                <th className="w-32 border border-gray-200 px-2 py-3 text-center">Trạng thái</th>
                <th className="w-20 border border-gray-200 px-2 py-3 text-center">Ngày</th>
                <th className="w-24 border border-gray-200 px-2 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const commission = commissionData[booking.id]
                const isLoadingCommission = loadingCommissions[booking.id]

                // Load commission data when row is rendered
                if (!commission && !isLoadingCommission) {
                  loadCommissionData(booking.id)
                }

                return (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedBookings.includes(booking.id)}
                        onChange={() => handleSelectBooking(booking.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="border border-gray-200 px-2 py-3 text-center">
                      <span className="font-medium text-gray-900">#{booking.id}</span>
                    </td>
                    <td className="border border-gray-200 px-2 py-3 text-center">
                      <div className="font-medium text-gray-900 max-w-48 break-words leading-tight">
                        {booking.product?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-green-600 font-medium mt-1">
                        {formatPrice(booking.price || 0)} VND
                      </div>
                    </td>
                    <td className="border border-gray-200 px-2 py-3 text-center">
                      <div className="text-xs">
                        <div className="font-medium truncate">{booking.product?.owner?.fullName || 'N/A'}</div>
                        {isLoadingCommission ? (
                          <div className="text-gray-400 text-xs">Loading...</div>
                        ) : commission?.provider?.user ? (
                          <div className="text-green-600 font-medium text-xs">
                            {commission.provider.percentage.toFixed(4)}% ({formatPrice(commission.provider.amount)})
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">No data</div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-2 py-3 text-center">
                      <div className="text-xs">
                        <div className="font-medium truncate">{booking.referrer?.fullName || 'N/A'}</div>
                        {isLoadingCommission ? (
                          <div className="text-gray-400 text-xs">Loading...</div>
                        ) : commission?.referrer?.user ? (
                          <div className="text-green-600 font-medium text-xs">
                            {commission.referrer.percentage.toFixed(4)}% ({formatPrice(commission.referrer.amount)})
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">No data</div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-2 py-3 text-center">
                      <div className="text-xs">
                        <div className="font-medium truncate">{booking.seller?.fullName || 'N/A'}</div>
                        {isLoadingCommission ? (
                          <div className="text-gray-400 text-xs">Loading...</div>
                        ) : commission?.seller?.user ? (
                          <div className="text-green-600 font-medium text-xs">
                            {commission.seller.percentage.toFixed(4)}% ({formatPrice(commission.seller.amount)})
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">No data</div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-2 py-3 text-center">
                      <div className="text-xs">
                        <div className="font-medium truncate">{booking.manager?.fullName || 'N/A'}</div>
                        {isLoadingCommission ? (
                          <div className="text-gray-400 text-xs">Loading...</div>
                        ) : commission?.manager?.user ? (
                          <div className="text-green-600 font-medium text-xs">
                            {commission.manager.percentage.toFixed(4)}% ({formatPrice(commission.manager.amount)})
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">No data</div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-2 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap ${
                        booking.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-700'
                          : booking.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {booking.status === 'COMPLETED' ? 'Hoàn thành' :
                         booking.status === 'CONFIRMED' ? 'Xác nhận' :
                         booking.status === 'PENDING' ? 'Chờ xác nhận' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-2 py-3 text-center text-xs text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </td>
                    <td className="border border-gray-200 px-2 py-3 text-center">
                      <div className="flex space-x-1 justify-center">
                        {booking.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                              title="Xác nhận"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              title="Hủy"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              title="Hoàn thành"
                            >
                              ✓✓
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              title="Hủy"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Bookings
