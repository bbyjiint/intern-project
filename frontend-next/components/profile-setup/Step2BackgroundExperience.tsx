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

  // Sync formData when data prop changes (e.g., when profile data is loaded from API)
  useEffect(() => {
    setFormData({
      education: data.education || [],
      projects: data.projects || [],
    })
  }, [data.education, data.projects])

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

  const handleAddProject = async (project: any) => {
    try {
      const response = await apiFetch<{ project: any }>('/api/candidates/projects', {
        method: 'POST',
        body: JSON.stringify(project),
      })
      
      // Reload projects from API
      const profileData = await apiFetch<{ profile: any }>('/api/candidates/profile')
      const updated = profileData.profile?.projects || []
      handleChange('projects', updated)
      setShowProjectForm(false)
    } catch (error: any) {
      console.error('Failed to save project:', error)
      alert(error.message || 'Failed to save project')
    }
  }

  const handleEditProject = async (index: number, project: any) => {
    const projectId = formData.projects[index]?.id
    if (!projectId) {
      console.error('Project ID not found')
      return
    }

    try {
      await apiFetch(`/api/candidates/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(project),
      })
      
      // Reload projects from API
      const profileData = await apiFetch<{ profile: any }>('/api/candidates/profile')
      const updated = profileData.profile?.projects || []
      handleChange('projects', updated)
      setEditingProjectIndex(null)
    } catch (error: any) {
      console.error('Failed to update project:', error)
      alert(error.message || 'Failed to update project')
    }
  }

  const handleDeleteProject = async (index: number) => {
    const projectId = formData.projects[index]?.id
    if (!projectId) {
      console.error('Project ID not found')
      return
    }

    try {
      await apiFetch(`/api/candidates/projects/${projectId}`, {
        method: 'DELETE',
      })
      
      // Reload projects from API
      const profileData = await apiFetch<{ profile: any }>('/api/candidates/profile')
      const updated = profileData.profile?.projects || []
      handleChange('projects', updated)
    } catch (error: any) {
      console.error('Failed to delete project:', error)
      alert(error.message || 'Failed to delete project')
    }
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
                <div className="flex gap-2">
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
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this project?')) {
                        await handleDeleteProject(index)
                      }
                    }}
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

          {/* Project Form */}
          {(showProjectForm || editingProjectIndex !== null) && (
            <ProjectForm
              project={editingProjectIndex !== null ? formData.projects[editingProjectIndex] : null}
              onSave={async (project: any) => {
                if (editingProjectIndex !== null) {
                  await handleEditProject(editingProjectIndex, project)
                } else {
                  await handleAddProject(project)
                }
              }}
              onCancel={() => {
                setShowProjectForm(false)
                setEditingProjectIndex(null)
              }}
              onDelete={editingProjectIndex !== null ? async () => {
                await handleDeleteProject(editingProjectIndex)
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
    degree: education?.degree || education?.fieldOfStudy || '',
    fieldOfStudy: education?.fieldOfStudy || education?.degree || '',
    startYear: education?.startYear || (education?.startDate ? education.startDate.split('-')[0] : ''),
    endYear: education?.endYear || (education?.endDate ? education.endDate.split('-')[0] : '') || '',
    gpa: education?.gpa || '',
    isCurrent: !education?.endYear && !education?.endDate,
  })
  const [universities, setUniversities] = useState<Array<{ id: string; name: string; thname: string | null; code: string | null }>>([])
  const [universitiesLoading, setUniversitiesLoading] = useState(false)

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 50 }, (_, i) => currentYear - i).map(y => y.toString())

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
    if (field === 'isCurrent') {
      updated.endYear = value ? '' : updated.endYear
    }
    setFormData(updated)
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

        {/* Degree / Field of Study */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Degree / Field of Study
          </label>
          <input
            type="text"
            value={formData.degree}
            onChange={(e) => handleFieldChange('degree', e.target.value)}
            placeholder="e.g. Computer Science, Business Administration"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Start Year and End Year */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Start Year
            </label>
            <div className="relative">
              <select
                value={formData.startYear}
                onChange={(e) => handleFieldChange('startYear', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Start Year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              End Year
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  value={formData.endYear}
                  onChange={(e) => handleFieldChange('endYear', e.target.value)}
                  disabled={formData.isCurrent}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">End Year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <label className="flex items-center mb-0 pb-3">
                <input
                  type="checkbox"
                  checked={formData.isCurrent}
                  onChange={(e) => handleFieldChange('isCurrent', e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm" style={{ color: '#1C2D4F' }}>Current</span>
              </label>
            </div>
          </div>
        </div>

        {/* GPA */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            GPA (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="4.0"
            value={formData.gpa}
            onChange={(e) => handleFieldChange('gpa', e.target.value)}
            placeholder="e.g. 3.5"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Right Side - Save and Skip Buttons */}
      <div className="flex flex-col items-center justify-center gap-3">
        <button
          onClick={() => {
            if (onSave) {
              onSave({
                university: formData.institution,
                degree: formData.degree,
                fieldOfStudy: formData.degree,
                startYear: formData.startYear,
                endYear: formData.isCurrent ? null : formData.endYear,
                gpa: formData.gpa || null,
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

function ProjectForm({ project, onSave, onCancel, onDelete }: any) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    role: project?.role || '',
    description: project?.description || '',
  })
  const [isSaving, setIsSaving] = useState(false)

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
              onClick={async () => {
                if (!formData.name || !formData.role) {
                  alert('Please fill in Project Name and Role')
                  return
                }
                setIsSaving(true)
                try {
                  await onSave(formData)
                } finally {
                  setIsSaving(false)
                }
              }}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#0273B1' }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#025a8f'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#0273B1'
                }
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
