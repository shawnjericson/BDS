import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { TableSkeleton, CardSkeleton, ButtonLoading } from '../components/Loading'

interface Wallet {
  id: number
  balance: number
  user: any
  transactions?: any[]
}

interface WalletStats {
  totalBalance: number
  totalUsers: number
  totalTransactions: number
}

function Wallets() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [stats, setStats] = useState<WalletStats>({
    totalBalance: 0,
    totalUsers: 0,
    totalTransactions: 0
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [modalLoading, setModalLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [adjustmentModalVisible, setAdjustmentModalVisible] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [adjustmentData, setAdjustmentData] = useState({
    amount: '',
    type: 'CREDIT',
    note: ''
  })

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true)
      await Promise.all([loadWallets(), loadStats()])
      setInitialLoading(false)
    }
    loadInitialData()
  }, [])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
  }

  const loadWallets = async () => {
    try {
      setLoading(true)
      const response = await apiService.getWallets()

      // Backend trả về { wallets: [...], pagination: {...} }
      if (response.data.wallets) {
        setWallets(response.data.wallets)
      } else {
        // Fallback nếu cấu trúc khác
        setWallets(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      showMessage('Không thể tải danh sách ví', 'error')
      console.error('Error loading wallets:', error)
      setWallets([]) // Đảm bảo wallets luôn là array
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiService.getWalletStats()
      setStats(response.data || {
        totalBalance: 0,
        totalUsers: 0,
        totalTransactions: 0
      })
    } catch (error) {
      console.error('Error loading wallet stats:', error)
    }
  }

  const handleCreateAdjustment = (wallet: Wallet) => {
    setSelectedWallet(wallet)
    setAdjustmentData({
      amount: '',
      type: 'CREDIT',
      note: ''
    })
    setAdjustmentModalVisible(true)
  }

  const handleAdjustmentSubmit = async () => {
    try {
      if (!selectedWallet || !adjustmentData.amount || !adjustmentData.note) {
        showMessage('Vui lòng nhập đầy đủ thông tin!', 'error')
        return
      }

      const amount = parseFloat(adjustmentData.amount)
      if (isNaN(amount) || amount <= 0) {
        showMessage('Số tiền không hợp lệ!', 'error')
        return
      }

      await apiService.createWalletAdjustment({
        userId: selectedWallet.user.id,
        amount: adjustmentData.type === 'DEBIT' ? -amount : amount,
        type: adjustmentData.type,
        note: adjustmentData.note
      })

      showMessage('Điều chỉnh ví thành công!', 'success')
      setAdjustmentModalVisible(false)
      loadWallets()
      loadStats()
    } catch (error) {
      showMessage('Không thể điều chỉnh ví', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý ví</h1>
        <ButtonLoading
          loading={loading}
          onClick={() => { loadWallets(); loadStats(); }}
          className="btn-primary"
        >
          Làm mới
        </ButtonLoading>
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
      {initialLoading ? (
        <CardSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalBalance.toLocaleString()} VND
              </div>
              <div className="text-sm text-gray-500">Tổng số dư</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
              <div className="text-sm text-gray-500">Tổng ví</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalTransactions}</div>
              <div className="text-sm text-gray-500">Tổng giao dịch</div>
            </div>
          </div>
        </div>
      )}

      {/* Wallets Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          {initialLoading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Số dư</th>
                  <th>Mã giới thiệu</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {wallets.length === 0 && !initialLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Không có dữ liệu ví
                    </td>
                  </tr>
                ) : (
                  wallets.map((wallet) => (
                <tr key={wallet.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                        {wallet.user?.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="font-medium text-gray-900">
                        {wallet.user?.fullName || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-gray-600">{wallet.user?.email || 'N/A'}</span>
                  </td>
                  <td>
                    <span className={`font-bold ${
                      wallet.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {wallet.balance.toLocaleString()} VND
                    </span>
                  </td>
                  <td>
                    <span className="text-gray-600">{wallet.user?.referralCode || 'N/A'}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      wallet.user?.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'
                    }`}>
                      {wallet.user?.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCreateAdjustment(wallet)}
                        className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Điều chỉnh
                      </button>
                    </div>
                  </td>
                </tr>
              ))
                )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Adjustment Modal */}
      {adjustmentModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Điều chỉnh ví - {selectedWallet?.user?.fullName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số dư hiện tại
                </label>
                <div className="text-lg font-bold text-green-600">
                  {selectedWallet?.balance.toLocaleString()} VND
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại giao dịch
                </label>
                <select
                  value={adjustmentData.type}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, type: e.target.value }))}
                  className="select"
                >
                  <option value="CREDIT">Cộng tiền</option>
                  <option value="DEBIT">Trừ tiền</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền (VND)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={adjustmentData.amount}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, amount: e.target.value }))}
                  className="input"
                  placeholder="Nhập số tiền"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={adjustmentData.note}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, note: e.target.value }))}
                  className="input"
                  rows={3}
                  placeholder="Nhập lý do điều chỉnh"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setAdjustmentModalVisible(false)}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleAdjustmentSubmit}
                className="btn-primary"
              >
                Điều chỉnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wallets
