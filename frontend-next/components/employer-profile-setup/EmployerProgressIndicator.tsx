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
    <div className="pb-1">
      <div className="mx-auto flex items-start justify-center">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep
          const isCompleted = step.number < currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.number} className="flex items-start">
              <div className="flex w-[136px] flex-col items-center text-center">
                <div
                  className="flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 text-[0px] font-semibold transition-colors sm:h-[18px] sm:w-[18px]"
                  style={{
                    backgroundColor: isActive || isCompleted ? '#0273B1' : '#F8FAFC',
                    borderColor: isActive || isCompleted ? '#0273B1' : '#CBD5E1',
                  }}
                />
                <span
                  className="mt-[16px] text-[11px] font-semibold leading-tight"
                  style={{ color: isActive || isCompleted ? '#0273B1' : '#D1D5DB' }}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className="mt-[8px] h-0 w-[56px] border-t-[3px] border-dashed"
                  style={{
                    borderColor: isCompleted ? '#0273B1' : '#CBD5E1'
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
