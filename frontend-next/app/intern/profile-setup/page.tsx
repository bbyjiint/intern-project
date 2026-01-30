'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch, getToken } from '@/lib/api'
import Step1GeneralInfo from '@/components/profile-setup/Step1GeneralInfo'
import Step2BackgroundExperience from '@/components/profile-setup/Step2BackgroundExperience'
import Step3SkillsProjects from '@/components/profile-setup/Step3SkillsProjects'
import ProgressIndicator from '@/components/profile-setup/ProgressIndicator'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Check if user has correct role
  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }

    // Check user role
    apiFetch<{ user: { role: string | null } }>('/api/auth/me')
      .then((data) => {
        setUserRole(data.user.role)
        if (data.user.role !== 'CANDIDATE') {
          router.push('/role-selection')
        }
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    email: '',
    phoneNumber: '',
    aboutYou: '',
    // Step 2
    education: [],
    projects: [],
    // Step 3
    experience: [],
    skills: [],
  })

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep === 1) {
      // If user already has a role, go back to profile page
      // Otherwise, go to role selection
      if (userRole === 'CANDIDATE') {
        router.push('/intern/profile')
      } else {
        router.push('/role-selection')
      }
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateProfile = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setError(null)

    try {
      await apiFetch('/api/candidates/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          aboutYou: formData.aboutYou,
          education: formData.education,
          projects: formData.projects,
          experience: formData.experience,
          skills: formData.skills,
        }),
      })
      
      // Clear localStorage
      localStorage.removeItem('internProfileData')
      // Redirect to find companies page after profile creation
      router.push('/intern/find-companies')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
      setIsSubmitting(false)
    }
  }

  const updateFormData = (stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F4F8' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 xl:px-16 py-4">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-semibold tracking-tight" style={{ color: '#0273B1' }}>
              CompanyHub
            </span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#1C2D4F' }}>
          Start building your profile
        </h1>

        {/* Progress Indicator */}
        <div className="mb-4">
          <ProgressIndicator currentStep={currentStep} totalSteps={3} />
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-10">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {currentStep === 1 && (
            <Step1GeneralInfo
              data={formData}
              onUpdate={updateFormData}
            />
          )}
          {currentStep === 2 && (
            <Step2BackgroundExperience
              data={formData}
              onUpdate={updateFormData}
            />
          )}
          {currentStep === 3 && (
            <Step3SkillsProjects
              data={formData}
              onUpdate={updateFormData}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm transition-colors h-11"
              style={{
                backgroundColor: 'white',
                border: '2px solid #0273B1',
                color: '#0273B1',
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F4F8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors h-11"
                style={{ backgroundColor: '#0273B1', minWidth: '120px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0273B1'
                }}
              >
                Continue
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleCreateProfile}
                disabled={isSubmitting}
                className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors h-11"
                style={{ backgroundColor: '#0273B1', minWidth: '120px' }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#025a8f'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#0273B1'
                  }
                }}
              >
                {isSubmitting ? 'Creating...' : 'Create Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
