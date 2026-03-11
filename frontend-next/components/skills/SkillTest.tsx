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
];

export default function SkillTest({ skillName, onBack }: SkillTestProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleNext = () => {
    if (currentStep < MOCK_QUESTIONS.length - 1) setCurrentStep(currentStep + 1);
    else setIsFinished(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
      {!isFinished ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center relative">
            <button 
              onClick={onBack} 
              className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 flex items-center gap-2 transition-colors"
            >
               ← <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-3xl font-extrabold text-[#0066CC]">{skillName} Quiz</h1>
            <p className="text-sm text-gray-400">Question {currentStep + 1} of {MOCK_QUESTIONS.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h3 className="text-2xl font-bold mb-6">{MOCK_QUESTIONS[currentStep].question}</h3>
            <textarea 
              className="w-full min-h-[150px] p-4 border rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
              placeholder="Type your answer here..." 
            />
            <div className="flex justify-between mt-8">
              <button onClick={onBack} className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={handleNext} className="px-10 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md">
                {currentStep === MOCK_QUESTIONS.length - 1 ? "Finish" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-gray-500 mb-8">Your answers for {skillName} have been submitted for review.</p>
          <button onClick={onBack} className="px-10 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md">
            Return to Skills
          </button>
        </div>
      )}
    </div>
  );
}