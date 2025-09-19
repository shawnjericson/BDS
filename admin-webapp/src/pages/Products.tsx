import React, { useState, useEffect } from 'react'
import { apiService } from '../services/api'

interface Product {
  id: number
  name: string
  description: string
  status: string
  price: number
  commissionPct: number
  providerDesiredPct: number
  createdAt: string
  owner?: any
}

function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [statusFilter, setStatusFilter] = useState('')

  // Bulk operations states
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProducts()
  }, [statusFilter])

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
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

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProducts(statusFilter || undefined)
      setProducts(response.data || [])
    } catch (error) {
      showMessage('Không thể tải danh sách sản phẩm', 'error')
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get filtered products
  const getFilteredProducts = () => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.owner?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Bulk operations
  const handleSelectAll = () => {
    const filteredProducts = getFilteredProducts()

    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id))
    }
  }

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return

    try {
      setBulkLoading(true)

      switch (bulkAction) {
        case 'APPROVE':
          await Promise.all(selectedProducts.map(id => handleUpdateStatus(id, 'APPROVED')))
          showMessage(`Đã duyệt ${selectedProducts.length} sản phẩm`, 'success')
          break
        case 'REJECT':
          await Promise.all(selectedProducts.map(id => handleUpdateStatus(id, 'REJECTED')))
          showMessage(`Đã từ chối ${selectedProducts.length} sản phẩm`, 'success')
          break
        case 'PENDING':
          await Promise.all(selectedProducts.map(id => handleUpdateStatus(id, 'PENDING')))
          showMessage(`Đã đặt ${selectedProducts.length} sản phẩm chờ duyệt`, 'success')
          break
        case 'DELETE':
          if (confirm(`Bạn có chắc muốn xóa ${selectedProducts.length} sản phẩm?`)) {
            await Promise.all(selectedProducts.map(id => apiService.deleteProduct(id)))
            showMessage(`Đã xóa ${selectedProducts.length} sản phẩm`, 'success')
          }
          break
      }

      setSelectedProducts([])
      setBulkAction('')
      loadProducts()
    } catch (error) {
      showMessage('Không thể thực hiện thao tác hàng loạt', 'error')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleUpdateStatus = async (productId: number, status: string) => {
    try {
      await apiService.updateProductStatus(productId, status)
      showMessage('Cập nhật trạng thái thành công!', 'success')
      loadProducts()
    } catch (error) {
      showMessage('Không thể cập nhật trạng thái', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <div className="flex space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
          <button
            onClick={loadProducts}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, mô tả, chủ sở hữu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-600">
            {getFilteredProducts().length} / {products.length} sản phẩm
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                Đã chọn {selectedProducts.length} sản phẩm
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn thao tác</option>
                <option value="APPROVE">Duyệt</option>
                <option value="REJECT">Từ chối</option>
                <option value="PENDING">Đặt chờ duyệt</option>
                <option value="DELETE">Xóa</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedProducts([])}
                className="text-sm px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Bỏ chọn
              </button>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || bulkLoading}
                className="text-sm px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {bulkLoading ? 'Đang xử lý...' : 'Thực hiện'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
            <div className="text-sm text-gray-500">Tổng sản phẩm</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {products.filter(p => p.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-500">Chờ duyệt</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.status === 'APPROVED').length}
            </div>
            <div className="text-sm text-gray-500">Đã duyệt</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.status === 'REJECTED').length}
            </div>
            <div className="text-sm text-gray-500">Từ chối</div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === getFilteredProducts().length && getFilteredProducts().length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="w-64">Thông tin sản phẩm</th>
                <th>Hoa hồng</th>
                <th>Chủ sở hữu</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredProducts().map((product) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="w-64">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 text-sm leading-tight">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-600 leading-normal break-words whitespace-normal max-w-60">
                        {product.description || 'Không có mô tả'}
                      </div>
                      <div className="font-semibold text-green-600 text-sm">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <div>Tổng: {(product.commissionPct * 100).toFixed(1)}%</div>
                      <div className="text-gray-500">
                        Provider: {(product.providerDesiredPct * 100).toFixed(1)}%
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <div className="font-medium">{product.owner?.fullName || 'N/A'}</div>
                      <div className="text-gray-500">{product.owner?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      product.status === 'APPROVED' 
                        ? 'badge-success' 
                        : product.status === 'PENDING' 
                        ? 'badge-warning' 
                        : 'badge-danger'
                    }`}>
                      {product.status === 'APPROVED' ? 'Đã duyệt' : 
                       product.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                    </span>
                  </td>
                  <td>
                    {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      {product.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(product.id, 'APPROVED')}
                            className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(product.id, 'REJECTED')}
                            className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      {product.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(product.id, 'REJECTED')}
                          className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Từ chối
                        </button>
                      )}
                      {product.status === 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(product.id, 'APPROVED')}
                          className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Duyệt
                        </button>
                      )}
                    </div>
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

export default Products
