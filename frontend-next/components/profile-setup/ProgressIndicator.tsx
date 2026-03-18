"use client";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: 'Upload Resume' },
    { number: 2, label: 'General Information' },
    { number: 3, label: 'Education' },
    { number: 4, label: 'Projects' },
    { number: 5, label: 'Skills' },
  ];

  return (
    <div className="flex items-center justify-center p-4">
      {steps.map((step, index) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isLast = index === steps.length - 1;

        // Logic สำหรับสีและสไตล์
        const circleBg = isActive || isCompleted ? "bg-[#0273B1] dark:bg-blue-600" : "bg-gray-200 dark:bg-slate-800";
        const circleBorder = isActive || isCompleted ? "border-blue-200 dark:border-blue-900" : "border-gray-300 dark:border-slate-700";
        const textColor = isActive || isCompleted ? "text-slate-900 dark:text-white" : "text-gray-400 dark:text-slate-500";
        const labelWeight = isActive ? "font-extrabold" : "font-bold";

        return (
          <div key={step.number} className="flex items-center">
            {/* Step Circle & Label Wrapper */}
            <div className="flex flex-col items-center min-w-[80px]">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300 border-2 shadow-sm ${circleBg} ${circleBorder} ${isActive || isCompleted ? 'text-white' : 'text-gray-500 dark:text-slate-400'}`}
                style={{ lineHeight: '1' }}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-black leading-none">{step.number}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`mt-2 text-center transition-colors duration-300 ${textColor} ${labelWeight}`}
                style={{
                  fontSize: '11px',
                  width: '90px',
                  lineHeight: '1.2',
                  letterSpacing: '0.02em'
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className="mx-2 mb-6" // เลื่อนเส้นขึ้นเล็กน้อยเพื่อให้ขนานกับวงกลม (หักลบพื้นที่ label)
                style={{
                  height: '2px',
                  width: '50px',
                  backgroundImage: `linear-gradient(to right, ${
                    isCompleted 
                      ? (typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#3b82f6' : '#0273B1') 
                      : (typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#334155' : '#E5E7EB')
                  } 50%, transparent 50%)`,
                  backgroundSize: '12px 2px',
                  backgroundRepeat: 'repeat-x'
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}