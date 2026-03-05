'use client'

import { useState, useEffect } from 'react'
import { Experience } from '@/hooks/useProfile'
import { apiFetch } from '@/lib/api'

interface ExperienceModalProps {
  isOpen: boolean
  experience: Experience | null
  onClose: () => void
  onSave: () => void
}

export default function ExperienceModal({ isOpen, experience, onClose, onSave }: ExperienceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    isCurrent: true,
    hideEndDate: true,
    location: '',
    description: '',
    technicalSkills: [] as string[],
  })

  const [skillInput, setSkillInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Initialize form data when experience changes
  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.position || '',
        company: experience.companyName || '',
        startDate: experience.startDate || '',
        endDate: experience.endDate || '',
        isCurrent: experience.isCurrent || false,
        hideEndDate: experience.isCurrent || false,
        location: '',
        description: experience.description || '',
        technicalSkills: [],
      })
    } else {
      setFormData({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        isCurrent: true,
        hideEndDate: true,
        location: '',
        description: '',
        technicalSkills: [],
      })
    }
    setSkillInput('')
  }, [experience, isOpen])

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.technicalSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        technicalSkills: [...formData.technicalSkills, skillInput.trim()],
      })
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      technicalSkills: formData.technicalSkills.filter(s => s !== skill),
    })
  }

  const handleSave = async () => {
    if (!formData.title || !formData.company) {
      alert('Please fill in all required fields (Title, Company)')
      return
    }

    setIsSaving(true)
    try {
      const experienceData = {
        position: formData.title,
        companyName: formData.company,
        startDate: formData.startDate || null,
        endDate: formData.hideEndDate ? null : (formData.endDate || null),
        isCurrent: formData.isCurrent,
        description: formData.description,
        location: formData.location || null,
        technicalSkills: formData.technicalSkills,
      }

      if (experience?.id) {
        // Update existing experience
        await apiFetch(`/api/candidates/experience/${experience.id}`, {
          method: 'PUT',
          body: JSON.stringify(experienceData),
        })
      } else {
        // Create new experience
        await apiFetch('/api/candidates/experience', {
          method: 'POST',
          body: JSON.stringify(experienceData),
        })
      }

      onSave()
      onClose()
    } catch (error: any) {
      console.error('Failed to save experience:', error)
      alert(error.message || 'Failed to save experience')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {experience ? 'Edit Experience' : 'Add Experience'}
          </h2>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Software Engineer Intern"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Company, Start Date, End Date Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Enter company name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={formData.hideEndDate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isCurrent}
                onChange={(e) => {
                  const isCurrent = e.target.checked
                  setFormData({
                    ...formData,
                    isCurrent,
                    hideEndDate: isCurrent,
                    endDate: isCurrent ? '' : formData.endDate,
                  })
                }}
                className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Currently Working Here</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.hideEndDate}
                onChange={(e) => {
                  const hideEndDate = e.target.checked
                  setFormData({
                    ...formData,
                    hideEndDate,
                    endDate: hideEndDate ? '' : formData.endDate,
                  })
                }}
                className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Hide end date</span>
            </label>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., San Francisco, CA"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Technical Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technical Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
                placeholder="Add Skill"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddSkill}
                className="px-4 py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center"
                style={{ backgroundColor: '#0273B1', minWidth: '48px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0273B1'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {formData.technicalSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.technicalSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-semibold text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: '#0273B1' }}
            onMouseEnter={(e) => {
              if (!isSaving) e.currentTarget.style.backgroundColor = '#025a8f'
            }}
            onMouseLeave={(e) => {
              if (!isSaving) e.currentTarget.style.backgroundColor = '#0273B1'
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
