interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: 'Upload Resume' },
    { number: 2, label: 'General Information' },
    { number: 3, label: 'Education' },
    { number: 4, label: 'Projects' },
    { number: 5, label: 'Skills' },
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
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors border-2 ${
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span style={{ lineHeight: '1', display: 'inline-block' }}>{step.number}</span>
                )}
              </div>
              <span
                className={`mt-1.5 font-medium leading-tight whitespace-nowrap ${
                  isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                }`}
                style={{
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100px',
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
                className="mx-4"
                style={{
                  height: '2px',
                  width: '60px',
                  background: isCompleted
                    ? 'repeating-linear-gradient(to right, #0273B1 0, #0273B1 8px, transparent 8px, transparent 16px)'
                    : 'repeating-linear-gradient(to right, #E5E7EB 0, #E5E7EB 8px, transparent 8px, transparent 16px)'
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
