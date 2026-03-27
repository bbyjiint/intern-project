interface EmployerProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

const STEPS = [
  { number: 1, label: 'General Information' },
  { number: 2, label: 'Company Address' },
  { number: 3, label: 'Contact Information' },
] as const

export default function EmployerProgressIndicator({
  currentStep,
  totalSteps,
}: EmployerProgressIndicatorProps) {
  const currentLabel =
    STEPS.find((s) => s.number === currentStep)?.label ?? ''
  const progressPercent = Math.max(
    0,
    Math.min(100, (currentStep / totalSteps) * 100),
  )

  return (
    <div className="w-full">
      <p className="sr-only">
        Step {currentStep} of {totalSteps}, {currentLabel}
      </p>

      {/* Mobile: step row + bar (aligned with intern profile-setup) */}
      <div className="w-full space-y-1.5 md:hidden">
        <div className="flex items-center justify-between gap-2">
          <span className="shrink-0 text-xs font-semibold tabular-nums text-[#1C2D4F] dark:text-white">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="min-w-0 max-w-[58%] truncate text-right text-xs font-medium leading-tight text-[#64748B] dark:text-[#8A94A6]">
            {currentLabel}
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB] dark:bg-[#1A2E44]">
          <div
            className="h-full rounded-full bg-[#2F80ED] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop / tablet: horizontal stepper (aligned with intern ProgressIndicator) */}
      <div className="hidden w-full items-center justify-center gap-2 md:flex">
        {STEPS.map((step, index) => {
          const isActive = step.number === currentStep
          const isCompleted = step.number < currentStep
          const isLast = index === STEPS.length - 1

          return (
            <div key={step.number} className="flex min-w-0 items-center">
              <div className="flex w-[108px] flex-col items-center text-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold leading-none transition-colors ${
                    isActive || isCompleted
                      ? 'border-white text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                  style={{
                    backgroundColor:
                      isActive || isCompleted ? '#0273B1' : '#E5E7EB',
                  }}
                >
                  {isCompleted ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-1 text-xs font-medium leading-tight whitespace-nowrap ${
                    isActive || isCompleted
                      ? 'text-gray-900 dark:text-slate-100'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className="h-[2px] w-10"
                  style={{
                    background: isCompleted
                      ? 'repeating-linear-gradient(to right, #0273B1 0, #0273B1 8px, transparent 8px, transparent 16px)'
                      : 'repeating-linear-gradient(to right, #E5E7EB 0, #E5E7EB 8px, transparent 8px, transparent 16px)',
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
