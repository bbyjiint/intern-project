'use client'

import { ResumeFile } from '@/hooks/useProfile'

interface ResumeSectionProps {
  resume: ResumeFile | undefined
  onEdit: () => void
}

export default function ResumeSection({ resume, onEdit }: ResumeSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Resume
        </h2>
        <button
          onClick={onEdit}
          className="px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-colors"
          style={{ 
            borderColor: '#0273B1',
            color: '#0273B1',
            backgroundColor: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F0F4F8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
          }}
        >
          Edit
        </button>
      </div>

      {!resume || !resume.url ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 italic">No resume uploaded.</p>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{resume.name || 'Resume.pdf'}</p>
            <a
              href={resume.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm"
              style={{ color: '#0273B1' }}
            >
              View / Download
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
