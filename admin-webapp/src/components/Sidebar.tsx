import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const menuItems = [
  {
    key: '/dashboard',
    label: 'Tổng quan',
  },
  {
    key: '/ranks',
    label: 'Quản lý cấp bậc',
  },
  {
    key: '/users',
    label: 'Quản lý người dùng',
  },
  {
    key: '/products',
    label: 'Quản lý sản phẩm',
  },
  {
    key: '/bookings',
    label: 'Quản lý booking',
  },
  {
    key: '/revenue',
    label: 'Quản lý doanh thu',
  },
]

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleMenuClick = (key: string) => {
    navigate(key)
  }

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <h1 className="text-xl font-bold">BDS Admin Panel</h1>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => handleMenuClick(item.key)}
                className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors duration-200 hover:bg-gray-800 ${
                  location.pathname === item.key
                    ? 'bg-primary-600 text-white border-r-4 border-primary-400'
                    : 'text-gray-300'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
