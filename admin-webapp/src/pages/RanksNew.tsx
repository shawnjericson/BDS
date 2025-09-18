import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { InlineLoading } from '../components/Loading'

interface RankShare {
  id: number
  role: string
  pct: number
  rankId: number
  rank?: {
    id: number
    name: string
  }
}

interface Message {
  text: string
  type: 'success' | 'error'
}

interface RoleGroup {
  role: string
  label: string
  shares: RankShare[]
}

export default function RanksNew() {
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [editingShare, setEditingShare] = useState<RankShare | null>(null)
  const [newShareData, setNewShareData] = useState({ role: '', name: '', pct: '' })
  const [message, setMessage] = useState<Message | null>(null)

  const roleLabels = {
    SELLER: 'Người bán',
    REFERRER: 'Người giới thiệu', 
    MANAGER: 'Quản lý'
  }

  useEffect(() => {
    loadRankShares()
  }, [])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const loadRankShares = async () => {
    try {
      setLoading(true)

      // Try to get real data first
      try {
        const response = await apiService.getRanks()
        const ranks = response.data || []

        // Group shares by role
        const allShares: RankShare[] = []
        ranks.forEach((rank: any) => {
          if (rank.rankShares) {
            rank.rankShares.forEach((share: any) => {
              allShares.push({
                ...share,
                rank: { id: rank.id, name: rank.name }
              })
            })
          }
        })

        // Group by role
        const groups: RoleGroup[] = Object.keys(roleLabels).map(role => ({
          role,
          label: roleLabels[role as keyof typeof roleLabels],
          shares: allShares.filter(share => share.role === role)
            .sort((a, b) => {
              // Extract rank number from name (e.g., "Hạng 1", "Hạng 2")
              const getRankNumber = (name: string) => {
                const match = name.match(/(\d+)/)
                return match ? parseInt(match[1]) : 999
              }

              const aRank = getRankNumber(a.rank?.name || '')
              const bRank = getRankNumber(b.rank?.name || '')

              // Sort by rank number ascending (1, 2, 3, 4, 5)
              return aRank - bRank
            })
        }))

        setRoleGroups(groups)
      } catch (apiError) {
        console.error('API failed:', apiError)
        showMessage('Lỗi kết nối backend', 'error')
        setRoleGroups([])
      }
    } catch (error) {
      console.error('Error loading rank shares:', error)
      showMessage('Lỗi tải dữ liệu cấp bậc', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = (role: string) => {
    setNewShareData({ role, name: '', pct: '' })
    setEditingShare(null)
  }

  const handleEdit = (share: RankShare) => {
    setEditingShare(share)
    setNewShareData({ 
      role: share.role, 
      name: share.rank?.name || '', 
      pct: (share.pct * 100).toString() 
    })
  }

  const handleSave = async () => {
    try {
      if (!newShareData.name.trim() || !newShareData.pct) {
        showMessage('Vui lòng nhập đầy đủ thông tin!', 'error')
        return
      }

      const pctValue = parseFloat(newShareData.pct)
      if (isNaN(pctValue) || pctValue <= 0 || pctValue > 100) {
        showMessage('% hoa hồng phải từ 0.01 đến 100!', 'error')
        return
      }

      const pctDecimal = Number((pctValue / 100).toFixed(4))

      if (editingShare) {
        // Update existing
        await apiService.updateRankShares(editingShare.rankId, [{
          role: newShareData.role,
          pct: pctDecimal
        }])
        showMessage(`Cập nhật ${roleLabels[newShareData.role as keyof typeof roleLabels]} thành công!`, 'success')
      } else {
        // Create new rank + share
        const newRank = await apiService.createRank({ name: newShareData.name })
        await apiService.updateRankShares(newRank.data.id, [{
          role: newShareData.role,
          pct: pctDecimal
        }])
        showMessage(`Tạo ${newShareData.name} thành công!`, 'success')
      }

      setNewShareData({ role: '', name: '', pct: '' })
      setEditingShare(null)
      loadRankShares()
    } catch (error) {
      console.error('Error saving:', error)
      showMessage('Lỗi lưu dữ liệu', 'error')
    }
  }

  const handleDelete = async (share: RankShare) => {
    if (!confirm(`Xóa ${share.rank?.name} - ${roleLabels[share.role as keyof typeof roleLabels]}?`)) return
    
    try {
      await apiService.deleteRank(share.rankId)
      showMessage('Xóa thành công!', 'success')
      loadRankShares()
    } catch (error) {
      console.error('Error deleting:', error)
      showMessage('Lỗi xóa dữ liệu', 'error')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <InlineLoading />
          <span className="ml-2">Đang tải...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Cấp bậc</h1>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {roleGroups.map(group => (
          <div key={group.role} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">{group.label}</h2>
                <button
                  onClick={() => handleAddNew(group.role)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  + Thêm
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {group.shares.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Chưa có cấp bậc nào</p>
              ) : (
                group.shares.map(share => (
                  <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{share.rank?.name}</div>
                      <div className="text-sm text-gray-600">{(share.pct * 100).toFixed(1)}%</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(share)}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded hover:bg-yellow-200"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(share)}
                        className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {(newShareData.role || editingShare) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingShare ? 'Chỉnh sửa' : 'Thêm mới'} {roleLabels[newShareData.role as keyof typeof roleLabels]}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên cấp bậc
                </label>
                <input
                  type="text"
                  value={newShareData.name}
                  onChange={(e) => setNewShareData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: Hạng Vàng, Level 1..."
                  disabled={!!editingShare}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phần trăm hoa hồng (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={newShareData.pct}
                  onChange={(e) => setNewShareData(prev => ({ ...prev, pct: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: 85.5"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setNewShareData({ role: '', name: '', pct: '' })
                  setEditingShare(null)
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingShare ? 'Cập nhật' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
