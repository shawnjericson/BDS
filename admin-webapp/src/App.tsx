import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Products from './pages/Products'
import Bookings from './pages/Bookings'
import Revenue from './pages/Revenue'
import Ranks from './pages/RanksNew'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoadingOverlay } from './components/Loading'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  // Show loading overlay while checking authentication
  if (loading) {
    return <LoadingOverlay message="Đang kiểm tra đăng nhập..." />
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/products" element={<Products />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/ranks" element={<Ranks />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
