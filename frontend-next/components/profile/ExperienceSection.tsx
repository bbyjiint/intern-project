'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Experience } from '@/hooks/useProfile'
import ExperienceModal from './ExperienceModal'

interface ExperienceSectionProps {
  experience: Experience[]
  onAdd: () => void
  onEdit: (id: string) => void
  onRefresh?: () => void
}

export default function ExperienceSection({ experience, onAdd, onEdit, onRefresh }: ExperienceSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  // Show maximum 3 experiences in profile page
  const displayedExperiences = experience.slice(0, 3)
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Experience
        </h2>
        <button
          onClick={() => {
            setEditingExperience(null)
            setIsModalOpen(true)
          }}
          className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
          style={{ backgroundColor: '#0273B1' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#025a8f'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0273B1'
          }}
        >
          + Add Experience
        </button>
      </div>

      {experience.length === 0 ? (
        <p className="text-gray-400 italic py-4">No experience provided.</p>
      ) : (
        <div className="space-y-6">
          {displayedExperiences.map((exp) => (
            <div key={exp.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#1C2D4F' }}>
                    {exp.position}
                    {exp.companyName && ` (${exp.companyName})`}
                  </h3>
                  <div className="text-gray-700 space-y-1 mb-2">
                    {exp.department && (
                      <p>{exp.department}</p>
                    )}
                    {(exp.startDate || exp.endDate) && (
                      <p>
                        {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                        {exp.manager && ` | Manager: ${exp.manager}`}
                      </p>
                    )}
                  </div>
                  {exp.description && (
                    <div className="mt-2">
                      {exp.description.split('\n').map((line, idx) => (
                        <p key={idx} className="text-gray-700 mb-1">{line}</p>
                      ))}
                    </div>
                  )}
                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  )}
                  {exp.linkedProjects !== undefined && exp.linkedProjects > 0 && (
                    <p className="text-sm mt-2" style={{ color: '#0273B1' }}>
                      → {exp.linkedProjects} Projects linked to this experience
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingExperience(exp)
                    setIsModalOpen(true)
                  }}
                  className="px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-colors ml-4"
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
            </div>
          ))}
          {experience.length > 3 && (
            <div className="pt-4 border-t border-gray-200">
              <Link
                href="/intern/experience"
                className="text-sm font-medium flex items-center space-x-1 justify-center"
                style={{ color: '#0273B1' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#0273B1'
                }}
              >
                <span>View All Experiences ({experience.length})</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Experience Modal */}
      <ExperienceModal
        isOpen={isModalOpen}
        experience={editingExperience}
        onClose={() => {
          setIsModalOpen(false)
          setEditingExperience(null)
        }}
        onSave={() => {
          if (onRefresh) {
            onRefresh()
          }
        }}
      />
    </div>
  )
}
