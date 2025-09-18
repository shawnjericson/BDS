import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { ButtonLoading, InlineLoading } from '../components/Loading'

interface Rank {
  id: number
  name: string
  rankShares: RankShare[]
}

interface RankShare {
  id: number
  role: string
  pct: number
}

function Ranks() {
  const [ranks, setRanks] = useState<Rank[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [shareModalVisible, setShareModalVisible] = useState(false)
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    pct: ''
  })
  const [shareFormData, setShareFormData] = useState({
    SELLER: '',
    REFERRER: '',
    MANAGER: ''
  })

  useEffect(() => {
    loadRanks()
  }, [])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
  }

  const loadRanks = async () => {
    try {
      setLoading(true)
      const response = await apiService.getRanks()
      setRanks(response.data || [])
    } catch (error) {
      console.error('Error loading ranks:', error)
      showMessage('Không thể tải danh sách cấp bậc từ database', 'error')
      setRanks([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRank = () => {
    setSelectedRank(null)
    setFormData({ name: '', role: '', pct: '' })
    setModalVisible(true)
  }

  // Check if rank name exists
  const checkRankNameExists = (name: string) => {
    if (!name.trim()) return null
    const existing = ranks.find(r => r.name.toLowerCase() === name.toLowerCase())
    return existing || null
  }



  const handleEditShares = (rank: Rank) => {
    setSelectedRank(rank)
    
    // Convert rank shares to form data
    const shares = rank.rankShares || []
    const shareData = {
      SELLER: '',
      REFERRER: '',
      MANAGER: ''
    }

    shares.forEach(share => {
      if (share.role && shareData.hasOwnProperty(share.role)) {
        shareData[share.role as keyof typeof shareData] = (share.pct * 100).toString()
      }
    })

    setShareFormData(shareData)
    setShareModalVisible(true)
  }

  const handleModalSubmit = async () => {
    try {
      if (!formData.name.trim() || !formData.role || !formData.pct) {
        showMessage('Vui lòng nhập đầy đủ thông tin!', 'error')
        return
      }

      const pctValue = parseFloat(formData.pct)
      if (isNaN(pctValue) || pctValue <= 0 || pctValue > 100) {
        showMessage('% hoa hồng phải là số từ 0.01 đến 100!', 'error')
        return
      }

      // Convert to decimal for backend (5.5% → 0.055)
      const pctDecimal = Number((pctValue / 100).toFixed(4))

      console.log('Validation:', {
        input: formData.pct,
        parsed: pctValue,
        decimal: pctDecimal,
        type: typeof pctDecimal
      })

      // Kiểm tra xem rank với tên này đã tồn tại chưa
      const existingRank = ranks.find(r => r.name.toLowerCase() === formData.name.toLowerCase())

      if (existingRank) {
        // Kiểm tra xem rank này đã có role này chưa
        const hasRole = existingRank.rankShares?.some(share => share.role === formData.role)

        if (hasRole) {
          showMessage(`Hạng "${formData.name}" đã có role ${formData.role}!`, 'error')
          return
        }

        // Thêm role mới vào rank hiện tại
        const existingShares = (existingRank.rankShares || []).map(share => ({
          role: share.role,
          pct: Number(share.pct) // Ensure number type
        }))

        const newShares = [
          ...existingShares,
          {
            role: formData.role,
            pct: pctDecimal
          }
        ]

        // Validate all shares before sending
        const validatedShares = newShares.map(share => ({
          role: share.role,
          pct: Number(Number(share.pct).toFixed(4)) // Ensure proper number format
        }))

        // Final validation
        const invalidShare = validatedShares.find(share =>
          typeof share.pct !== 'number' ||
          isNaN(share.pct) ||
          share.pct <= 0 ||
          share.pct > 1
        )

        if (invalidShare) {
          showMessage(`Lỗi validation: ${invalidShare.role} có pct không hợp lệ: ${invalidShare.pct}`, 'error')
          return
        }

        console.log('Update existing rank:', {
          rankId: existingRank.id,
          validatedShares,
          apiCall: `PATCH /admin/ranks/${existingRank.id}/shares`,
          payload: { shares: validatedShares }
        })

        await apiService.updateRankShares(existingRank.id, validatedShares)
        showMessage(`Thêm ${formData.role} ${formData.pct}% vào "${formData.name}" thành công!`, 'success')
      } else {
        // Tạo rank mới
        const newRank = await apiService.createRank({ name: formData.name })

        const newShare = {
          role: formData.role,
          pct: Number(pctDecimal.toFixed(4))
        }

        console.log('Create new rank:', {
          rankId: newRank.data.id,
          share: newShare
        })

        await apiService.updateRankShares(newRank.data.id, [newShare])

        showMessage(`Tạo "${formData.name}" với ${formData.role} ${formData.pct}% thành công!`, 'success')
      }
      setModalVisible(false)
      loadRanks()
    } catch (error) {
      console.error('Error creating rank:', error);
      showMessage(`Lỗi: ${(error as any).response?.data?.message || (error as any).message || 'Không thể tạo cấp bậc'}`, 'error')
    }
  }

  const handleShareModalSubmit = async () => {
    try {
      if (!selectedRank) return

      // Validate total percentage doesn't exceed 100%
      const totalPercent = Object.values(shareFormData)
        .filter(value => value.trim() !== '')
        .reduce((sum, value) => sum + parseFloat(value), 0)

      if (totalPercent > 100) {
        showMessage('Tổng tỷ lệ hoa hồng không được vượt quá 100%!', 'error')
        return
      }

      // Convert form data to shares array
      const shares = Object.entries(shareFormData)
        .filter(([_, value]) => value.trim() !== '')
        .map(([role, value]) => ({
          role,
          pct: parseFloat(value) / 100
        }))

      await apiService.updateRankShares(selectedRank.id, shares)
      showMessage('Cập nhật tỷ lệ hoa hồng thành công!', 'success')
      setShareModalVisible(false)
      loadRanks()
    } catch (error) {
      showMessage('Không thể cập nhật tỷ lệ hoa hồng', 'error')
    }
  }

  const handleDeleteRank = async (rankId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cấp bậc này?')) return

    try {
      await apiService.deleteRank(rankId)
      showMessage('Xóa cấp bậc thành công!', 'success')
      loadRanks()
    } catch (error) {
      showMessage('Không thể xóa cấp bậc', 'error')
    }
  }

  const roleLabels = {
    SELLER: 'Seller',
    REFERRER: 'Referrer',
    MANAGER: 'Manager'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý cấp bậc</h1>
        <button
          onClick={handleCreateRank}
          className="btn-primary"
        >
          Thêm hạng mới
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

      {/* Ranks Grid */}
      {loading ? (
        <InlineLoading message="Đang tải cấp bậc..." />
      ) : ranks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có cấp bậc nào. Hãy tạo cấp bậc mới.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ranks.map((rank) => (
          <div key={rank.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{rank.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDeleteRank(rank.id)}
                  className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Xóa
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-gray-700">Tỷ lệ hoa hồng:</h4>
              {rank.rankShares && rank.rankShares.length > 0 ? (
                <div className="space-y-1">
                  {rank.rankShares.map((share, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {roleLabels[share.role as keyof typeof roleLabels] || share.role}:
                      </span>
                      <span className="font-medium">{(share.pct * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chưa cấu hình</p>
              )}
            </div>

            <button
              onClick={() => handleEditShares(rank)}
              className="w-full btn-secondary"
            >
              Cấu hình tỷ lệ hoa hồng
            </button>
          </div>
        ))}
        </div>
      )}

      {/* Create/Edit Rank Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tạo cấp bậc mới
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên hạng
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Ví dụ: Hạng Vàng, Hạng Bạc..."
                />
                {(() => {
                  const existingRank = checkRankNameExists(formData.name)
                  if (existingRank) {
                    const hasRole = existingRank.rankShares?.some(share => share.role === formData.role)
                    return (
                      <p className={`text-xs mt-1 ${hasRole ? 'text-red-600' : 'text-orange-600'}`}>
                        {hasRole
                          ? `⚠️ "${formData.name}" đã có role ${formData.role}!`
                          : `ℹ️ Sẽ thêm ${formData.role} vào "${formData.name}" hiện tại`
                        }
                      </p>
                    )
                  }
                  return (
                    <p className="text-xs text-gray-500 mt-1">
                      Sẽ tạo hạng mới "{formData.name}"
                    </p>
                  )
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="select"
                >
                  <option value="">Chọn role</option>
                  <option value="SELLER">SELLER</option>
                  <option value="REFERRER">REFERRER</option>
                  <option value="MANAGER">MANAGER</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phần trăm hoa hồng (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  value={formData.pct}
                  onChange={(e) => setFormData(prev => ({ ...prev, pct: e.target.value }))}
                  className="input"
                  placeholder="Ví dụ: 5.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tối đa 100% (ví dụ: 85 = 85%)
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setModalVisible(false)}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleModalSubmit}
                className="btn-primary"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shares Modal */}
      {shareModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cấu hình tỷ lệ hoa hồng - {selectedRank?.name}
            </h3>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Lưu ý:</strong> Chỉnh sửa tỷ lệ hoa hồng cho 3 roles: SELLER, REFERRER, MANAGER
              </p>
            </div>

            <div className="space-y-4">
              {/* Total percentage display */}
              {(() => {
                const total = Object.values(shareFormData)
                  .filter(value => value.trim() !== '')
                  .reduce((sum, value) => sum + parseFloat(value || '0'), 0)
                return (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Tổng tỷ lệ:</span>
                      <span className={`text-sm font-bold ${total > 100 ? 'text-red-600' : 'text-green-600'}`}>
                        {total.toFixed(2)}% / 100%
                      </span>
                    </div>
                  </div>
                )
              })()}

              {Object.entries(roleLabels).map(([role, label]) => (
                <div key={role}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={shareFormData[role as keyof typeof shareFormData]}
                    onChange={(e) => setShareFormData(prev => ({
                      ...prev,
                      [role]: e.target.value
                    }))}
                    className="input"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tối đa 100% (ví dụ: 85 = 85%)
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShareModalVisible(false)}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleShareModalSubmit}
                className="btn-primary"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ranks
