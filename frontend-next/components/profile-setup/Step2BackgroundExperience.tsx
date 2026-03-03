'use client'

import { useState, useEffect } from 'react'
import SearchableDropdown from '@/components/SearchableDropdown'
import { apiFetch } from '@/lib/api'

interface Step2BackgroundExperienceProps {
  data: any
  onUpdate: (data: any) => void
  onSkip?: () => void
}

export default function Step2BackgroundExperience({ data, onUpdate, onSkip }: Step2BackgroundExperienceProps) {
  const [formData, setFormData] = useState({
    education: data.education || [],
  })

  // Sync formData when data prop changes (e.g., when profile data is loaded from API)
  useEffect(() => {
    setFormData({
      education: data.education || [],
    })
  }, [data.education])

  const [showEducationForm, setShowEducationForm] = useState(false)
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null)

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  const handleAddEducation = (education: any) => {
    const updated = [...formData.education, education]
    handleChange('education', updated)
    setShowEducationForm(false)
  }

  const handleEditEducation = (index: number, education: any) => {
    const updated = [...formData.education]
    updated[index] = education
    handleChange('education', updated)
    setEditingEducationIndex(null)
  }

  const handleDeleteEducation = (index: number) => {
    const updated = formData.education.filter((_: any, i: number) => i !== index)
    handleChange('education', updated)
  }

  return (
    <div>
      {/* Header with Skip Button */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#1C2D4F', fontWeight: 700 }}>
            Education
          </h2>
          <p className="text-sm" style={{ color: '#A9B4CD' }}>
            This step is optional - you can fill your profile Information at any time.
          </p>
        </div>
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            style={{
              border: '2px solid #0273B1',
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
            Skip &gt;
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* Education */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {formData.education.map((edu: any, index: number) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-bold mb-1" style={{ color: '#1C2D4F' }}>
                    {edu.university || 'University'} - {edu.degree || edu.fieldOfStudy || 'Degree'}
                  </h4>
                  <p className="text-sm" style={{ color: '#A9B4CD' }}>
                    {edu.startYear || 'Start'} {edu.endYear ? `- ${edu.endYear}` : '- Present'}
                    {edu.gpa && ` | GPA: ${edu.gpa}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingEducationIndex(index)}
                    className="px-3 py-1 rounded text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: 'white',
                      border: '2px solid #0273B1',
                      color: '#0273B1'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEducation(index)}
                    className="px-3 py-1 rounded text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: '#EF4444',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#DC2626'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#EF4444'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(showEducationForm || editingEducationIndex !== null) && (
          <EducationForm
              education={editingEducationIndex !== null ? formData.education[editingEducationIndex] : null}
            onSave={(edu: any) => {
              const educationData = {
                  university: edu.university || edu.institution,
                  degree: edu.degree || edu.fieldOfStudy || '',
                  fieldOfStudy: edu.fieldOfStudy || edu.degree || '',
                  startYear: edu.startYear || edu.startDate?.split('-')[0] || '',
                  endYear: edu.endYear || (edu.endDate ? edu.endDate.split('-')[0] : null),
                  gpa: edu.gpa || null,
              }
                if (editingEducationIndex !== null) {
                  handleEditEducation(editingEducationIndex, educationData)
              } else {
                handleAddEducation(educationData)
              }
            }}
              onCancel={() => {
                setShowEducationForm(false)
                setEditingEducationIndex(null)
              }}
            onSkip={() => {
                setShowEducationForm(false)
              }}
            />
          )}
          {formData.education.length === 0 && !showEducationForm && (
            <button
              onClick={() => setShowEducationForm(true)}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              style={{ backgroundColor: '#E3F5FF', color: '#0273B1' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0273B1'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E3F5FF'
                e.currentTarget.style.color = '#0273B1'
              }}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Education
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function EducationForm({ education, onSave, onCancel, onSkip }: any) {
  const [formData, setFormData] = useState({
    educationLevel: education?.educationLevel || '',
    institution: education?.university || '',
    degree: education?.degree || '',
    fieldOfStudy: education?.fieldOfStudy || '',
    yearOfStudy: education?.yearOfStudy || education?.startYear || '',
    gpa: education?.gpa || '',
    isCurrent: !education?.endYear && !education?.endDate,
    isGraduated: !!education?.endYear || !!education?.endDate,
  })
  const [universities, setUniversities] = useState<Array<{ id: string; name: string; thname: string | null; code: string | null }>>([])
  const [universitiesLoading, setUniversitiesLoading] = useState(false)

  const educationLevels = ['Bachelor', 'Master', 'PhD']
  const yearOfStudyOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate']

  // Load universities from API
  useEffect(() => {
    ;(async () => {
      setUniversitiesLoading(true)
      try {
        const data = await apiFetch<{ universities: Array<{ id: string; name: string; thname: string | null; code: string | null }> }>(
          `/api/universities`
        )
        setUniversities(data.universities || [])
      } catch (err) {
        console.error('Failed to load universities:', err)
        setUniversities([])
      } finally {
        setUniversitiesLoading(false)
      }
    })()
  }, [])

  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    if (field === 'isCurrent' && value) {
      updated.isGraduated = false
    }
    if (field === 'isGraduated' && value) {
      updated.isCurrent = false
    }
    setFormData(updated)
  }

  return (
    <div className="space-y-6">
      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Education Level */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Education Level
          </label>
          <div className="relative">
            <select
              value={formData.educationLevel}
              onChange={(e) => handleFieldChange('educationLevel', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Select education level</option>
              {educationLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Institution Name */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Institution Name
          </label>
          {universitiesLoading ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white flex items-center justify-center">
              <span className="text-gray-500 text-sm">Loading...</span>
            </div>
          ) : (
            <SearchableDropdown
              options={universities.map((uni) => ({
                value: uni.name,
                label: uni.thname ? `${uni.name} (${uni.thname})` : uni.name,
                code: uni.code,
              }))}
              value={formData.institution}
              onChange={(value) => handleFieldChange('institution', value)}
              placeholder="Select Institution"
              className="w-full"
              allOptionLabel="Select Institution"
            />
          )}
        </div>

        {/* Degree */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Degree
          </label>
          <input
            type="text"
            value={formData.degree}
            onChange={(e) => handleFieldChange('degree', e.target.value)}
            placeholder="e.g., Bachelor of Engineering"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Field of Study */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Field of Study
          </label>
          <input
            type="text"
            value={formData.fieldOfStudy}
            onChange={(e) => handleFieldChange('fieldOfStudy', e.target.value)}
            placeholder="e.g., Computer Engineering"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Year of Study */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Year of Study
          </label>
          <div className="relative">
            <select
              value={formData.yearOfStudy}
              onChange={(e) => handleFieldChange('yearOfStudy', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Select year of study</option>
              {yearOfStudyOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* GPA (Current) */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            GPA (Current)
          </label>
          <input
            type="text"
            value={formData.gpa}
            onChange={(e) => handleFieldChange('gpa', e.target.value)}
            placeholder="e.g., 3.50"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isCurrent}
            onChange={(e) => handleFieldChange('isCurrent', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
            style={{ accentColor: '#0273B1' }}
          />
          <span className="ml-2 text-sm" style={{ color: '#1C2D4F' }}>Currently studying here</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isGraduated}
            onChange={(e) => handleFieldChange('isGraduated', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
            style={{ accentColor: '#0273B1' }}
          />
          <span className="ml-2 text-sm" style={{ color: '#1C2D4F' }}>Graduated</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
          style={{
            backgroundColor: 'white',
            border: '2px solid #0273B1',
            color: '#0273B1'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F0F4F8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (onSave) {
              onSave({
                educationLevel: formData.educationLevel,
                university: formData.institution,
                degree: formData.degree,
                fieldOfStudy: formData.fieldOfStudy,
                yearOfStudy: formData.yearOfStudy,
                startYear: formData.yearOfStudy,
                endYear: formData.isGraduated ? new Date().getFullYear().toString() : null,
                gpa: formData.gpa || null,
                isCurrent: formData.isCurrent,
              })
            }
          }}
          className="px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
          style={{ backgroundColor: '#0273B1' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#025a8f'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0273B1'
          }}
        >
          Save
        </button>
        <button
          onClick={() => {
            if (onSkip) onSkip()
          }}
          className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
          style={{
            backgroundColor: 'white',
            border: '2px solid #0273B1',
            color: '#0273B1'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F0F4F8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
          }}
        >
          Skip
        </button>
        <p className="text-xs text-center" style={{ color: '#A9B4CD' }}>
          *You can build your profile later
        </p>
      </div>
    </div>
  )
}

// ProjectForm has been moved to ProjectsSection component
