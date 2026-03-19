'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export default function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-500`}
        />
      </div>
      {text && (
        <p className="mt-4 text-sm text-gray-600 dark:text-slate-400" style={{ color: '#6B7280' }}>
          {text}
        </p>
      )}
    </div>
  )
}
