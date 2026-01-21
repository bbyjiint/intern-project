'use client'

import { useState } from 'react'

interface Step2BackgroundExperienceProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step2BackgroundExperience({ data, onUpdate }: Step2BackgroundExperienceProps) {
  const [formData, setFormData] = useState({
    professionalSummary: data.professionalSummary || '',
    education: data.education || [],
    experience: data.experience || [],
  })

  const [showEducationForm, setShowEducationForm] = useState(false)
  const [showExperienceForm, setShowExperienceForm] = useState(false)
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null)
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null)

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

  const handleAddExperience = (experience: any) => {
    const updated = [...formData.experience, experience]
    handleChange('experience', updated)
    setShowExperienceForm(false)
  }

  const handleEditExperience = (index: number, experience: any) => {
    const updated = [...formData.experience]
    updated[index] = experience
    handleChange('experience', updated)
    setEditingExperienceIndex(null)
  }

  const handleDeleteExperience = (index: number) => {
    const updated = formData.experience.filter((_: any, i: number) => i !== index)
    handleChange('experience', updated)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#1C2D4F' }}>
        Background & Experience
      </h2>

      <div className="space-y-8">
        {/* Professional Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold" style={{ color: '#1C2D4F' }}>
              Professional Summary
            </h3>
            <button
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
              style={{
                backgroundColor: 'white',
                border: '2px solid #0273B1',
                color: '#0273B1'
              }}
            >
              Edit
            </button>
          </div>
          <textarea
            value={formData.professionalSummary}
            onChange={(e) => handleChange('professionalSummary', e.target.value)}
            placeholder="Describe your background, interests, and career goals"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Education */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: '#1C2D4F' }}>
              Education
            </h3>
            <button
              onClick={() => setShowEducationForm(true)}
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

          {formData.education.length === 0 && !showEducationForm && (
            <p className="text-sm" style={{ color: '#A9B4CD' }}>
              No education entries yet. Click "Add Education" to get started.
            </p>
          )}

          {formData.education.map((edu: any, index: number) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-bold mb-1" style={{ color: '#1C2D4F' }}>
                    {edu.university || 'University Name'}
                  </h4>
                  <p className="text-sm mb-2" style={{ color: '#A9B4CD' }}>
                    {edu.degree || 'Degree'} | {edu.fieldOfStudy || 'Field of Study'} | {edu.startYear || 'Start'} - {edu.endYear || 'End'}
                  </p>
                </div>
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
              </div>
            </div>
          ))}

          {(showEducationForm || editingEducationIndex !== null) && (
            <EducationForm
              education={editingEducationIndex !== null ? formData.education[editingEducationIndex] : null}
              onSave={(edu) => {
                if (editingEducationIndex !== null) {
                  handleEditEducation(editingEducationIndex, edu)
                } else {
                  handleAddEducation(edu)
                }
              }}
              onCancel={() => {
                setShowEducationForm(false)
                setEditingEducationIndex(null)
              }}
            />
          )}
        </div>

        {/* Experience */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: '#1C2D4F' }}>
              Experience
            </h3>
            <button
              onClick={() => setShowExperienceForm(true)}
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

          {formData.experience.length === 0 && !showExperienceForm && (
            <p className="text-sm" style={{ color: '#A9B4CD' }}>
              No experience entries yet. Click "Add Experience" to get started.
            </p>
          )}

          {formData.experience.map((exp: any, index: number) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-bold mb-1" style={{ color: '#1C2D4F' }}>
                    {exp.title || 'Job Title'} ({exp.type || 'Type'})
                  </h4>
                  <p className="text-sm mb-2" style={{ color: '#A9B4CD' }}>
                    {exp.company || 'Company'} | {exp.startDate || 'Start'} - {exp.endDate || 'End'} | Manager: {exp.manager || 'N/A'}
                  </p>
                  {exp.description && (
                    <p className="text-sm mt-2" style={{ color: '#1C2D4F' }}>
                      {exp.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditingExperienceIndex(index)}
                  className="px-3 py-1 rounded text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #0273B1',
                    color: '#0273B1'
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

          {(showExperienceForm || editingExperienceIndex !== null) && (
            <ExperienceForm
              experience={editingExperienceIndex !== null ? formData.experience[editingExperienceIndex] : null}
              onSave={(exp) => {
                if (editingExperienceIndex !== null) {
                  handleEditExperience(editingExperienceIndex, exp)
                } else {
                  handleAddExperience(exp)
                }
              }}
              onCancel={() => {
                setShowExperienceForm(false)
                setEditingExperienceIndex(null)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function EducationForm({ education, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    university: education?.university || '',
    degree: education?.degree || '',
    fieldOfStudy: education?.fieldOfStudy || '',
    startYear: education?.startYear || '',
    endYear: education?.endYear || '',
  })

  return (
    <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="University / School"
          value={formData.university}
          onChange={(e) => setFormData({ ...formData, university: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
        <input
          type="text"
          placeholder="Degree"
          value={formData.degree}
          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
        <input
          type="text"
          placeholder="Field of Study"
          value={formData.fieldOfStudy}
          onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Start Year"
            value={formData.startYear}
            onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          />
          <input
            type="text"
            placeholder="End Year"
            value={formData.endYear}
            onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 rounded-lg font-semibold text-sm text-white"
            style={{ backgroundColor: '#0273B1' }}
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-semibold text-sm"
            style={{
              backgroundColor: 'white',
              border: '2px solid #0273B1',
              color: '#0273B1'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function ExperienceForm({ experience, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: experience?.title || '',
    type: experience?.type || '',
    company: experience?.company || '',
    startDate: experience?.startDate || '',
    endDate: experience?.endDate || '',
    manager: experience?.manager || '',
    description: experience?.description || '',
  })

  return (
    <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Job / Internship Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
        <input
          type="text"
          placeholder="Type (e.g., Intern, Full-time)"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
        <input
          type="text"
          placeholder="Company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Start Date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          />
          <input
            type="text"
            placeholder="End Date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          />
        </div>
        <input
          type="text"
          placeholder="Manager Name"
          value={formData.manager}
          onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
        <textarea
          placeholder="Description (what you did / learned)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 rounded-lg font-semibold text-sm text-white"
            style={{ backgroundColor: '#0273B1' }}
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-semibold text-sm"
            style={{
              backgroundColor: 'white',
              border: '2px solid #0273B1',
              color: '#0273B1'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
