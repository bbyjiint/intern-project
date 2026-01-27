'use client'

import { useState } from 'react'

interface Step3SkillsProjectsProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step3SkillsProjects({ data, onUpdate }: Step3SkillsProjectsProps) {
  const [formData, setFormData] = useState({
    skills: data.skills || [],
    projects: data.projects || [],
  })

  const [showSkillForm, setShowSkillForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null)
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null)

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  const handleAddSkill = (skill: any) => {
    const updated = [...formData.skills, skill]
    handleChange('skills', updated)
    setShowSkillForm(false)
  }

  const handleEditSkill = (index: number, skill: any) => {
    const updated = [...formData.skills]
    updated[index] = skill
    handleChange('skills', updated)
    setEditingSkillIndex(null)
  }

  const handleDeleteSkill = (index: number) => {
    const updated = formData.skills.filter((_: any, i: number) => i !== index)
    handleChange('skills', updated)
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

  const technicalSkills = formData.skills.filter((s: any) => s.category === 'technical')
  const businessSkills = formData.skills.filter((s: any) => s.category === 'business')

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#1C2D4F' }}>
        Skills & Projects
      </h2>

      <div className="space-y-8">
        {/* Skills */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: '#1C2D4F' }}>
              Skills
            </h3>
            <button
              onClick={() => setShowSkillForm(true)}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
              style={{ backgroundColor: '#0273B1' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#025a8f'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0273B1'
              }}
            >
              + Add Skill
            </button>
          </div>

          {/* Technical Skills */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3" style={{ color: '#1C2D4F' }}>
              Technical Skills
            </h4>
            {technicalSkills.length === 0 ? (
              <p className="text-sm" style={{ color: '#A9B4CD' }}>
                No technical skills added yet.
              </p>
            ) : (
              <div className="space-y-4">
                {technicalSkills.map((skill: any, index: number) => {
                  const originalIndex = formData.skills.findIndex((s: any) => s === skill)
                  return (
                    <SkillItem
                      key={originalIndex}
                      skill={skill}
                      onEdit={() => setEditingSkillIndex(originalIndex)}
                      onDelete={() => handleDeleteSkill(originalIndex)}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Business Skills */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: '#1C2D4F' }}>
              Business Skills
            </h4>
            {businessSkills.length === 0 ? (
              <p className="text-sm" style={{ color: '#A9B4CD' }}>
                No business skills added yet.
              </p>
            ) : (
              <div className="space-y-4">
                {businessSkills.map((skill: any, index: number) => {
                  const originalIndex = formData.skills.findIndex((s: any) => s === skill)
                  return (
                    <SkillItem
                      key={originalIndex}
                      skill={skill}
                      onEdit={() => setEditingSkillIndex(originalIndex)}
                      onDelete={() => handleDeleteSkill(originalIndex)}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {(showSkillForm || editingSkillIndex !== null) && (
            <SkillForm
              skill={editingSkillIndex !== null ? formData.skills[editingSkillIndex] : null}
              onSave={(skill) => {
                if (editingSkillIndex !== null) {
                  handleEditSkill(editingSkillIndex, skill)
                } else {
                  handleAddSkill(skill)
                }
              }}
              onCancel={() => {
                setShowSkillForm(false)
                setEditingSkillIndex(null)
              }}
            />
          )}
        </div>

        {/* Projects */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: '#1C2D4F' }}>
              Projects
            </h3>
            <button
              onClick={() => setShowProjectForm(true)}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
              style={{ backgroundColor: '#0273B1' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#025a8f'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0273B1'
              }}
            >
              + Add Project
            </button>
          </div>

          {formData.projects.length === 0 && !showProjectForm && (
            <p className="text-sm" style={{ color: '#A9B4CD' }}>
              No projects added yet. Click "Add Project" to get started.
            </p>
          )}

          {formData.projects.map((project: any, index: number) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-bold mb-1" style={{ color: '#1C2D4F' }}>
                    {project.name || 'Project Name'} - {project.role || 'Role'}
                  </h4>
                  {project.linkedTo && (
                    <p className="text-sm mb-2" style={{ color: '#A9B4CD' }}>
                      Linked to: {project.linkedTo} | {project.startDate || 'Start'} - {project.endDate || 'End'}
                    </p>
                  )}
                  {project.description && (
                    <p className="text-sm mt-2 mb-2" style={{ color: '#1C2D4F' }}>
                      {project.description}
                    </p>
                  )}
                  {project.tools && project.tools.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.tools.map((tool: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: '#E3F2FD',
                            color: '#0273B1'
                          }}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
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

          {(showProjectForm || editingProjectIndex !== null) && (
            <ProjectForm
              project={editingProjectIndex !== null ? formData.projects[editingProjectIndex] : null}
              onSave={(project) => {
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
            />
          )}
        </div>
      </div>
    </div>
  )
}

function SkillItem({ skill, onEdit, onDelete }: any) {
  const getLevelWidth = (level: string) => {
    switch (level) {
      case 'beginner':
        return '33%'
      case 'intermediate':
        return '66%'
      case 'advanced':
        return '100%'
      default:
        return '0%'
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Beginner (Learning basics, needs guidance)'
      case 'intermediate':
        return 'Intermediate (Can work independently)'
      case 'advanced':
        return 'Advanced (Can mentor others)'
      default:
        return ''
    }
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-semibold mb-1" style={{ color: '#1C2D4F' }}>
            {skill.name || 'Skill Name'}
          </div>
          {skill.linkedTo && (
            <div className="text-xs mb-2" style={{ color: '#A9B4CD' }}>
              Linked to: {skill.linkedTo}
            </div>
          )}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: getLevelWidth(skill.level),
                backgroundColor: '#0273B1'
              }}
            />
          </div>
          <div className="text-xs" style={{ color: '#A9B4CD' }}>
            {getLevelLabel(skill.level)}
          </div>
        </div>
        <button
          onClick={onEdit}
          className="px-3 py-1 rounded text-sm font-semibold transition-colors ml-4"
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
  )
}

function SkillForm({ skill, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: skill?.name || '',
    category: skill?.category || 'technical',
    level: skill?.level || 'beginner',
    linkedTo: skill?.linkedTo || '',
  })

  return (
    <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Skill Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="technical">Technical Skills</option>
          <option value="business">Business Skills</option>
        </select>
        <select
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <input
          type="text"
          placeholder="Linked to (optional)"
          value={formData.linkedTo}
          onChange={(e) => setFormData({ ...formData, linkedTo: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
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

function ProjectForm({ project, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    role: project?.role || '',
    description: project?.description || '',
    linkedTo: project?.linkedTo || '',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    tools: project?.tools || [],
  })

  const [toolInput, setToolInput] = useState('')

  const handleAddTool = () => {
    if (toolInput.trim()) {
      setFormData({
        ...formData,
        tools: [...formData.tools, toolInput.trim()]
      })
      setToolInput('')
    }
  }

  const handleRemoveTool = (index: number) => {
    setFormData({
      ...formData,
      tools: formData.tools.filter((_: string, i: number) => i !== index)
    })
  }

  return (
    <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Project Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
        <input
          type="text"
          placeholder="Role (e.g., Lead Developer)"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />
        <textarea
          placeholder="Short description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white resize-none"
        />
        <input
          type="text"
          placeholder="Linked to (optional)"
          value={formData.linkedTo}
          onChange={(e) => setFormData({ ...formData, linkedTo: e.target.value })}
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
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1C2D4F' }}>
            Tools / Technologies
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Add a tool"
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTool()
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
            />
            <button
              onClick={handleAddTool}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white"
              style={{ backgroundColor: '#0273B1' }}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tools.map((tool: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                style={{
                  backgroundColor: '#E3F2FD',
                  color: '#0273B1'
                }}
              >
                {tool}
                <button
                  onClick={() => handleRemoveTool(index)}
                  className="hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
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
