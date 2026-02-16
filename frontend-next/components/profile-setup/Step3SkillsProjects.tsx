'use client'

import { useState, useEffect } from 'react'
import SearchableDropdown from '@/components/SearchableDropdown'
import { apiFetch } from '@/lib/api'

interface Step3SkillsProjectsProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step3SkillsProjects({ data, onUpdate }: Step3SkillsProjectsProps) {
  const [formData, setFormData] = useState({
    skills: data.skills || [],
    experience: data.experience || [],
    education: data.education || [],
    projects: data.projects || [],
  })

  // Sync formData when data prop changes (e.g., when user adds education in Step 2)
  useEffect(() => {
    setFormData({
      skills: data.skills || [],
      experience: data.experience || [],
      education: data.education || [],
      projects: data.projects || [],
    })
  }, [data.education, data.projects, data.experience, data.skills])

  const [showSkillForm, setShowSkillForm] = useState(false)
  const [showExperienceForm, setShowExperienceForm] = useState(false)
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null)
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null)

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

  const technicalSkills = formData.skills.filter((s: any) => s.category === 'technical')
  const businessSkills = formData.skills.filter((s: any) => s.category === 'business')

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#0273B1', fontWeight: 700 }}>
        Experience & Skills
      </h2>

      <div className="space-y-8">
        {/* Experience */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold" style={{ color: '#0273B1' }}>
                Experience
              </h3>
              <button
                onClick={() => setShowExperienceForm(true)}
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
                Add Experience
              </button>
            </div>
            <div className="flex flex-col items-end">
              <button
                onClick={() => {
                  // Skip functionality
                }}
                className="px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors mb-2"
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
                Skip
              </button>
              <p className="text-xs text-center" style={{ color: '#A9B4CD' }}>
                *You can build your profile later
              </p>
            </div>
          </div>

          {formData.experience.length === 0 && !showExperienceForm && (
            <p className="text-sm" style={{ color: '#A9B4CD' }}>
              No experience entries yet. Click "Add Experience" to get started.
            </p>
          )}

          {formData.experience.map((exp: any, index: number) => {
            const descriptionLines = exp.description ? exp.description.split('\n').filter((line: string) => line.trim()) : []
            const linkedProjectsCount = exp.linkedProjects ? exp.linkedProjects.length : 0
            
            return (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold mb-1" style={{ color: '#1C2D4F' }}>
                      {exp.title || 'Job Title'} ({exp.type || 'Type'})
                    </h4>
                    <p className="text-sm mb-2" style={{ color: '#A9B4CD' }}>
                      {exp.company || 'Company'} | {exp.startDate || 'Start'} {exp.endDate ? `- ${exp.endDate}` : '- Present'} | Manager: {exp.manager || 'N/A'}
                    </p>
                    {descriptionLines.length > 0 && (
                      <ul className="list-disc list-inside text-sm mt-2 space-y-1" style={{ color: '#1C2D4F' }}>
                        {descriptionLines.map((line: string, i: number) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    )}
                    {linkedProjectsCount > 0 && (
                      <p className="text-sm mt-3" style={{ color: '#0273B1' }}>
                        → {linkedProjectsCount} Project{linkedProjectsCount > 1 ? 's' : ''} linked to this experience
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
            )
          })}

          {(showExperienceForm || editingExperienceIndex !== null) && (
            <ExperienceForm
              experience={editingExperienceIndex !== null ? formData.experience[editingExperienceIndex] : null}
              onSave={(exp: any) => {
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
              onDelete={editingExperienceIndex !== null ? () => {
                handleDeleteExperience(editingExperienceIndex)
                setEditingExperienceIndex(null)
              } : undefined}
            />
          )}
        </div>

        {/* Skills */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
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
                      experience={formData.experience}
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
                      experience={formData.experience}
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

          {(showSkillForm || editingSkillIndex !== null) && (
            <SkillForm
              skill={editingSkillIndex !== null ? formData.skills[editingSkillIndex] : null}
              experience={formData.experience}
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
          )}
        </div>

      </div>
    </div>
  )
}

function SkillItem({ skill, experience, education, projects, onEdit, onDelete }: any) {
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
    const experienceIds = usedIn.experienceIds || []
    const educationIds = usedIn.educationIds || []
    const projectIds = usedIn.projectIds || []
    
    const items = []
    if (experienceIds.length > 0 && experience) {
      const expNames = experienceIds.map((index: number) => {
        const exp = experience[index]
        if (exp) {
          return exp.title ? (exp.type ? `${exp.title} (${exp.type})` : exp.title) : `Experience ${index + 1}`
        }
        return null
      }).filter(Boolean)
      items.push(...expNames)
    }
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

function SkillForm({ skill, experience, education, projects, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: skill?.name || '',
    category: skill?.category || 'technical',
    level: skill?.level || '',
    usedIn: skill?.usedIn || {
      experienceIds: [],
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

  const handleToggleLinkedItem = (type: 'experienceIds' | 'educationIds' | 'projectIds', index: number) => {
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

  const getExperienceLabel = (exp: any) => {
    if (exp.title) {
      return exp.type ? `${exp.title} (${exp.type})` : exp.title
    }
    return `Experience ${exp.index || ''}`
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
    <div className="mt-4 p-6 border border-gray-200 rounded-lg bg-white max-h-[80vh] overflow-y-auto">
      <h4 className="text-lg font-bold mb-6" style={{ color: '#1C2D4F' }}>
        Add Skill
      </h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Skill Name */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Skill Name <span className="text-red-500">*</span>
            </label>
            {skillsLoading ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
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
                placeholder="Search by skill name..."
                className="w-full"
                allOptionLabel="Select Skill"
              />
            )}
            {/* Allow manual entry if skill not found */}
            {formData.name && !skills.find(s => s.name === formData.name) && (
              <p className="text-xs mt-1" style={{ color: '#A9B4CD' }}>
                Skill not found in list. It will be created when you save.
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="technical">Technical Skills</option>
                <option value="business">Business Skills</option>
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Right Column */}
        <div>
          <label className="block text-xs font-medium mb-3" style={{ color: '#0273B1' }}>
            Tell us where you put this skill to use
          </label>
          <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
            Select any item where this skill applies
          </p>

          {/* Experience */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold mb-3" style={{ color: '#1C2D4F' }}>Experience</h5>
            {experience && experience.length > 0 ? (
              <div className="space-y-3">
                {experience.map((exp: any, index: number) => (
                  <label key={index} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.usedIn.experienceIds.includes(index)}
                      onChange={() => handleToggleLinkedItem('experienceIds', index)}
                      className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm" style={{ color: '#1C2D4F' }}>
                      {getExperienceLabel(exp)}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#A9B4CD' }}>No experience added</p>
            )}
          </div>

          {/* Education */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold mb-3" style={{ color: '#1C2D4F' }}>Education</h5>
            {education && Array.isArray(education) && education.length > 0 ? (
              <div className="space-y-3">
                {education.map((edu: any, index: number) => {
                  const label = getEducationLabel(edu)
                  return (
                    <label key={index} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.usedIn.educationIds.includes(index)}
                        onChange={() => handleToggleLinkedItem('educationIds', index)}
                        className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm" style={{ color: '#1C2D4F' }}>
                        {label}
                      </span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#A9B4CD' }}>No education added</p>
            )}
          </div>

          {/* Projects */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold mb-3" style={{ color: '#1C2D4F' }}>Projects</h5>
            {projects && projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map((project: any, index: number) => (
                  <label key={index} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.usedIn.projectIds.includes(index)}
                      onChange={() => handleToggleLinkedItem('projectIds', index)}
                      className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm" style={{ color: '#1C2D4F' }}>
                      {getProjectLabel(project)}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#A9B4CD' }}>No projects added</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
          style={{
            backgroundColor: 'white',
            color: '#1C2D4F'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F9FAFB'
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

function ExperienceForm({ experience, onSave, onCancel, onDelete }: any) {
  const [formData, setFormData] = useState({
    title: experience?.title || '',
    company: experience?.company || '',
    startDate: experience?.startDate || '',
    endDate: experience?.endDate || '',
    isPresent: experience?.isPresent || false,
    description: experience?.description || '',
  })

  return (
    <div className="mt-4 p-6 border border-gray-200 rounded-lg bg-white">
      <h4 className="text-lg font-bold mb-4" style={{ color: '#1C2D4F' }}>
        Add Experience
      </h4>
      <div className="space-y-4">
        {/* Job Title */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Job Title
          </label>
          <input
            type="text"
            placeholder="Example: UI Designer"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Company
          </label>
          <input
            type="text"
            placeholder="Company Name"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Start Date and End Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              End Date
            </label>
            <div className="flex gap-2 items-end">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={formData.isPresent}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <label className="flex items-center mb-0 pb-3">
                <input
                  type="checkbox"
                  checked={formData.isPresent}
                  onChange={(e) => {
                    setFormData({ ...formData, isPresent: e.target.checked, endDate: e.target.checked ? '' : formData.endDate })
                  }}
                  className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm" style={{ color: '#1C2D4F' }}>Present</span>
              </label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
            Description
          </label>
          <textarea
            placeholder="Description about your experience"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => {
              // Add Related Project functionality
            }}
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
            Add Related Project
          </button>
          <div className="flex gap-2">
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
            <button
              onClick={() => onSave({ 
                title: formData.title,
                company: formData.company,
                startDate: formData.startDate,
                endDate: formData.isPresent ? null : formData.endDate,
                description: formData.description,
              })}
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
