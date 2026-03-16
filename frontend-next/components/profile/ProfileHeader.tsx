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
    </div>
  )
}