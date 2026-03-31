'use client'

interface ProfileHeaderProps {
  fullName: string
  currentDate: string
}

export default function ProfileHeader({ fullName, currentDate }: ProfileHeaderProps) {
  return (
    <div className="mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-[#1C2D4F] dark:text-white transition-colors">
          Welcome, {fullName || 'User'}
        </h1>
        <p className="text-sm md:text-base font-medium text-gray-500 dark:text-slate-400 transition-colors">
          {currentDate}
        </p>
      </div>
    </div>
  )
}