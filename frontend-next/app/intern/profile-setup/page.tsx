'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import Step0UploadResume from '@/components/profile-setup/Step0UploadResume'
import Step1GeneralInfo from '@/components/profile-setup/Step1GeneralInfo'
import Step2BackgroundExperience from '@/components/profile-setup/Step2BackgroundExperience'
import ProjectsSection from '@/components/profile-setup/ProjectsSection'
import Step3SkillsProjects from '@/components/profile-setup/Step3SkillsProjects'
import ProgressIndicator from '@/components/profile-setup/ProgressIndicator'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false)
  const [showProfileCreatedModal, setShowProfileCreatedModal] = useState(false)

  // Check if user has correct role
  useEffect(() => {
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

  // Load existing profile data for editing (API first, then localStorage as fallback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stepParam = params.get('step')
    if (stepParam) {
      const step = parseInt(stepParam, 10)
      if (step >= 1 && step <= 5) {
        setCurrentStep(step)
      }
    }

    const loadProfile = async () => {
      try {
        // Try to load from API first (this is the source of truth)
        const data = await apiFetch<{ profile: any }>('/api/candidates/profile')
        const profile = data.profile || {}
        
        // Prioritize API data, but keep any existing form data if API doesn't have it
        setFormData((prev) => ({
          resumeUrl: profile.resumeUrl || prev.resumeUrl || null,
          resumeFile: profile.resumeFile || prev.resumeFile || null,
          fullName: profile.fullName || prev.fullName || '',
          email: profile.email || prev.email || '',
          phoneNumber: profile.phoneNumber || prev.phoneNumber || '',
          aboutYou: profile.aboutYou || profile.professionalSummary || prev.aboutYou || '',
          photo: profile.profileImage || prev.photo || null,
          profileImage: profile.profileImage || prev.profileImage || null,
          education: profile.education?.length ? profile.education : (prev.education || []),
          projects: profile.projects?.length ? profile.projects : (prev.projects || []),
          experience: profile.experience?.length ? profile.experience : (prev.experience || []),
          skills: profile.skills?.length ? profile.skills : (prev.skills || []),
        }))
        
        // Update localStorage with API data
        localStorage.setItem('internProfileData', JSON.stringify(profile))
      } catch (err: any) {
        if (err?.status === 404) {
          // Profile doesn't exist yet, try localStorage as fallback
          const savedData = localStorage.getItem('internProfileData')
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData)
              setFormData((prev) => ({ ...prev, ...parsed }))
            } catch (e) {
              console.error('Failed to parse profile data:', e)
            }
          }
          return
        }
        console.error('Failed to load profile data:', err)
        // On error, try localStorage as fallback
        const savedData = localStorage.getItem('internProfileData')
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData)
            setFormData((prev) => ({ ...prev, ...parsed }))
          } catch (e) {
            console.error('Failed to parse profile data:', e)
          }
        }
      }
    }

    loadProfile()
  }, [])
  const [formData, setFormData] = useState({
    // Step 1
    resumeUrl: null,
    resumeFile: null,
    // Step 2
    fullName: '',
    email: '',
    phoneNumber: '',
    aboutYou: '',
    photo: null,
    profileImage: null,
    // Step 3
    education: [],
    experience: [],
    // Step 4
    projects: [],
    skills: [],
  })

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    if (currentStep === 1) {
      setCurrentStep(2) // Skip to General Information
    } else if (currentStep === 2) {
      setCurrentStep(3) // Skip to Education
    } else if (currentStep === 3) {
      setCurrentStep(4) // Skip to Projects
    }
  }

  const handleSkipProjects = () => {
    setCurrentStep(5) // Skip to Skills
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

  const handleSave = async () => {
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
          profileImage: formData.photo || formData.profileImage || null,
          resumeUrl: formData.resumeUrl || null,
          education: formData.education,
          projects: formData.projects,
          experience: formData.experience,
          skills: formData.skills,
        }),
      })
      
      // Save to localStorage as backup
      localStorage.setItem('internProfileData', JSON.stringify(formData))
      
      setIsSubmitting(false)
      setShowSaveModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
      setIsSubmitting(false)
    }
  }

  const handleCreateProfileClick = () => {
    setShowCreateProfileModal(true)
  }

  const handleConfirmCreateProfile = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setError(null)
    setShowCreateProfileModal(false)

    try {
      await apiFetch('/api/candidates/profile', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          aboutYou: formData.aboutYou,
          profileImage: formData.photo || formData.profileImage || null,
          resumeUrl: formData.resumeUrl || null,
          education: formData.education,
          projects: formData.projects,
          experience: formData.experience,
          skills: formData.skills,
        }),
      })
      
      // Clear localStorage
      localStorage.removeItem('internProfileData')
      
      setIsSubmitting(false)
      // Show success modal
      setShowProfileCreatedModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
      setIsSubmitting(false)
    }
  }

  const handleViewProfile = () => {
    // Redirect to find companies page
    router.push('/intern/find-companies')
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
        {/* Title and Progress Indicator */}
        <div className="mb-4 bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#1C2D4F' }}>
            Start building your profile
          </h1>
          <ProgressIndicator currentStep={currentStep} totalSteps={5} />
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-10">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {currentStep === 1 && (
            <Step0UploadResume
              data={formData}
              onUpdate={updateFormData}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 2 && (
            <Step1GeneralInfo
              data={formData}
              onUpdate={updateFormData}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 3 && (
            <Step2BackgroundExperience
              data={formData}
              onUpdate={updateFormData}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 4 && (
            <ProjectsSection
              data={formData}
              onUpdate={updateFormData}
              onSkip={handleSkipProjects}
            />
          )}
          {currentStep === 5 && (
            <Step3SkillsProjects
              data={formData}
              onUpdate={updateFormData}
              onSkip={handleSkipProjects}
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

            {currentStep < 5 ? (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
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
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleNext}
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
                  <>
                    Next
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                </button>
              </div>
            ) : (
              <button
                onClick={handleCreateProfileClick}
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
                Create Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Success Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 rounded-full border-4 border-green-200 flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Title */}
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#1C2D4F' }}>
                Saved Successfully
              </h2>
              
              {/* Message */}
              <p className="text-base mb-6" style={{ color: '#6B7280' }}>
                Your Information have been saved. You can update your profile at any time.
              </p>
              
              {/* OK Button */}
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-8 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
                style={{ backgroundColor: '#0273B1', minWidth: '120px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0273B1'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Profile Confirmation Modal */}
      {showCreateProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center">
              {/* Question Mark Icon */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#E3F5FF' }}>
                <svg className="w-12 h-12" style={{ color: '#0273B1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              {/* Title */}
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#1C2D4F' }}>
                Ready to Create Your Profile?
              </h2>
              
              {/* Message */}
              <p className="text-base mb-6" style={{ color: '#6B7280' }}>
                Are you sure you want to proceed? You can update your information at any time.
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowCreateProfileModal(false)}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #0273B1',
                    color: '#0273B1'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0F4F8'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreateProfile}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
                  style={{ backgroundColor: '#0273B1' }}
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
                  {isSubmitting ? 'Creating...' : 'Ready'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Created Success Modal */}
      {showProfileCreatedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center mb-4" style={{ borderColor: '#D1FAE5' }}>
                <svg className="w-12 h-12" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Title */}
              <h2 className="text-2xl font-bold mb-3" style={{ color: '#1C2D4F' }}>
                Your Profile Created
              </h2>
              
              {/* Message */}
              <p className="text-base mb-6" style={{ color: '#6B7280' }}>
                Your profile has been successfully created. You can update it at any time.
              </p>
              
              {/* View Profile Button */}
              <button
                onClick={handleViewProfile}
                className="px-8 py-3 rounded-lg font-semibold text-sm text-white transition-colors w-full"
                style={{ backgroundColor: '#0273B1' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0273B1'
                }}
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
