'use client'

import { useState, useEffect } from 'react'

interface Step3PostSettingsProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step3PostSettings({ data, onUpdate }: Step3PostSettingsProps) {
  const [localData, setLocalData] = useState(data || {
    screeningQuestions: [],
    rejectionMessage: '',
  })

  useEffect(() => {
    onUpdate(localData)
  }, [localData, onUpdate])

  const handleChange = (field: string, value: any) => {
    setLocalData((prev: any) => ({ ...prev, [field]: value }))
  }

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      question: '',
      questionType: 'text' as 'text' | 'multiple-choice',
      choices: [] as string[],
      idealAnswer: '',
      automaticRejection: false,
    }
    setLocalData((prev: any) => ({
      ...prev,
      screeningQuestions: [...(prev.screeningQuestions || []), newQuestion],
    }))
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setLocalData((prev: any) => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.map((q: any) =>
        q.id === id ? { ...q, [field]: value } : q
      ),
    }))
  }

  const removeQuestion = (id: string) => {
    setLocalData((prev: any) => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.filter((q: any) => q.id !== id),
    }))
  }

  const addChoice = (questionId: string) => {
    setLocalData((prev: any) => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.map((q: any) =>
        q.id === questionId
          ? { ...q, choices: [...(q.choices || []), ''] }
          : q
      ),
    }))
  }

  const updateChoice = (questionId: string, choiceIndex: number, value: string) => {
    setLocalData((prev: any) => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.map((q: any) =>
        q.id === questionId
          ? {
              ...q,
              choices: q.choices.map((c: string, i: number) => (i === choiceIndex ? value : c)),
            }
          : q
      ),
    }))
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6" style={{ color: '#1C2D4F' }}>
        Post Settings
      </h2>

      {/* Screening Questions */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#1C2D4F' }}>
              Screening Questions
            </h3>
            <p className="text-sm text-gray-600">
              Applicants will be required to answer these screening questions as part of their application, helping you identify ideal candidates.
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 border-2 rounded-lg font-medium text-sm"
            style={{ borderColor: '#0273B1', color: '#0273B1' }}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        </div>

        {(localData.screeningQuestions || []).map((question: any, index: number) => (
          <div key={question.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={question.question || ''}
                  onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  placeholder="Enter your question"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={question.questionType || 'text'}
                  onChange={(e) => updateQuestion(question.id, 'questionType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="multiple-choice">Multiple Choice</option>
                </select>

                {question.questionType === 'multiple-choice' && (
                  <div className="mb-3">
                    {(question.choices || []).map((choice: string, choiceIndex: number) => (
                      <div key={choiceIndex} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={choice}
                          onChange={(e) => updateChoice(question.id, choiceIndex, e.target.value)}
                          placeholder={`Tool ${choiceIndex + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addChoice(question.id)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add choice
                    </button>
                  </div>
                )}

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ideal Answer
                  </label>
                  <input
                    type="text"
                    value={question.idealAnswer || ''}
                    onChange={(e) => updateQuestion(question.id, 'idealAnswer', e.target.value)}
                    placeholder="Enter ideal answer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={question.automaticRejection || false}
                      onChange={(e) => updateQuestion(question.id, 'automaticRejection', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Automatic Rejection
                      <svg className="w-4 h-4 inline ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-3 rounded-lg font-medium text-sm text-white transition-colors"
          style={{ backgroundColor: '#0273B1' }}
        >
          + Add Questions
        </button>
      </div>

      {/* Rejection Settings */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#1C2D4F' }}>
          Rejection Settings
        </h3>
        <h4 className="text-base font-medium mb-2" style={{ color: '#1C2D4F' }}>
          Automatic Rejection
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          Toggle this function to automatically reject candidates and send rejection message if they do not provide the ideal answer.
        </p>
        <div className="relative">
          <textarea
            value={localData.rejectionMessage || ''}
            onChange={(e) => handleChange('rejectionMessage', e.target.value)}
            placeholder="Write your rejection message"
            maxLength={3000}
            className="w-full px-4 py-3 min-h-[150px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {(localData.rejectionMessage || '').length}/3,000
          </div>
        </div>
      </div>
    </div>
  )
}
