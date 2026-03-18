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
      className={`bg-white dark:bg-gray-800 border-2 rounded-2xl shadow-md p-6 md:p-8 transition-all duration-300 cursor-pointer flex flex-col items-center group ${
        isActive 
          ? 'border-[#0273B1] scale-[1.03] shadow-xl' 
          : 'border-gray-100 dark:border-gray-700 hover:border-blue-200'
      }`}
    >
      <div className="text-center w-full flex flex-col items-center">
        <div className="flex justify-center items-center mb-5 w-full">
          <div 
            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300"
            style={{ 
              backgroundColor: isActive ? '#E3F2FD' : '#F1F5F9' 
            }}
          >
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12">
               {icon}
            </div>
          </div>
        </div>

        <h2 className={`text-xl md:text-2xl font-extrabold mb-2 transition-colors ${isActive ? 'text-[#0273B1]' : 'text-[#0F172A] dark:text-white'}`}>
          {title}
        </h2>

        <p className={`text-sm md:text-base mb-6 leading-relaxed min-h-[48px] font-medium transition-colors ${isActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-gray-400'}`}>
          {description}
        </p>

        {/* ปรับสีปุ่มตอน Mouse Out ให้เข้มขึ้นชัดเจน */}
        <button
          onClick={handleButtonClick}
          className={`w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all active:scale-95 shadow-sm border-2 ${
            isActive 
              ? 'bg-[#0273B1] border-[#0273B1] text-white shadow-blue-200' 
              : 'bg-white border-[#0F172A] text-[#0F172A] dark:bg-transparent dark:border-gray-400 dark:text-gray-200 hover:bg-[#0273B1] hover:border-[#0273B1] hover:text-white'
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
      await apiFetch(`/api/auth/me/role`, {
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
      await apiFetch(`/api/auth/me/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: 'COMPANY' }),
      })
      router.push('/employer/profile-setup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set role')
      setIsSubmitting(false)
    }
  }

  const getIconStroke = (role: 'intern' | 'employer') => {
    return (selectedRole === role || hoveredRole === role) ? '#0273B1' : '#0F172A'
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-gray-950 transition-colors overflow-hidden px-4">
      <div className="max-w-5xl w-full">
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] md:rounded-[3rem] shadow-2xl p-6 md:p-12 border border-gray-100 dark:border-gray-800 relative">
          
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white mb-4 tracking-tight">
              Ready to get started<span className="text-[#0273B1]">?</span>
            </h1>
            <p className="text-base md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-semibold">
              Join thousands of students and employers already using our platform to build the future.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div onMouseEnter={() => setHoveredRole('intern')} onMouseLeave={() => setHoveredRole(null)}>
              <RoleCard
                icon={
                  <svg className="w-full h-full" fill="none" stroke={getIconStroke('intern')} strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
                  </svg>
                }
                title="I'm an Intern"
                description="Looking for internships and entry-level roles in finance."
                buttonText={isSubmitting && selectedRole === 'intern' ? 'Redirecting...' : 'Continue as Intern'}
                onClick={handleInternClick}
                isSelected={selectedRole === 'intern'}
                onCardClick={() => setSelectedRole('intern')}
                isHovered={hoveredRole === 'intern'}
              />
            </div>

            <div onMouseEnter={() => setHoveredRole('employer')} onMouseLeave={() => setHoveredRole(null)}>
              <RoleCard
                icon={
                  <svg className="w-full h-full" fill="none" stroke={getIconStroke('employer')} strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .414-.336.75-.75.75H4.5a.75.75 0 01-.75-.75v-4.25m16.5 0a3 3 0 00-3-3H7.125a3 3 0 00-3 3m16.5 0V10.5A2.25 2.25 0 0018 8.25h-2.25V6.75a2.25 2.25 0 00-2.25-2.25h-3a2.25 2.25 0 00-2.25 2.25v1.5H6a2.25 2.25 0 00-2.25 2.25v3.65m10.5-3.4h-4.5" />
                  </svg>
                }
                title="I'm an Employer"
                description="Looking to hire top finance talent for your firm."
                buttonText={isSubmitting && selectedRole === 'employer' ? 'Redirecting...' : 'Continue as Employer'}
                onClick={handleEmployerClick}
                isSelected={selectedRole === 'employer'}
                onCardClick={() => setSelectedRole('employer')}
                isHovered={hoveredRole === 'employer'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}