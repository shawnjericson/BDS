import React, { useState } from 'react'

interface CopyButtonProps {
  text: string
  className?: string
  size?: 'sm' | 'md'
}

export function CopyButton({ text, className = '', size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border transition-colors ${sizeClasses[size]} ${className}`}
      title={copied ? 'Đã copy!' : 'Copy mã giới thiệu'}
    >
      {copied ? (
        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  )
}

interface ReferralCodeDisplayProps {
  code: string
  className?: string
}

export function ReferralCodeDisplay({ code, className = '' }: ReferralCodeDisplayProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border">
        {code}
      </span>
      <CopyButton text={code} />
    </div>
  )
}
