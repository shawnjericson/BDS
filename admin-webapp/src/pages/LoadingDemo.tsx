import React, { useState } from 'react'
import { 
  LoadingSpinner, 
  LoadingOverlay, 
  TableSkeleton, 
  CardSkeleton, 
  InlineLoading, 
  ButtonLoading 
} from '../components/Loading'

function LoadingDemo() {
  const [showOverlay, setShowOverlay] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)

  const handleButtonClick = () => {
    setButtonLoading(true)
    setTimeout(() => {
      setButtonLoading(false)
    }, 2000)
  }

  const handleOverlayClick = () => {
    setShowOverlay(true)
    setTimeout(() => {
      setShowOverlay(false)
    }, 3000)
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Loading Components Demo</h1>
      
      {/* Loading Spinners */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Loading Spinners</h2>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <LoadingSpinner size="sm" />
            <p className="text-sm mt-2">Small</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="md" />
            <p className="text-sm mt-2">Medium</p>
          </div>
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-sm mt-2">Large</p>
          </div>
        </div>
      </div>

      {/* Button Loading */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Button Loading</h2>
        <div className="flex space-x-4">
          <ButtonLoading
            loading={buttonLoading}
            onClick={handleButtonClick}
            className="btn-primary"
          >
            Click me
          </ButtonLoading>
          <button
            onClick={handleOverlayClick}
            className="btn-secondary"
          >
            Show Overlay
          </button>
        </div>
      </div>

      {/* Inline Loading */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Inline Loading</h2>
        <InlineLoading message="Đang tải dữ liệu..." />
      </div>

      {/* Card Skeleton */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Card Skeleton</h2>
        <CardSkeleton count={3} />
      </div>

      {/* Table Skeleton */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Table Skeleton</h2>
        <TableSkeleton rows={5} columns={4} />
      </div>

      {/* Loading Overlay */}
      {showOverlay && (
        <LoadingOverlay message="Đang xử lý..." />
      )}
    </div>
  )
}

export default LoadingDemo
