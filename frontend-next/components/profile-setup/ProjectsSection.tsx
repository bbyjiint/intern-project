'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

interface ProjectsSectionProps {
  data: any
  onUpdate: (data: any) => void
  onSkip?: () => void
}

export default function ProjectsSection({ data, onUpdate, onSkip }: ProjectsSectionProps) {
  const [formData, setFormData] = useState({
    projects: data.projects || [],
  })

  // Sync formData when data prop changes
  useEffect(() => {
    setFormData({
      projects: data.projects || [],
    })
  }, [data.projects])

  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null)

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
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
      {/* Header with Skip Button */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#1C2D4F', fontWeight: 700 }}>
            Projects
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

function ProjectForm({ project, onSave, onCancel, onDelete }: any) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    role: project?.role || '',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    description: project?.description || '',
    relatedSkills: project?.relatedSkills || [],
  })
  const [isSaving, setIsSaving] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState('')

  const handleAddSkill = () => {
    if (selectedSkill && !formData.relatedSkills.includes(selectedSkill)) {
      setFormData({ ...formData, relatedSkills: [...formData.relatedSkills, selectedSkill] })
      setSelectedSkill('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData({ ...formData, relatedSkills: formData.relatedSkills.filter((s: string) => s !== skill) })
  }

  return (
    <div className="mt-4 p-6 border border-gray-200 rounded-lg bg-white">
      <h4 className="text-lg font-bold mb-4" style={{ color: '#1C2D4F' }}>
        Add Project
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Role
          </label>
          <input
            type="text"
            placeholder="e.g., Web developer"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Start Date
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="MM/YYYY"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              End Date
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="MM/YYYY"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Related Skills
          </label>
          <div className="relative">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10"
            >
              <option value="">Select skill</option>
              <option value="JavaScript">JavaScript</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="Python">Python</option>
              <option value="TypeScript">TypeScript</option>
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {formData.relatedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.relatedSkills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ backgroundColor: '#E3F5FF', color: '#0273B1' }}
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <button
            onClick={handleAddSkill}
            className="mt-2 px-3 py-1 rounded text-sm font-medium"
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
            Skill +
          </button>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            style={{
              backgroundColor: '#F3F4F6',
              color: '#1C2D4F'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E5E7EB'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6'
            }}
          >
            Cancel
          </button>
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
            {isSaving ? 'Saving...' : 'Add Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
