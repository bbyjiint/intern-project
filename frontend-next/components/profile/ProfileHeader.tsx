'use client'

import Link from "next/link"

interface ProfileHeaderProps {
  fullName: string
  currentDate: string
  completionPercentage: number
}

export default function ProfileHeader({ fullName, currentDate, completionPercentage }: ProfileHeaderProps) {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left Side: Title and Date grouped together */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-[#1C2D4F] dark:text-white transition-colors">
          Welcome, {fullName || 'User'}
        </h1>
        <p className="text-sm md:text-base font-medium text-gray-500 dark:text-slate-400 transition-colors">
          {currentDate}
        </p>
      </div>

      {/* Right Side: Dev Mode Button */}
      <div>
        <Link 
          href="/intern/profile-setup"
          className="inline-flex items-center px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-sm font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Profile Setup (Dev Mode)
        </Link>
      </div>
    </div>
  )
}