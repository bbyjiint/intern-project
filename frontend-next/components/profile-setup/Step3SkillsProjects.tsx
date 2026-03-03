'use client'

import { useState, useEffect } from 'react'
import SearchableDropdown from '@/components/SearchableDropdown'
import { apiFetch } from '@/lib/api'

interface Step3SkillsProjectsProps {
  data: any
  onUpdate: (data: any) => void
  onSkip?: () => void
}

export default function Step3SkillsProjects({ data, onUpdate, onSkip }: Step3SkillsProjectsProps) {
  const [formData, setFormData] = useState({
    skills: data.skills || [],
  })

  // Sync formData when data prop changes
  useEffect(() => {
    setFormData({
      skills: data.skills || [],
    })
  }, [data.skills])

  const [showSkillForm, setShowSkillForm] = useState(false)
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null)

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

  const technicalSkills = formData.skills.filter((s: any) => s.category === 'technical')
  const businessSkills = formData.skills.filter((s: any) => s.category === 'business')

  return (
    <div>
      {/* Header with Skip Button */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#1C2D4F', fontWeight: 700 }}>
            Skills
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
        {/* Skills Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {(showSkillForm || editingSkillIndex !== null) ? (
            <SkillForm
              skill={editingSkillIndex !== null ? formData.skills[editingSkillIndex] : null}
              education={formData.education}
              projects={formData.projects}
              onSave={(skill: any) => {
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
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: '#0273B1' }}>
                  Skills
                </h3>
                <button
                  onClick={() => setShowSkillForm(true)}
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
                      education={formData.education}
                      projects={formData.projects}
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
                      education={formData.education}
                      projects={formData.projects}
                      onEdit={() => setEditingSkillIndex(originalIndex)}
                      onDelete={() => handleDeleteSkill(originalIndex)}
                    />
                  )
                })}
              </div>
            )}
          </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

function SkillItem({ skill, education, projects, onEdit, onDelete }: any) {
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

  const getLinkedToText = () => {
    const usedIn = skill.usedIn || {}
    const educationIds = usedIn.educationIds || []
    const projectIds = usedIn.projectIds || []
    
    const items = []
    if (educationIds.length > 0 && education) {
      const eduNames = educationIds.map((index: number) => {
        const edu = education[index]
        return edu ? (edu.university || edu.institution || `Education ${index + 1}`) : null
      }).filter(Boolean)
      items.push(...eduNames)
    }
    if (projectIds.length > 0 && projects) {
      const projNames = projectIds.map((index: number) => {
        const project = projects[index]
        return project ? (project.name || `Project ${index + 1}`) : null
      }).filter(Boolean)
      items.push(...projNames)
    }
    
    return items.length > 0 ? items.join(', ') : null
  }

  const linkedToText = getLinkedToText()

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-semibold mb-1" style={{ color: '#1C2D4F' }}>
            {skill.name || 'Skill Name'}
          </div>
          {linkedToText && (
            <div className="text-xs mb-2" style={{ color: '#A9B4CD' }}>
              Linked to: {linkedToText}
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

function SkillForm({ skill, education, projects, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: skill?.name || '',
    category: skill?.category || 'technical',
    level: skill?.level || '',
    usedIn: skill?.usedIn || {
      educationIds: [],
      projectIds: []
    },
  })
  const [skills, setSkills] = useState<Array<{ id: string; name: string }>>([])
  const [skillsLoading, setSkillsLoading] = useState(false)

  // Load skills from API
  useEffect(() => {
    ;(async () => {
      setSkillsLoading(true)
      try {
        const data = await apiFetch<{ skills: Array<{ id: string; name: string }> }>(
          `/api/skills`
        )
        setSkills(data.skills || [])
      } catch (err) {
        console.error('Failed to load skills:', err)
        setSkills([])
      } finally {
        setSkillsLoading(false)
      }
    })()
  }, [])

  const handleToggleLinkedItem = (type: 'educationIds' | 'projectIds', index: number) => {
    const currentLinked = formData.usedIn[type] || []
    const updated = currentLinked.includes(index)
      ? currentLinked.filter((id: number) => id !== index)
      : [...currentLinked, index]
    
    setFormData({
      ...formData,
      usedIn: {
        ...formData.usedIn,
        [type]: updated
      }
    })
  }

  const getEducationLabel = (edu: any) => {
    // Check all possible fields for institution name
    if (edu.university) return edu.university
    if (edu.institution) return edu.institution
    if (edu.institutionName) return edu.institutionName
    return 'Education'
  }

  const getProjectLabel = (project: any) => {
    return project.name || 'Project'
  }

  return (
    <div>
      <h4 className="text-lg font-bold mb-6" style={{ color: '#1C2D4F' }}>
        Add Skills
      </h4>
      
      <div className="space-y-6">
        {/* Skill Name */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Skill Name
          </label>
          {skillsLoading ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white flex items-center justify-center">
              <span className="text-gray-500 text-sm">Loading skills...</span>
            </div>
          ) : (
            <SearchableDropdown
              options={skills.map((skill) => ({
                value: skill.name,
                label: skill.name,
              }))}
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Select skill"
              className="w-full"
              allOptionLabel="Select skill"
            />
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Category
          </label>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">Select category</option>
              <option value="technical">Technical Skills</option>
              <option value="business">Business Skills</option>
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

          {/* Proficiency Level */}
          <div>
            <label className="block text-xs font-medium mb-3" style={{ color: '#0273B1' }}>
              Proficiency Level
            </label>
            <div className="space-y-3">
              {/* Beginner */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, level: 'beginner' })}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  formData.level === 'beginner' ? 'border-green-500' : 'border-gray-200'
                }`}
                style={{
                  backgroundColor: formData.level === 'beginner' ? '#F0FDF4' : 'white'
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{ backgroundColor: '#10B981' }}>
                    1
                  </div>
                  <span className="font-semibold text-base" style={{ color: '#1C2D4F' }}>Beginner</span>
                </div>
                <div className="flex gap-1 mb-2">
                  <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                  <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#E5E7EB' }}></div>
                  <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#E5E7EB' }}></div>
                </div>
                <p className="text-sm" style={{ color: '#6B7280' }}>Learning basics, needs guidance</p>
              </button>

              {/* Intermediate */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, level: 'intermediate' })}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  formData.level === 'intermediate' ? 'border-blue-500' : 'border-gray-200'
                }`}
                style={{
                  backgroundColor: formData.level === 'intermediate' ? '#EFF6FF' : 'white'
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{ backgroundColor: '#3B82F6' }}>
                    2
                  </div>
                  <span className="font-semibold text-base" style={{ color: '#1C2D4F' }}>Intermediate</span>
                </div>
                <div className="flex gap-1 mb-2">
                  <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                  <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                  <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#E5E7EB' }}></div>
                </div>
                <p className="text-sm" style={{ color: '#6B7280' }}>Can work independently</p>
              </button>

              {/* Advanced */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, level: 'advanced' })}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  formData.level === 'advanced' ? 'border-purple-500' : 'border-gray-200'
                }`}
                style={{
                  backgroundColor: formData.level === 'advanced' ? '#F3E8FF' : 'white'
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{ backgroundColor: '#9333EA' }}>
                    3
                  </div>
                  <span className="font-semibold text-base" style={{ color: '#1C2D4F' }}>Advanced</span>
                </div>
                <div className="flex gap-1 mb-2">
                  <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#9333EA' }}></div>
                  <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#9333EA' }}></div>
                  <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: '#9333EA' }}></div>
                </div>
                <p className="text-sm" style={{ color: '#6B7280' }}>Can mentor others</p>
              </button>
            </div>
          </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
          style={{
            backgroundColor: 'white',
            color: '#1C2D4F'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(formData)}
          className="px-6 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
          style={{ backgroundColor: '#0273B1' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#025a8f'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0273B1'
          }}
        >
          Add Skill
        </button>
      </div>
    </div>
  )
}
