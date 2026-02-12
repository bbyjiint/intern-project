'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import Step1GeneralInfo from '@/components/employer-profile-setup/Step1GeneralInfo'
import Step2CompanyAddress from '@/components/employer-profile-setup/Step2CompanyAddress'
import Step3ContactInfo from '@/components/employer-profile-setup/Step3ContactInfo'
import EmployerProgressIndicator from '@/components/employer-profile-setup/EmployerProgressIndicator'

export default function EmployerProfileSetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  
  // Check if user has correct role and load existing data
  useEffect(() => {
    // Check user role
    apiFetch<{ user: { role: string | null } }>('/api/auth/me')
      .then((data) => {
        setUserRole(data.user.role)
        if (data.user.role !== 'COMPANY') {
          router.push('/role-selection')
        }
      })
      .catch(() => {
        router.push('/login')
      })
    const params = new URLSearchParams(window.location.search)
    const stepParam = params.get('step')
    if (stepParam) {
      const step = parseInt(stepParam, 10)
      if (step >= 1 && step <= 3) {
        setCurrentStep(step)
      }
    }

    const loadProfile = async () => {
      try {
        // Try to load from API first (this is the source of truth)
        const data = await apiFetch<{ profile: any }>('/api/companies/profile')
        const profile = data.profile || {}
        
        // Prioritize API data, but keep any existing form data if API doesn't have it
        setFormData((prev) => ({
          companyName: profile.companyName || prev.companyName || '',
          companyDescription: profile.companyDescription || prev.companyDescription || '',
          businessType: profile.businessType || prev.businessType || '',
          companySize: profile.companySize || prev.companySize || '',
          addressDetails: profile.addressDetails || prev.addressDetails || '',
          subDistrict: profile.subDistrict || prev.subDistrict || '',
          district: profile.district || prev.district || '',
          province: profile.province || prev.province || '',
          postcode: profile.postcode || prev.postcode || '',
          phoneNumber: profile.phoneNumber || prev.phoneNumber || '',
          email: profile.email || prev.email || '',
          websiteUrl: profile.websiteUrl || prev.websiteUrl || '',
          contactName: profile.contactName || prev.contactName || '',
        }))
        
        // Update localStorage with API data
        localStorage.setItem('employerProfileData', JSON.stringify(profile))
      } catch (err: any) {
        if (err?.status === 404) {
          // Profile doesn't exist yet, try localStorage as fallback
          const savedData = localStorage.getItem('employerProfileData')
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData)
              setFormData(prev => ({ ...prev, ...parsed }))
            } catch (e) {
              console.error('Failed to parse profile data:', e)
            }
          }
          return
        }
        console.error('Failed to load profile data:', err)
        // On error, try localStorage as fallback
        const savedData = localStorage.getItem('employerProfileData')
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData)
            setFormData(prev => ({ ...prev, ...parsed }))
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
    companyName: '',
    companyDescription: '',
    businessType: '',
    companySize: '',
    // Step 2
    addressDetails: '',
    subDistrict: '',
    district: '',
    province: '',
    postcode: '',
    // Step 3
    phoneNumber: '',
    email: '',
    websiteUrl: '',
    contactName: '',
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
      if (userRole === 'COMPANY') {
        router.push('/employer/profile')
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
      await apiFetch('/api/companies/profile', {
        method: 'PUT',
        body: JSON.stringify({
          companyName: formData.companyName,
          companyDescription: formData.companyDescription,
          addressDetails: formData.addressDetails,
          subDistrict: formData.subDistrict,
          district: formData.district,
          province: formData.province,
          postcode: formData.postcode,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          websiteUrl: formData.websiteUrl,
          contactName: formData.contactName,
        }),
      })
      
      // Clear localStorage
      localStorage.removeItem('employerProfileData')
      // Redirect to find candidates page after profile creation
      router.push('/employer/find-candidates')
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
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center" style={{ color: '#0273B1' }}>
          Company Registration
        </h1>

        {/* Progress Indicator */}
        <div className="mb-4">
          <EmployerProgressIndicator currentStep={currentStep} totalSteps={3} />
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 lg:p-10">
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
            <Step2CompanyAddress
              data={formData}
              onUpdate={updateFormData}
            />
          )}
          {currentStep === 3 && (
            <Step3ContactInfo
              data={formData}
              onUpdate={updateFormData}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-8 sm:mt-10 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm transition-colors h-11 w-full sm:w-auto order-2 sm:order-1"
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
                className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors h-11 w-full sm:w-auto order-1 sm:order-2"
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
                className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors h-11 w-full sm:w-auto order-1 sm:order-2"
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
