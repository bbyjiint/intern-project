'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

interface RoleCardProps {
  icon: React.ReactNode
  title: string
  description: string
  buttonText: string
  onClick: () => void
  isSelected: boolean
  onCardClick: () => void
  isHovered: boolean
}

function RoleCard({ icon, title, description, buttonText, onClick, isSelected, onCardClick, isHovered }: RoleCardProps) {
  const handleCardClick = () => {
    onCardClick()
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCardClick()
    onClick()
  }

  const isActive = isSelected || isHovered

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white dark:bg-gray-800 border-2 rounded-lg shadow-md dark:shadow-gray-900/50 p-8 transition-colors cursor-pointer ${
        isActive 
          ? 'border-[#0273B1]' 
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {icon}
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-3 text-[#1C2D4F] dark:text-white transition-colors" style={{ letterSpacing: '0' }}>
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm mb-6 text-center leading-relaxed text-[#A9B4CD] dark:text-gray-300 transition-colors">
          {description}
        </p>

        {/* Button */}
        <button
          onClick={handleButtonClick}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
            isActive 
              ? 'bg-[#0273B1] hover:bg-[#025a8f] text-white border-none' 
              : 'bg-transparent border-2 border-[#1C2D4F] dark:border-gray-300 text-[#1C2D4F] dark:text-gray-300 hover:border-[#0273B1] dark:hover:border-blue-400 hover:text-[#0273B1] dark:hover:text-blue-400'
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}

export default function RoleSelectionPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'intern' | 'employer' | null>(null)
  const [hoveredRole, setHoveredRole] = useState<'intern' | 'employer' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if user has a session, redirect to login if not
  useEffect(() => {
    const check = async () => {
      try {
        const data = await apiFetch<{ authenticated: boolean }>(`/api/auth/session`)
        if (!data.authenticated) router.push('/login')
      } catch {
        router.push('/login')
      }
    }
    check()
  }, [router])

  const handleInternClick = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      await apiFetch<{ user: { id: string; email: string; role: string } }>(`/api/auth/me/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: 'CANDIDATE' }),
      })
      router.push('/intern/profile-setup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set role')
      setIsSubmitting(false)
    }
  }

  const handleEmployerClick = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      await apiFetch<{ user: { id: string; email: string; role: string } }>(`/api/auth/me/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: 'COMPANY' }),
      })
      router.push('/employer/profile-setup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set role')
      setIsSubmitting(false)
    }
  }

  const handleInternSelect = () => {
    setSelectedRole('intern')
  }

  const handleEmployerSelect = () => {
    setSelectedRole('employer')
  }

  return (
  /* 1. เปลี่ยนพื้นหลังที่ Wrapper นอกสุดให้คลุมทั้งจอ (min-h-screen และ w-full) */
  <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900 transition-colors">
    
    {/* 2. ส่วนของเนื้อหาหลัก */}
    <div className="max-w-4xl w-full">
      
      {/* 3. กล่อง Card ใหญ่ (เพิ่ม shadow และ border ให้ดูมีมิติ) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-16 border border-gray-100 dark:border-gray-700 transition-colors">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to get started?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of students and employers already using our platform to build the future of finance.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Intern Card */}
          <div
            onMouseEnter={() => setHoveredRole('intern')}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <RoleCard
              icon={
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{ 
                    backgroundColor: (selectedRole === 'intern' || hoveredRole === 'intern') ? '#E3F2FD' : '#F5F5F5' 
                  }}
                >
                  <svg className="w-12 h-12" style={{ color: (selectedRole === 'intern' || hoveredRole === 'intern') ? '#0273B1' : '#1C2D4F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7M5.176 14.248a12.078 12.078 0 01.665-6.479L12 14l-6.824-2.998a11.952 11.952 0 00-2.978 3.246zM18.824 11.002a12.078 12.078 0 01.665 6.479L12 14l6.824-2.998a11.952 11.952 0 012.978 3.246z" />
                  </svg>
                </div>
              }
              title="I'm an Intern"
              description="Looking for internships and entry-level roles."
              buttonText={isSubmitting ? 'Please wait...' : 'Continue as Intern'}
              onClick={handleInternClick}
              isSelected={selectedRole === 'intern'}
              onCardClick={handleInternSelect}
              isHovered={hoveredRole === 'intern'}
            />
          </div>

          {/* Employer Card */}
          <div
            onMouseEnter={() => setHoveredRole('employer')}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <RoleCard
              icon={
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{ 
                    backgroundColor: (selectedRole === 'employer' || hoveredRole === 'employer') ? '#E3F2FD' : '#F5F5F5' 
                  }}
                >
                  <svg className="w-12 h-12" style={{ color: (selectedRole === 'employer' || hoveredRole === 'employer') ? '#0273B1' : '#1C2D4F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              }
              title="I'm an Employer"
              description="Looking to hire top finance talent."
              buttonText={isSubmitting ? 'Please wait...' : 'Continue as Employer'}
              onClick={handleEmployerClick}
              isSelected={selectedRole === 'employer'}
              onCardClick={handleEmployerSelect}
              isHovered={hoveredRole === 'employer'}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}