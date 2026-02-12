'use client'

interface Step4PostPreviewProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step4PostPreview({ data }: Step4PostPreviewProps) {
  // Ensure data exists with defaults
  const safeData = data || {
    jobTitle: '',
    locationProvince: '',
    locationDistrict: '',
    jobType: '',
    workplaceType: 'on-site',
    allowance: '',
    allowancePeriod: 'Month',
    noAllowance: false,
    jobPostStatus: 'urgent',
    jobDescription: '',
    jobSpecification: '',
    screeningQuestions: [],
    rejectionMessage: '',
  }

  const getWorkplaceTypeLabel = (type: string) => {
    switch (type) {
      case 'on-site':
        return 'On-site'
      case 'hybrid':
        return 'Hybrid'
      case 'remote':
        return 'Remote (Work From Home)'
      default:
        return type || ''
    }
  }

  const formatDescription = (text: string) => {
    if (!text) return ''
    // Split by newlines and filter empty lines, then number them
    const lines = text.split('\n').filter((line) => line.trim())
    return lines.map((line, index) => `${index + 1}. ${line.trim()}`).join('\n')
  }

  // Get company data from localStorage (employer profile)
  let employerProfile: any = {}
  try {
    employerProfile = JSON.parse(localStorage.getItem('employerProfileData') || '{}')
  } catch (e) {
    console.error('Failed to parse employer profile:', e)
  }
  const companyName = employerProfile.companyName || ''
  const companyLogo = companyName ? companyName.substring(0, 7).toUpperCase() : ''
  const profileImage = employerProfile.profileImage || null

  // Format location
  const locationParts = []
  if (safeData.locationDistrict) locationParts.push(safeData.locationDistrict)
  if (safeData.locationProvince) locationParts.push(safeData.locationProvince)
  const location = locationParts.join(', ') || ''

  // Format allowance
  const allowanceDisplay = safeData.noAllowance
    ? 'No Allowance'
    : safeData.allowance
    ? `${safeData.allowance} / ${safeData.allowancePeriod || 'Month'}`
    : ''

  return (
    <div>
      <h2 className="text-xl font-bold mb-6" style={{ color: '#1C2D4F' }}>
        Post Preview
      </h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6 relative">
        {/* URGENT Badge - Positioned top-right, aligned with job title */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          {safeData.jobPostStatus === 'urgent' && (
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">
              URGENT
            </span>
          )}
        </div>

        {/* Company Logo and Job Title Section */}
        <div className="flex items-start gap-6 mb-6 pr-40">
          <div className="flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={companyName || 'Company Logo'}
                className="w-20 h-20 rounded-lg object-cover border-2 border-black shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 bg-red-600 rounded-lg flex flex-col items-center justify-center border-2 border-black shadow-sm relative overflow-hidden">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[16px] border-l-transparent border-r-transparent border-b-white"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black py-1 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold uppercase tracking-tight">
                    {companyLogo}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1">
            {/* Job Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {safeData.jobTitle || ''}
            </h3>
            {/* Company Name */}
            <p className="text-gray-600 mb-2">
              {companyName || ''}
            </p>
            {/* Location */}
            <input
              type="text"
              value={location}
              readOnly
              disabled
              placeholder=""
              className="px-3 py-1 border border-gray-300 rounded-full bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Job Description - Always show */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-3">Job Description</h4>
          <textarea
            readOnly
            disabled
            value={formatDescription(safeData.jobDescription || '')}
            placeholder=""
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-[150px] resize-none cursor-not-allowed"
            style={{ fontFamily: 'inherit' }}
          />
        </div>

        {/* Job Specification - Always show */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-3">Job Specification</h4>
          <textarea
            readOnly
            disabled
            value={formatDescription(safeData.jobSpecification || '')}
            placeholder=""
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-[150px] resize-none cursor-not-allowed"
            style={{ fontFamily: 'inherit' }}
          />
        </div>

        {/* Job Type - Always show */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-2">Job Type</h4>
          <input
            type="text"
            value={safeData.jobType || ''}
            readOnly
            disabled
            placeholder=""
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Allowance - Always show */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-2">Allowance</h4>
          <input
            type="text"
            value={allowanceDisplay}
            readOnly
            disabled
            placeholder=""
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Workplace Type - Always show */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-2">Workplace Type</h4>
          <input
            type="text"
            value={getWorkplaceTypeLabel(safeData.workplaceType)}
            readOnly
            disabled
            placeholder=""
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Screening Questions - Always show section, show questions if exist */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-3">Screening Questions</h4>
          {safeData.screeningQuestions && safeData.screeningQuestions.length > 0 ? (
            <div className="space-y-4">
              {safeData.screeningQuestions.map((question: any, index: number) => (
                <div key={question.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-600">Question {index + 1}:</span>
                    <p className="text-gray-900 mt-1">{question.question || ''}</p>
                  </div>
                  {question.questionType === 'multiple-choice' && question.choices && question.choices.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600">Choices:</span>
                      <ul className="list-disc list-inside mt-1 text-gray-700">
                        {question.choices.map((choice: string, choiceIndex: number) => (
                          <li key={choiceIndex}>{choice || ''}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {question.idealAnswer && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600">Ideal Answer:</span>
                      <p className="text-gray-700 mt-1">{question.idealAnswer}</p>
                    </div>
                  )}
                  {question.automaticRejection && (
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                        Automatic Rejection Enabled
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-gray-500 text-sm">No screening questions added</p>
            </div>
          )}
        </div>

        {/* Rejection Message - Always show */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-900 mb-2">Rejection Message</h4>
          <textarea
            readOnly
            disabled
            value={safeData.rejectionMessage || ''}
            placeholder=""
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-[100px] resize-none cursor-not-allowed"
            style={{ fontFamily: 'inherit' }}
          />
        </div>
      </div>
    </div>
  )
}
