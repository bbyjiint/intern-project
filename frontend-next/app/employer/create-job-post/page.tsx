'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import JobPostProgressIndicator from '@/components/job-post/JobPostProgressIndicator'
import Step1JobDetails from '@/components/job-post/Step1JobDetails'
import Step2JobDescription from '@/components/job-post/Step2JobDescription'
import Step3PostSettings from '@/components/job-post/Step3PostSettings'
import Step4PostPreview from '@/components/job-post/Step4PostPreview'
import ConfirmationModal from '@/components/job-post/ConfirmationModal'

const initialFormData = {
  // Step 1: Job Details
  jobTitle: '',
  locationProvince: '',
  locationDistrict: '',
  jobType: '',
  workplaceType: 'on-site' as 'on-site' | 'hybrid' | 'remote',
  allowance: '',
  allowancePeriod: 'Month' as 'Month' | 'Week' | 'Day',
  noAllowance: false,
  jobPostStatus: 'urgent' as 'urgent' | 'not-urgent',
  // Step 2: Job Description
  jobDescription: '',
  jobSpecification: '',
  // Step 3: Post Settings
  screeningQuestions: [] as Array<{
    id: string
    question: string
    questionType: 'text' | 'multiple-choice'
    choices?: string[]
    idealAnswer: string
    automaticRejection: boolean
  }>,
  rejectionMessage: '',
  // Step 4: Preview (derived from above)
}

export default function CreateJobPostPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [formData, setFormData] = useState(initialFormData)

  // Reset form when component mounts (when navigating back from success page)
  useEffect(() => {
    setFormData({ ...initialFormData })
    setCurrentStep(1)
    setShowConfirmationModal(false)
  }, [])

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Step 4: Show confirmation modal before posting
      setShowConfirmationModal(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePublish = () => {
    // Save job post to localStorage (will be replaced with API call later)
    const jobPosts = JSON.parse(localStorage.getItem('jobPosts') || '[]')
    const newJobPost = {
      id: Date.now().toString(),
      ...formData,
      companyName: JSON.parse(localStorage.getItem('employerProfileData') || '{}').companyName || 'Company Name',
      companyLogo: 'TRINITY',
      location: `${formData.locationDistrict}, ${formData.locationProvince}`,
      postedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    jobPosts.push(newJobPost)
    localStorage.setItem('jobPosts', JSON.stringify(jobPosts))
    
    // Redirect to success page
    router.push('/employer/create-job-post/success')
  }

  const updateFormData = useCallback((stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }))
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #E3F2FD 0%, #FFFFFF 300px)' }}>
      <EmployerNavbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#1C2D4F' }}>
            Create a Job Post
          </h1>
          <JobPostProgressIndicator currentStep={currentStep} totalSteps={4} />
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {currentStep === 1 && (
            <Step1JobDetails
              data={formData}
              onUpdate={updateFormData}
            />
          )}
          {currentStep === 2 && (
            <Step2JobDescription
              data={formData}
              onUpdate={updateFormData}
            />
          )}
          {currentStep === 3 && (
            <Step3PostSettings
              data={formData}
              onUpdate={updateFormData}
            />
          )}
          {currentStep === 4 && (
            <Step4PostPreview
              data={formData}
              onUpdate={updateFormData}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
            {currentStep === 4 ? (
              <>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm transition-colors h-11"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #0273B1',
                    color: '#0273B1',
                    minWidth: '120px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0F4F8'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Keep Editing
                </button>
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
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handlePrevious}
                  className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm transition-colors h-11"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #0273B1',
                    color: '#0273B1',
                    minWidth: '120px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0F4F8'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                  disabled={currentStep === 1}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
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
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <ConfirmationModal
          onKeepEditing={() => setShowConfirmationModal(false)}
          onPost={handlePublish}
        />
      )}
    </div>
  )
}
