'use client'

import { useState } from 'react'
import { Education } from '@/hooks/useProfile'
import EducationModal from './EducationModal'

interface EducationSectionProps {
  education: Education[]
  onAdd: () => void
  onEdit: (id: string) => void
  onRefresh?: () => void
}

export default function EducationSection({ education, onAdd, onEdit, onRefresh }: EducationSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEducation, setEditingEducation] = useState<Education | null>(null)
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const formatEducationLevel = (level?: string) => {
    const levels: Record<string, string> = {
      BACHELOR: 'Bachelor',
      MASTERS: 'Master',
      PHD: 'PhD',
    }
    return levels[level || ''] || level || ''
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Education
        </h2>
        <button
          onClick={() => {
            setEditingEducation(null)
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
          + Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <p className="text-gray-400 italic py-4">No education provided.</p>
      ) : (
        <div className="space-y-6">
          {education.map((edu) => (
            <div key={edu.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#1C2D4F' }}>
                    {edu.universityName || 'University name not provided'}
                  </h3>
                  <div className="text-gray-700 space-y-1">
                    {edu.degreeName && (
                      <p>
                        {formatEducationLevel(edu.educationLevel)} {edu.degreeName}
                        {edu.gpa && ` | GPA: ${edu.gpa}/4.0`}
                      </p>
                    )}
                    {(edu.startDate || edu.endDate) && (
                      <p>
                        {formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}
                      </p>
                    )}
                    {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Relevant coursework:</span> {edu.relevantCoursework.join(', ')}
                      </p>
                    )}
                    {edu.achievements && edu.achievements.length > 0 && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Academic achievements:</span> {edu.achievements.join(', ')}
                      </p>
                    )}
                    {edu.extracurriculars && edu.extracurriculars.length > 0 && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Extracurriculars:</span> {edu.extracurriculars.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingEducation(edu)
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
        </div>
      )}

      {/* Education Modal */}
      <EducationModal
        isOpen={isModalOpen}
        education={editingEducation}
        onClose={() => {
          setIsModalOpen(false)
          setEditingEducation(null)
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
