'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Step1GeneralInfo from '@/components/profile-setup/Step1GeneralInfo'
import Step2BackgroundExperience from '@/components/profile-setup/Step2BackgroundExperience'
import Step3SkillsProjects from '@/components/profile-setup/Step3SkillsProjects'
import ProgressIndicator from '@/components/profile-setup/ProgressIndicator'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    location: '',
    email: '',
    phoneNumber: '',
    aboutYou: '',
    // Step 2
    professionalSummary: '',
    education: [],
    experience: [],
    // Step 3
    skills: [],
    projects: [],
  })

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep === 1) {
      router.push('/role-selection')
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateProfile = () => {
    // TODO: Submit form data to backend
    console.log('Creating profile with data:', formData)
    // router.push('/intern/dashboard')
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
            <span className="text-xl font-semibold tracking-tight" style={{ color: '#1C2D4F' }}>
              CompanyHub.
            </span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#1C2D4F' }}>
          Start building your profile
        </h1>

        {/* Progress Indicator */}
        <div className="mb-4">
          <ProgressIndicator currentStep={currentStep} totalSteps={3} />
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-10">
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
                className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors h-11"
                style={{ backgroundColor: '#0273B1', minWidth: '120px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0273B1'
                }}
              >
                Create Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
