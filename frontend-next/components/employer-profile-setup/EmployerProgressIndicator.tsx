interface EmployerProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function EmployerProgressIndicator({ currentStep, totalSteps }: EmployerProgressIndicatorProps) {
  const steps = [
    { number: 1, label: 'General Information' },
    { number: 2, label: 'Company Address' },
    { number: 3, label: 'Contact Information' },
  ]

  return (
    <div className="flex items-center justify-center overflow-x-auto pb-2">
      <div className="flex items-center min-w-max px-2">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep
          const isCompleted = step.number < currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base transition-colors border-2 ${
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
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span style={{ lineHeight: '1', display: 'inline-block' }}>{step.number}</span>
                  )}
                </div>
                <span
                  className={`text-[7px] sm:text-[8px] mt-1 font-medium leading-tight text-center max-w-[60px] sm:max-w-none ${
                    isActive ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`h-1 w-8 sm:w-16 md:w-24 lg:w-32 mx-2 sm:mx-4 md:mx-6 lg:mx-8 transition-colors rounded-full ${
                    isCompleted ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: isCompleted ? '#0273B1' : '#E5E7EB'
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
