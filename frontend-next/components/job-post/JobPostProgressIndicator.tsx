interface JobPostProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function JobPostProgressIndicator({ currentStep, totalSteps }: JobPostProgressIndicatorProps) {
  const steps = [
    { number: 1, label: 'Job Details' },
    { number: 2, label: 'Job Description' },
    { number: 3, label: 'Post Settings' },
  ]

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep
          const isCompleted = step.number < currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-colors border-2 ${
                    isActive || isCompleted ? 'text-white border-white' : 'text-gray-400 border-gray-300'
                  }`}
                  style={{
                    backgroundColor: isActive || isCompleted ? '#0273B1' : '#E5E7EB',
                  }}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isActive ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`h-0.5 w-24 mx-4 transition-colors border-dashed ${
                    isCompleted ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{
                    borderTopWidth: '2px',
                    borderColor: isCompleted ? '#0273B1' : '#E5E7EB',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
