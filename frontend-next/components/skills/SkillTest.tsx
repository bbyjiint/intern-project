"use client";

import { useState } from "react";

interface SkillTestProps {
  skillName: string;
  onBack: () => void;
}

const MOCK_QUESTIONS = [
  { id: 1, question: "What is the primary goal of technical analysis in trading?" },
  { id: 2, question: "Explain the difference between a 'Bull Market' and a 'Bear Market'." },
  { id: 3, question: "What does ROI stand for, and how is it generally calculated?" },
  { id: 4, question: "What is the significance of the Relative Strength Index (RSI) in identifying overbought conditions?" },
  { id: 5, question: "How does a 'Stop-Loss' order help in risk management?" },
  { id: 6, question: "Describe the concept of 'Support' and 'Resistance' levels." },
  { id: 7, question: "What is the main difference between Fundamental and Technical analysis?" },
  { id: 8, question: "How do Moving Averages help traders identify market trends?" },
  { id: 9, question: "What is 'Candlestick charting' and why is it preferred by many traders?" },
  { id: 10, question: "Explain what 'Market Volatility' represents and how it is measured (e.g., ATR)." },
];

export default function SkillTest({ skillName, onBack }: SkillTestProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(MOCK_QUESTIONS.length).fill(""));
  const [isFinished, setIsFinished] = useState(false);

  const progress = ((currentStep + 1) / MOCK_QUESTIONS.length) * 100;

  const handleNext = () => {
    if (currentStep < MOCK_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleAnswerChange = (val: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = val;
    setAnswers(newAnswers);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4 font-sans animate-in fade-in duration-700">
      {!isFinished ? (
        <>
          {/* Top Card: Title & Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-[#0066CC]" />
             <div className="mb-2">
                <h1 className="text-4xl font-bold text-[#0066CC] mb-1">Mini-Quiz</h1>
                <p className="text-blue-400 text-sm font-medium uppercase tracking-wider">
                  Category : financial services and investment
                </p>
             </div>
             
             <div className="mt-6 max-w-2xl mx-auto">
                <p className="text-[#0066CC] font-semibold mb-3">
                    Question {currentStep + 1} of {MOCK_QUESTIONS.length}
                </p>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                  <div 
                    className="h-full bg-[#0066CC] transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
             </div>
          </div>

          {/* Bottom Card: Question & Input */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 relative">
            <div className="flex justify-end mb-4">
              <button 
                onClick={handleNext}
                className="text-xs font-bold text-blue-500 bg-blue-50 px-4 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
              >
                Skip
              </button>
            </div>

            <div className="mb-10">
              <h3 className="text-2xl font-bold text-black leading-tight mb-6">
                {MOCK_QUESTIONS[currentStep].question}
              </h3>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black uppercase tracking-widest">
                  Answer
                </label>
                <textarea 
                  value={answers[currentStep]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-full min-h-[100px] p-4 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-gray-50/30 text-gray-700 transition-all placeholder:text-gray-400" 
                  placeholder="Please provide a short explanation." 
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center gap-4">
              <button 
                onClick={handlePrevious} 
                className="flex-1 max-w-[200px] py-3 border-2 border-[#0066CC] text-[#0066CC] rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all"
              >
                <span className="text-lg">‹</span> Previous
              </button>
              
              <button 
                onClick={handleNext}
                disabled={!answers[currentStep].trim()}
                className={`flex-1 max-w-[200px] py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  answers[currentStep].trim() 
                  ? "bg-[#D9D9D9] text-gray-700 hover:bg-gray-300 shadow-sm" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {currentStep === MOCK_QUESTIONS.length - 1 ? "Finish" : "Continue"} <span className="text-lg">›</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-16 text-center border-t-8 border-[#0066CC]">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
             <svg className="w-12 h-12 text-[#0066CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
             </svg>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">Success!</h2>
          <p className="text-gray-500 mb-10 text-lg">
            Your {skillName} expertise has been logged.<br/>We will review your 10 answers shortly.
          </p>
          <button 
            onClick={onBack} 
            className="px-12 py-4 bg-[#0066CC] text-white rounded-xl font-black text-lg hover:bg-blue-700 hover:scale-105 transition-all shadow-lg"
          >
            RETURN TO SKILLS
          </button>
        </div>
      )}
    </div>
  );
}