'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, setToken } from '@/lib/api'

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
      className="bg-white border-2 rounded-lg shadow-md p-8 transition-colors cursor-pointer"
      style={{
        borderColor: isActive ? '#0273B1' : '#E5E7EB'
      }}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {icon}
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-3" style={{ color: '#1C2D4F', letterSpacing: '0' }}>
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm mb-6 text-center leading-relaxed" style={{ color: '#A9B4CD' }}>
          {description}
        </p>

        {/* Button */}
        <button
          onClick={handleButtonClick}
          className="w-full py-3 rounded-lg font-semibold text-sm transition-colors"
          style={isActive ? {
            backgroundColor: '#0273B1',
            color: 'white',
            border: 'none'
          } : {
            backgroundColor: 'transparent',
            border: '2px solid #1C2D4F',
            color: '#1C2D4F'
          }}
          onMouseEnter={(e) => {
            if (isActive) {
              e.currentTarget.style.backgroundColor = '#025a8f'
              e.currentTarget.style.border = 'none'
            }
          }}
          onMouseLeave={(e) => {
            if (isActive) {
              e.currentTarget.style.backgroundColor = '#0273B1'
              e.currentTarget.style.border = 'none'
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

  const handleInternClick = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      const data = await apiFetch<{ token: string }>(`/api/auth/me/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: 'CANDIDATE' }),
      })
      setToken(data.token)
      router.push('/intern/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set role')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmployerClick = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      const data = await apiFetch<{ token: string }>(`/api/auth/me/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: 'COMPANY' }),
      })
      setToken(data.token)
      router.push('/employer/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set role')
    } finally {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Join thousands of students and employers already using our platform to build the future of finance.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onMouseEnter={() => setHoveredRole('intern')}
              onMouseLeave={() => setHoveredRole(null)}
            >
              <RoleCard
                icon={
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={(selectedRole === 'intern' || hoveredRole === 'intern') ? { backgroundColor: '#E3F2FD' } : { backgroundColor: '#F5F5F5' }}
                  >
                    <svg
                      className="w-10 h-10"
                      style={{ color: (selectedRole === 'intern' || hoveredRole === 'intern') ? '#0273B1' : '#1C2D4F' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14v7M5.176 14.248a12.078 12.078 0 01.665-6.479L12 14l-6.824-2.998a11.952 11.952 0 00-2.978 3.246zM18.824 11.002a12.078 12.078 0 01.665 6.479L12 14l6.824-2.998a11.952 11.952 0 012.978 3.246z"
                      />
                    </svg>
                  </div>
                }
                title="I'm a Intern"
                description="Looking for internships and entry-level roles."
                buttonText={isSubmitting ? 'Please wait...' : 'Continue as Intern'}
                onClick={handleInternClick}
                isSelected={selectedRole === 'intern'}
                onCardClick={handleInternSelect}
                isHovered={hoveredRole === 'intern'}
              />
            </div>

            <div
              onMouseEnter={() => setHoveredRole('employer')}
              onMouseLeave={() => setHoveredRole(null)}
            >
              <RoleCard
                icon={
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={(selectedRole === 'employer' || hoveredRole === 'employer') ? { backgroundColor: '#E3F2FD' } : { backgroundColor: '#F5F5F5' }}
                  >
                    <svg
                      className="w-10 h-10"
                      style={{ color: (selectedRole === 'employer' || hoveredRole === 'employer') ? '#0273B1' : '#1C2D4F' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
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

