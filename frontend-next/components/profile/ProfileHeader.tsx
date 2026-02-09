'use client'

interface ProfileHeaderProps {
  fullName: string
  currentDate: string
  completionPercentage: number
}

export default function ProfileHeader({ fullName, currentDate, completionPercentage }: ProfileHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#1C2D4F' }}>
        Welcome, {fullName || 'User'}
      </h1>
      <p className="text-gray-600 mb-4">{currentDate}</p>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Profile Completion:</span>
        <span className="text-sm font-semibold" style={{ color: '#0273B1' }}>
          {completionPercentage}%
        </span>
        <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${completionPercentage}%`,
              backgroundColor: '#0273B1',
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}
