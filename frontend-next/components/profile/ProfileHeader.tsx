'use client'

interface ProfileHeaderProps {
  fullName: string
  currentDate: string
  completionPercentage: number
}

export default function ProfileHeader({ fullName, currentDate, completionPercentage }: ProfileHeaderProps) {
  return (
    <div className="mb-8">
      {/* 1. ปรับสี Title: ใช้ slate-900 (เกือบดำ) ในโหมดสว่าง และ white ในโหมดมืด */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-[#1C2D4F] dark:text-white transition-colors">
        Welcome, {fullName || 'User'}
      </h1>
      
      {/* 2. ปรับสีวันที่: ให้ Contrast ชัดขึ้นในโหมดมืดด้วย slate-400 */}
      <p className="text-sm md:text-base font-medium text-gray-500 dark:text-slate-400 transition-colors">
        {currentDate}
      </p>

    </div>
  )
}