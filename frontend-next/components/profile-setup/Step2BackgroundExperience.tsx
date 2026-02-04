'use client'

import { useState, useEffect } from 'react'
import SearchableDropdown from '@/components/SearchableDropdown'
import { apiFetch } from '@/lib/api'

interface Step2BackgroundExperienceProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step2BackgroundExperience({ data, onUpdate }: Step2BackgroundExperienceProps) {
  const [formData, setFormData] = useState({
    education: data.education || [],
    projects: data.projects || [],
  })

  const [showEducationForm, setShowEducationForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null)
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null)

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

  const handleAddProject = (project: any) => {
    const updated = [...formData.projects, project]
    handleChange('projects', updated)
    setShowProjectForm(false)
  }

  const handleEditProject = (index: number, project: any) => {
    const updated = [...formData.projects]
    updated[index] = project
    handleChange('projects', updated)
    setEditingProjectIndex(null)
  }

  const handleDeleteProject = (index: number) => {
    const updated = formData.projects.filter((_: any, i: number) => i !== index)
    handleChange('projects', updated)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#0273B1', fontWeight: 700 }}>
        Education & Projects
      </h2>

      <div className="space-y-8">
        {/* Education */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-6" style={{ color: '#0273B1' }}>
            Education
          </h3>
          <EducationForm
            education={formData.education.length > 0 ? formData.education[0] : null}
            onSave={(edu: any) => {
              const educationData = {
                university: edu.institution,
                fieldOfStudy: edu.fieldOfStudy,
                startYear: edu.year,
                degree: '',
                endYear: ''
              }
              if (formData.education.length > 0) {
                handleEditEducation(0, educationData)
              } else {
                handleAddEducation(educationData)
              }
            }}
            onCancel={() => {}}
            onSkip={() => {
              // Skip functionality - can proceed without education
            }}
          />
        </div>

        {/* Projects */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: '#0273B1' }}>
              Projects
            </h3>
            <button
              onClick={() => setShowProjectForm(true)}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
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
              Add Project
            </button>
          </div>

          {/* Existing Projects */}
          {formData.projects.map((project: any, index: number) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-bold mb-1" style={{ color: '#1C2D4F' }}>
                    {project.name || 'Project Name'} - {project.role || 'Role'}
                  </h4>
                  {project.description && (
                    <p className="text-sm mt-2" style={{ color: '#1C2D4F' }}>
                      {project.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditingProjectIndex(index)}
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

          {/* Project Form */}
          {(showProjectForm || editingProjectIndex !== null) && (
            <ProjectForm
              project={editingProjectIndex !== null ? formData.projects[editingProjectIndex] : null}
              onSave={(project: any) => {
                if (editingProjectIndex !== null) {
                  handleEditProject(editingProjectIndex, project)
                } else {
                  handleAddProject(project)
                }
              }}
              onCancel={() => {
                setShowProjectForm(false)
                setEditingProjectIndex(null)
              }}
              onDelete={editingProjectIndex !== null ? () => {
                handleDeleteProject(editingProjectIndex)
                setEditingProjectIndex(null)
              } : undefined}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function EducationForm({ education, onSave, onCancel, onSkip }: any) {
  const [formData, setFormData] = useState({
    institution: education?.university || '',
    fieldOfStudy: education?.fieldOfStudy || '',
    year: education?.startYear || '',
  })
  const [universities, setUniversities] = useState<Array<{ id: string; name: string; thname: string | null; code: string | null }>>([])
  const [universitiesLoading, setUniversitiesLoading] = useState(false)

  const yearOptions = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Graduate']

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

  // Auto-save when form data changes
  const handleFieldChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    // Auto-save if there's any data
    if (updated.institution || updated.fieldOfStudy || updated.year) {
      if (onSave) {
        onSave(updated)
      }
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Side - Form Fields */}
      <div className="flex-1 space-y-6">
        {/* Institution */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Institution
          </label>
          {universitiesLoading ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Loading universities...</span>
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
              placeholder="Search by name or code..."
              className="w-full"
              allOptionLabel="Select University"
            />
          )}
        </div>

        {/* Field of Study */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Field of Study
          </label>
          <div className="relative">
            <select
              value={formData.fieldOfStudy}
              onChange={(e) => handleFieldChange('fieldOfStudy', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Field of Study</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Arts">Arts</option>
              <option value="Science">Science</option>
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Year */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Year
          </label>
          <div className="relative">
            <select
              value={formData.year}
              onChange={(e) => handleFieldChange('year', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right Side - Save and Skip Buttons */}
      <div className="flex flex-col items-center justify-center gap-3">
        <button
          onClick={() => {
            if (onSave) onSave(formData)
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

function ProjectForm({ project, onSave, onCancel, onDelete }: any) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    role: project?.role || '',
    description: project?.description || '',
  })

  return (
    <div className="mt-4 p-6 border border-gray-200 rounded-lg bg-white">
      <h4 className="text-lg font-bold mb-4" style={{ color: '#1C2D4F' }}>
        New Project
      </h4>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Project Name
          </label>
          <input
            type="text"
            placeholder="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Role
          </label>
          <input
            type="text"
            placeholder="Example: Designing UI"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Description
          </label>
          <textarea
            placeholder="Description about your project"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="flex justify-between items-center pt-4">
          {onDelete && (
            <button
              onClick={() => {
                onDelete()
                onCancel()
              }}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
              style={{ backgroundColor: '#EF4444' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#DC2626'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#EF4444'
              }}
            >
              Delete
            </button>
          )}
          <div className={`flex gap-2 ${onDelete ? 'ml-auto' : ''}`}>
            <button
              onClick={() => onSave(formData)}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
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
          </div>
        </div>
      </div>
    </div>
  )
}
