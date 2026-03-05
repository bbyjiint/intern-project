'use client'

import { Skill } from '@/hooks/useProfile'

interface SkillsSectionProps {
  skills: Skill[]
  onAdd: () => void
  onEdit: (id: string) => void
}

export default function SkillsSection({ skills, onAdd, onEdit }: SkillsSectionProps) {
  const getSkillLevel = (rating?: number) => {
    if (!rating) return { label: 'Beginner', description: 'Learning basics, needs guidance', width: '33%' }
    if (rating >= 7) return { label: 'Advanced', description: 'Can mentor others', width: '100%' }
    if (rating >= 4) return { label: 'Intermediate', description: 'Can work independently', width: '66%' }
    return { label: 'Beginner', description: 'Learning basics, needs guidance', width: '33%' }
  }

  const technicalSkills = skills.filter(s => s.category === 'technical')
  const businessSkills = skills.filter(s => s.category === 'business')

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Skills
        </h2>
        <button
          onClick={onAdd}
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

      {skills.length === 0 ? (
        <p className="text-gray-400 italic py-4">No skills provided.</p>
      ) : (
        <div className="space-y-6">
          {/* Technical Skills */}
          {technicalSkills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3" style={{ color: '#1C2D4F' }}>Technical Skills</h3>
              <div className="space-y-4">
                {technicalSkills.map((skill) => {
                  const level = getSkillLevel(skill.rating)
                  const percentage = skill.rating ? (skill.rating / 10) * 100 : 0
                  return (
                    <div key={skill.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{skill.name}</span>
                          {skill.linkedToExperience && (
                            <span className="text-xs text-gray-500">Linked to: {skill.linkedToExperience}</span>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: '#0273B1',
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600">
                          {level.label} ({level.description})
                        </p>
                      </div>
                      <button
                        onClick={() => onEdit(skill.id)}
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
                  )
                })}
              </div>
            </div>
          )}

          {/* Business Skills */}
          {businessSkills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3" style={{ color: '#1C2D4F' }}>Business Skills</h3>
              <div className="space-y-4">
                {businessSkills.map((skill) => {
                  const level = getSkillLevel(skill.rating)
                  const percentage = skill.rating ? (skill.rating / 10) * 100 : 0
                  return (
                    <div key={skill.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{skill.name}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: '#0273B1',
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600">
                          {level.label} ({level.description})
                        </p>
                      </div>
                      <button
                        onClick={() => onEdit(skill.id)}
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
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
