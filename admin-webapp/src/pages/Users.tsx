import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { LoadingSpinner, TableSkeleton, CardSkeleton, ButtonLoading, InlineLoading } from '../components/Loading'
import { ReferralCodeDisplay } from '../components/CopyButton'

interface User {
  id: number
  fullName: string
  email: string
  status: string
  role: string
  referralCode: string
  createdAt: string
  currentRank?: {
    id: number
    name: string
  } | null
  latestRevenue?: {
    amount: number
    date: string
  } | null
  manager?: {
    id: number
    fullName: string
    email: string
    referralCode: string
    currentRank?: {
      id: number
      name: string
    } | null
  } | null
  referrer?: {
    id: number
    fullName: string
    email: string
    referralCode: string
    currentRank?: {
      id: number
      name: string
    } | null
  } | null
}

interface Rank {
  id: number
  name: string
  rankShares: any[]
}

function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [ranks, setRanks] = useState<Rank[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [rankModalLoading, setRankModalLoading] = useState(false)
  const [rankModalVisible, setRankModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  })

  const [rankFormData, setRankFormData] = useState({
    rankId: ''
  })

  // Role modal states
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [roleModalLoading, setRoleModalLoading] = useState(false)
  const [roleFormData, setRoleFormData] = useState({
    role: ''
  })

  // Manager modal states
  const [managerModalVisible, setManagerModalVisible] = useState(false)
  const [managerModalLoading, setManagerModalLoading] = useState(false)
  const [managerFormData, setManagerFormData] = useState({
    managerId: ''
  })
  const [managers, setManagers] = useState<User[]>([])

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  // Bulk operations states
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)

  // Create user modal states
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false)
  const [createUserLoading, setCreateUserLoading] = useState(false)
  const [createUserFormData, setCreateUserFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    referralCode: '',
    role: 'EMPLOYEE'
  })

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true)
      await Promise.all([loadUsers(), loadRanks()])
      setInitialLoading(false)
    }
    loadInitialData()
  }, [pagination.current, pagination.pageSize])

  // Filter users when search term or filters change
  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter, dateFilter])

  const filterUsers = () => {
    let filtered = [...users]

    // Search by name, email, or ID
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.id.toString().includes(term)
      )
    }

    // Filter by role
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    // Filter by registration date
    if (dateFilter) {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case '7days':
          filterDate.setDate(now.getDate() - 7)
          break
        case '30days':
          filterDate.setDate(now.getDate() - 30)
          break
        case '1year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          filterDate.setFullYear(1900) // Show all
      }

      if (dateFilter !== 'all') {
        filtered = filtered.filter(user => {
          const userDate = new Date(user.createdAt)
          return userDate >= filterDate
        })
      }
    }

    setFilteredUsers(filtered)
  }

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUsers(pagination.current, pagination.pageSize)

      // Backend trả về { users: [...], pagination: {...} }
      if (response.data.users) {
        setUsers(response.data.users)
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || response.data.users.length
        }))
      } else {
        // Fallback nếu cấu trúc khác
        setUsers(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      showMessage('Không thể tải danh sách người dùng', 'error')
      console.error('Error loading users:', error)
      setUsers([]) // Đảm bảo users luôn là array
    } finally {
      setLoading(false)
    }
  }

  const loadRanks = async () => {
    try {
      const response = await apiService.getRanks()
      setRanks(response.data || [])
    } catch (error) {
      console.error('Error loading ranks:', error)
      // Create default ranks if none exist
      setRanks([
        { id: 1, name: 'Thành viên', rankShares: [] },
        { id: 2, name: 'Đại lý', rankShares: [] },
        { id: 3, name: 'Quản lý', rankShares: [] }
      ])
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await apiService.updateUserStatus(user.id, newStatus)
      showMessage(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản!`, 'success')
      loadUsers()
    } catch (error) {
      showMessage('Không thể cập nhật trạng thái', 'error')
    }
  }

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return

    try {
      setBulkLoading(true)

      switch (bulkAction) {
        case 'ACTIVATE':
          await Promise.all(selectedUsers.map(id => apiService.updateUserStatus(id, 'ACTIVE')))
          showMessage(`Đã kích hoạt ${selectedUsers.length} tài khoản`, 'success')
          break
        case 'DEACTIVATE':
          await Promise.all(selectedUsers.map(id => apiService.updateUserStatus(id, 'INACTIVE')))
          showMessage(`Đã vô hiệu hóa ${selectedUsers.length} tài khoản`, 'success')
          break
        case 'SET_EMPLOYEE':
          await Promise.all(selectedUsers.map(id => apiService.updateUserRole(id, 'EMPLOYEE')))
          showMessage(`Đã cập nhật ${selectedUsers.length} người dùng thành Nhân viên`, 'success')
          break
        case 'SET_MANAGER':
          await Promise.all(selectedUsers.map(id => apiService.updateUserRole(id, 'MANAGER')))
          showMessage(`Đã cập nhật ${selectedUsers.length} người dùng thành Quản lý`, 'success')
          break
      }

      setSelectedUsers([])
      setBulkAction('')
      loadUsers()
    } catch (error) {
      showMessage('Không thể thực hiện thao tác hàng loạt', 'error')
    } finally {
      setBulkLoading(false)
    }
  }

  // Create user functions
  const handleCreateUser = async () => {
    if (!createUserFormData.fullName || !createUserFormData.email || !createUserFormData.password || !createUserFormData.referralCode) {
      showMessage('Vui lòng điền đầy đủ thông tin bắt buộc', 'error')
      return
    }

    try {
      setCreateUserLoading(true)
      await apiService.createUser(createUserFormData)
      showMessage('Tạo người dùng thành công', 'success')
      setCreateUserModalVisible(false)
      setCreateUserFormData({
        fullName: '',
        email: '',
        password: '',
        referralCode: '',
        role: 'EMPLOYEE'
      })
      loadUsers()
    } catch (error: any) {
      let errorMessage = 'Có lỗi xảy ra khi tạo người dùng'

      if (error.response?.data?.message) {
        const message = error.response.data.message
        if (message.includes('Invalid referral code')) {
          errorMessage = 'Mã giới thiệu không hợp lệ'
        } else if (message.includes('Email already exists')) {
          errorMessage = 'Email đã tồn tại trong hệ thống'
        } else if (message.includes('Referral code is required')) {
          errorMessage = 'Mã giới thiệu là bắt buộc'
        } else {
          errorMessage = message
        }
      }

      showMessage(errorMessage, 'error')
      console.error('Create user error:', error)
    } finally {
      setCreateUserLoading(false)
    }
  }

  const handleAssignRank = (user: User) => {
    setSelectedUser(user)
    setRankFormData({
      rankId: user.currentRank?.id?.toString() || ''
    })
    setRankModalVisible(true)
  }

  const handleSetRole = (user: User) => {
    setSelectedUser(user)
    setRoleFormData({ role: user.role })
    setRoleModalVisible(true)
  }

  const handleAssignManager = async (user: User) => {
    setSelectedUser(user)
    setManagerFormData({ managerId: user.manager?.id?.toString() || '' })

    // Load managers list - only users with MANAGER role
    try {
      const response = await apiService.getUsers(1, 100) // Get all users
      const managerUsers = response.data.users.filter((u: User) =>
        u.role === 'MANAGER' && u.id !== user.id // Only MANAGER role and exclude current user
      )
      setManagers(managerUsers)
    } catch (error) {
      console.error('Error loading managers:', error)
    }

    setManagerModalVisible(true)
  }



  const handleRankModalSubmit = async () => {
    try {
      setRankModalLoading(true)
      if (selectedUser && rankFormData.rankId) {
        await apiService.assignUserRank(selectedUser.id, parseInt(rankFormData.rankId))
        showMessage('Phân quyền cấp bậc thành công!', 'success')
        setRankModalVisible(false)
        loadUsers()
      }
    } catch (error) {
      showMessage('Không thể phân quyền cấp bậc', 'error')
    } finally {
      setRankModalLoading(false)
    }
  }

  const handleRoleModalSubmit = async () => {
    try {
      setRoleModalLoading(true)
      if (selectedUser && roleFormData.role) {
        await apiService.updateUserRole(selectedUser.id, roleFormData.role)
        showMessage('Cập nhật role thành công!', 'success')
        setRoleModalVisible(false)
        loadUsers()
      }
    } catch (error) {
      showMessage('Không thể cập nhật role', 'error')
    } finally {
      setRoleModalLoading(false)
    }
  }

  const handleManagerModalSubmit = async () => {
    try {
      setManagerModalLoading(true)
      if (selectedUser) {
        const managerId = managerFormData.managerId ? parseInt(managerFormData.managerId) : null
        await apiService.assignUserManager(selectedUser.id, managerId)
        showMessage('Chỉ định quản lý thành công!', 'success')
        setManagerModalVisible(false)
        loadUsers()
      }
    } catch (error) {
      showMessage('Không thể chỉ định quản lý', 'error')
    } finally {
      setManagerModalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setCreateUserModalVisible(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Tạo người dùng
          </button>
          <ButtonLoading
            loading={loading}
            onClick={loadUsers}
            className="btn-primary"
          >
            Làm mới
          </ButtonLoading>
        </div>
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

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tên, email hoặc ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chức vụ
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="EMPLOYEE">Nhân viên</option>
              <option value="MANAGER">Quản lý</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
              <option value="SUSPENDED">Tạm khóa</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đăng ký
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toàn bộ</option>
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="1year">1 năm qua</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <div>
            Hiển thị {filteredUsers.length} / {users.length} người dùng
          </div>
          {(searchTerm || roleFilter || statusFilter || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('')
                setStatusFilter('')
                setDateFilter('')
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {initialLoading ? (
        <CardSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
              <div className="text-sm text-gray-500">Tổng người dùng</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-gray-500">Đang hoạt động</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => u.status !== 'ACTIVE').length}
              </div>
              <div className="text-sm text-gray-500">Tạm khóa</div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                Đã chọn {selectedUsers.length} người dùng
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn thao tác</option>
                <option value="ACTIVATE">Kích hoạt</option>
                <option value="DEACTIVATE">Vô hiệu hóa</option>
                <option value="SET_EMPLOYEE">Đặt làm Nhân viên</option>
                <option value="SET_MANAGER">Đặt làm Quản lý</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedUsers([])}
                className="text-sm px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Bỏ chọn
              </button>
              <ButtonLoading
                loading={bulkLoading}
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="text-sm px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Thực hiện
              </ButtonLoading>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <div className="min-w-full" style={{ minWidth: '1200px' }}>
          {initialLoading ? (
            <TableSkeleton rows={5} columns={8} />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th className="w-8">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="w-48">Thông tin người dùng</th>
                  <th className="w-40">Quản lý</th>
                  <th className="w-40">Người giới thiệu</th>
                  <th className="w-24">Chức vụ</th>
                  <th className="w-16">Trạng thái</th>
                  <th className="w-32">Doanh thu gần nhất</th>
                  <th className="w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && !initialLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      {users.length === 0 ? 'Không có dữ liệu người dùng' : 'Không tìm thấy kết quả phù hợp'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded"
                    />
                  </td>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{user.fullName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="mt-1 flex items-center space-x-1">
                          <span className="text-xs text-gray-400">Mã:</span>
                          <ReferralCodeDisplay code={user.referralCode} />
                        </div>
                        <div className="mt-1">
                          <span className="badge badge-info text-xs">
                            {user.currentRank?.name || 'Chưa có hạng'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {user.manager ? (
                      <div className="text-xs">
                        <div className="font-medium text-gray-900 truncate">{user.manager.fullName}</div>
                        <div className="text-gray-500 truncate">{user.manager.email}</div>
                        <div className="flex items-center space-x-1 mt-1">
                          <ReferralCodeDisplay code={user.manager.referralCode} />
                        </div>
                        <div className="mt-1">
                          <span className="badge badge-info text-xs">
                            {user.manager.currentRank?.name || 'Chưa có hạng'}
                          </span>
                        </div>

                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Chưa có</span>
                    )}
                  </td>
                  <td>
                    {user.referrer ? (
                      <div className="text-xs">
                        <div className="font-medium text-gray-900 truncate">{user.referrer.fullName}</div>
                        <div className="text-gray-500 truncate">{user.referrer.email}</div>
                        <div className="flex items-center space-x-1 mt-1">
                          <ReferralCodeDisplay code={user.referrer.referralCode} />
                        </div>
                        <div className="mt-1">
                          <span className="badge badge-info text-xs">
                            {user.referrer.currentRank?.name || 'Chưa có hạng'}
                          </span>
                        </div>

                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Chưa có</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge text-xs ${
                      user.role === 'EMPLOYEE' ? 'badge-primary' :
                      user.role === 'MANAGER' ? 'badge-warning' :
                      user.role === 'ADMIN' ? 'badge-danger' : 'badge-secondary'
                    }`}>
                      {user.role === 'EMPLOYEE' ? 'Nhân viên' :
                       user.role === 'MANAGER' ? 'Quản lý' :
                       user.role === 'ADMIN' ? 'Admin' : user.role}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`w-4 h-4 rounded-full border-2 transition-colors hover:scale-110 ${
                          user.status === 'ACTIVE'
                            ? 'bg-green-500 border-green-500 hover:bg-green-600'
                            : 'bg-red-500 border-red-500 hover:bg-red-600'
                        }`}
                        title={user.status === 'ACTIVE' ? 'Hoạt động - Click để vô hiệu hóa' : 'Tạm khóa - Click để kích hoạt'}
                      />
                    </div>
                  </td>
                  <td>
                    {user.latestRevenue ? (
                      <div className="text-sm">
                        <div className="font-medium text-green-600">
                          {user.latestRevenue.amount.toLocaleString()} VND
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(user.latestRevenue.date).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Chưa có doanh thu</span>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleAssignRank(user)}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        Cấp bậc
                      </button>
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleSetRole(user)}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Chức vụ
                        </button>
                      )}
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleAssignManager(user)}
                          className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                        >
                          Quản lý
                        </button>
                      )}
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

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Hiển thị {((pagination.current - 1) * pagination.pageSize) + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} của {pagination.total} người dùng
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
              disabled={pagination.current === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
              disabled={pagination.current * pagination.pageSize >= pagination.total}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      </div>



      {/* Assign Rank Modal */}
      {rankModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Phân quyền cấp bậc</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cấp bậc</label>
              <select
                value={rankFormData.rankId}
                onChange={(e) => setRankFormData(prev => ({ ...prev, rankId: e.target.value }))}
                className="select"
              >
                <option value="">Chọn cấp bậc</option>
                {ranks.map(rank => (
                  <option key={rank.id} value={rank.id}>
                    {rank.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setRankModalVisible(false)}
                className="btn-secondary"
                disabled={rankModalLoading}
              >
                Hủy
              </button>
              <ButtonLoading
                loading={rankModalLoading}
                onClick={handleRankModalSubmit}
                className="btn-primary"
              >
                Phân quyền
              </ButtonLoading>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {roleModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cập nhật Role - {selectedUser?.fullName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={roleFormData.role}
                  onChange={(e) => setRoleFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="select"
                >
                  <option value="">Chọn role</option>
                  <option value="EMPLOYEE">Nhân viên</option>
                  <option value="MANAGER">Quản lý</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setRoleModalVisible(false)}
                className="btn-secondary"
                disabled={roleModalLoading}
              >
                Hủy
              </button>
              <ButtonLoading
                loading={roleModalLoading}
                onClick={handleRoleModalSubmit}
                className="btn-primary"
              >
                Cập nhật
              </ButtonLoading>
            </div>
          </div>
        </div>
      )}

      {/* Manager Modal */}
      {managerModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Chỉ định Quản lý - {selectedUser?.fullName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quản lý
                </label>
                <select
                  value={managerFormData.managerId}
                  onChange={(e) => setManagerFormData(prev => ({ ...prev, managerId: e.target.value }))}
                  className="select"
                >
                  <option value="">Không có quản lý</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.fullName} ({manager.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setManagerModalVisible(false)}
                className="btn-secondary"
                disabled={managerModalLoading}
              >
                Hủy
              </button>
              <ButtonLoading
                loading={managerModalLoading}
                onClick={handleManagerModalSubmit}
                className="btn-primary"
              >
                Chỉ định
              </ButtonLoading>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {createUserModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tạo người dùng mới</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createUserFormData.fullName}
                  onChange={(e) => setCreateUserFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ tên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={createUserFormData.email}
                  onChange={(e) => setCreateUserFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={createUserFormData.password}
                  onChange={(e) => setCreateUserFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  value={createUserFormData.role}
                  onChange={(e) => setCreateUserFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EMPLOYEE">Nhân viên</option>
                  <option value="MANAGER">Quản lý</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã giới thiệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createUserFormData.referralCode}
                  onChange={(e) => setCreateUserFormData(prev => ({ ...prev, referralCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mã giới thiệu"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setCreateUserModalVisible(false)
                  setCreateUserFormData({
                    fullName: '',
                    email: '',
                    password: '',
                    referralCode: '',
                    role: 'EMPLOYEE'
                  })
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <ButtonLoading
                loading={createUserLoading}
                onClick={handleCreateUser}
                className="btn-primary"
              >
                Tạo người dùng
              </ButtonLoading>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
