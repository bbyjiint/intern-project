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
      className="rounded-lg shadow-md p-8 transition-all cursor-pointer"
      style={{
        backgroundColor: isActive ? 'rgba(2, 115, 177, 0.1)' : '#1A1C22',
        border: `2px solid ${isActive ? '#0273B1' : '#486284'}`,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = '#0273B1';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = '#486284';
        }
      }}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {icon}
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-3" style={{ color: '#FFFFFF', letterSpacing: '0' }}>
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm mb-6 text-center leading-relaxed" style={{ color: '#8CA2C0' }}>
          {description}
        </p>

        {/* Button */}
        <button
          onClick={handleButtonClick}
          className="w-full py-3 rounded-lg font-semibold text-sm transition-colors"
          style={
            isActive
              ? {
                  backgroundColor: '#0273B1',
                  border: '1px solid #486284',
                  color: '#FFFFFF'
                }
              : {
                  backgroundColor: 'transparent',
                  border: '1px solid #486284',
                  color: '#A9B4CD'
                }
          }
          onMouseEnter={(e) => {
            if (isActive) {
              e.currentTarget.style.backgroundColor = '#0284CC';
              e.currentTarget.style.borderColor = '#0284CC';
            } else {
              e.currentTarget.style.borderColor = '#0273B1';
              e.currentTarget.style.color = '#FFFFFF';
            }
          }}
          onMouseLeave={(e) => {
            if (isActive) {
              e.currentTarget.style.backgroundColor = '#0273B1';
              e.currentTarget.style.borderColor = '#486284';
            } else {
              e.currentTarget.style.borderColor = '#486284';
              e.currentTarget.style.color = '#A9B4CD';
            }
          }}
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
  <div className="min-h-screen w-full flex items-center justify-center py-12 px-4" style={{ backgroundColor: '#121316' }}>
    
    {/* 2. ส่วนของเนื้อหาหลัก */}
    <div className="max-w-4xl w-full">
      
      {/* 3. กล่อง Card ใหญ่ (เพิ่ม shadow และ border ให้ดูมีมิติ) */}
      <div className="rounded-2xl shadow-xl p-8 md:p-16" style={{ backgroundColor: '#121212', border: '1px solid #486284' }}>
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: '#FFFFFF' }}>
            Ready to get started?
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#8CA2C0' }}>
            Join thousands of students and employers already using our platform to build the future of finance.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: '#486284', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
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
                    backgroundColor: (selectedRole === 'intern' || hoveredRole === 'intern') ? 'rgba(2, 115, 177, 0.2)' : 'rgba(72, 98, 132, 0.2)' 
                  }}
                >
                  <svg className="w-12 h-12" style={{ color: (selectedRole === 'intern' || hoveredRole === 'intern') ? '#0273B1' : '#A9B4CD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    backgroundColor: (selectedRole === 'employer' || hoveredRole === 'employer') ? 'rgba(2, 115, 177, 0.2)' : 'rgba(72, 98, 132, 0.2)' 
                  }}
                >
                  <svg className="w-12 h-12" style={{ color: (selectedRole === 'employer' || hoveredRole === 'employer') ? '#0273B1' : '#A9B4CD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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