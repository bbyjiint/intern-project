interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: 'Upload Resume' },
    { number: 2, label: 'General Information' },
    { number: 3, label: 'Education & Experience' },
    { number: 4, label: 'Projects & Skills' },
  ]

  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const isActive = step.number === currentStep
        const isCompleted = step.number < currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base transition-colors border-2 ${
                  isActive || isCompleted ? 'text-white border-white' : 'text-gray-400 border-gray-300'
                }`}
                style={{
                  backgroundColor: isActive || isCompleted ? '#0273B1' : '#E5E7EB',
                  lineHeight: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span style={{ lineHeight: '1', display: 'inline-block' }}>{step.number}</span>
                )}
              </div>
              <span
                className={`mt-1 font-medium leading-tight whitespace-nowrap ${
                  isActive ? 'text-gray-900' : 'text-gray-400'
                }`}
                style={{
                  fontSize: '7px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '90px',
                  display: 'block',
                  lineHeight: '1.2'
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={`h-1 mx-8 transition-colors rounded-full ${
                  isCompleted ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                style={{
                  backgroundColor: isCompleted ? '#0273B1' : '#E5E7EB',
                  width: '120px'
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
