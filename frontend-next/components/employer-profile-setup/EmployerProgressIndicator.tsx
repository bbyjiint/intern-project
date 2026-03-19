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
    <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep
          const isCompleted = step.number < currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex w-[144px] flex-col items-center text-center">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold leading-none transition-colors"
                  style={{
                    backgroundColor: isActive || isCompleted ? '#0273B1' : 'transparent',
                    borderColor: isActive || isCompleted ? '#0273B1' : '#E5E5E5',
                    color: isActive || isCompleted ? '#FFFFFF' : '#E5E5E5',
                  }}
                >
                  {step.number}
                </div>
                <span
                  className="mt-1.5 max-w-[100px] text-[10px] font-medium leading-tight"
                  style={{ color: isActive || isCompleted ? '#0273B1' : '#E5E5E5' }}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className="mx-4 h-[2px] w-[60px]"
                  style={{
                    background: isCompleted
                      ? 'repeating-linear-gradient(to right, #0273B1 0, #0273B1 8px, transparent 8px, transparent 16px)'
                      : 'repeating-linear-gradient(to right, #E5E5E5 0, #E5E5E5 8px, transparent 8px, transparent 16px)'
                  }}
                />
              )}
            </div>
          )
        })}
    </div>
  )
}
