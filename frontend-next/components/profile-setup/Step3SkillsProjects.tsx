'use client'

import { useState, useEffect, useRef } from 'react'
import SearchableDropdown from '@/components/SearchableDropdown'
import { apiFetch } from '@/lib/api'

// ─────────────────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────────────────

interface Skill {
  name: string
  category: 'technical' | 'business' | string
  level: 'beginner' | 'intermediate' | 'advanced' | string
  usedIn?: { educationIds?: number[]; projectIds?: number[] }
}

interface Step3Props {
  data: any
  onUpdate: (data: any) => void
  onSkip?: () => void
}

const LEVEL_CONFIG = {
  beginner:     { label: 'Beginner',     desc: 'Learning basics, needs guidance', color: '#10B981', bg: '#F0FDF4', border: 'border-green-500',  bars: [true,  false, false] },
  intermediate: { label: 'Intermediate', desc: 'Can work independently',          color: '#3B82F6', bg: '#EFF6FF', border: 'border-blue-500',   bars: [true,  true,  false] },
  advanced:     { label: 'Advanced',     desc: 'Can mentor others',               color: '#9333EA', bg: '#F3E8FF', border: 'border-purple-500', bars: [true,  true,  true]  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Step3SkillsProjects
// ─────────────────────────────────────────────────────────────────────────────

export default function Step3SkillsProjects({ data, onUpdate, onSkip }: Step3Props) {
  const [skills, setSkills] = useState<Skill[]>(data.skills || [])
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // FIX: sync from parent once when real DB data arrives (same pattern as ProjectsSection)
  const initializedRef = useRef(false)
  useEffect(() => {
    if (initializedRef.current) return
    const incoming = data.skills || []
    if (incoming.length === 0) return
    setSkills(incoming)
    initializedRef.current = true
    // NOTE: do NOT call onUpdate here — this is read-only sync, not a user edit
  }, [data.skills])

  const applySkills = (updated: Skill[]) => {
    setSkills(updated)
    onUpdate({ skills: updated })
  }

  const handleAdd    = (skill: Skill)              => { applySkills([...skills, skill]);                           setShowForm(false)       }
  const handleEdit   = (index: number, skill: Skill) => { const u = [...skills]; u[index] = skill; applySkills(u); setEditingIndex(null)    }
  const handleDelete = (index: number)             => { applySkills(skills.filter((_, i) => i !== index))                                    }

  const technical = skills.filter(s => s.category === 'technical')
  const business  = skills.filter(s => s.category === 'business')

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#1C2D4F' }}>Skills</h2>
          <p className="text-sm" style={{ color: '#A9B4CD' }}>
            This step is optional — you can fill your profile information at any time.
          </p>
        </div>
        {onSkip && (
          <button onClick={onSkip}
            className="flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            style={{ border: '2px solid #0273B1', color: '#0273B1', backgroundColor: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F0F4F8' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white' }}
          >Skip &gt;</button>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        {showForm || editingIndex !== null ? (
          <SkillForm
            skill={editingIndex !== null ? skills[editingIndex] : null}
            education={data.education}
            projects={data.projects}
            onSave={skill => editingIndex !== null ? handleEdit(editingIndex, skill) : handleAdd(skill)}
            onCancel={() => { setShowForm(false); setEditingIndex(null) }}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold" style={{ color: '#0273B1' }}>Skills</h3>
              <button onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                style={{ backgroundColor: '#E3F5FF', color: '#0273B1' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0273B1'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#E3F5FF'; e.currentTarget.style.color = '#0273B1' }}
              >+ Add Skill</button>
            </div>

            <SkillGroup title="Technical Skills" skills={technical} allSkills={skills}
              education={data.education} projects={data.projects}
              onEdit={i => setEditingIndex(i)} onDelete={handleDelete} />

            <div className="mt-6">
              <SkillGroup title="Business Skills" skills={business} allSkills={skills}
                education={data.education} projects={data.projects}
                onEdit={i => setEditingIndex(i)} onDelete={handleDelete} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SkillGroup
// ─────────────────────────────────────────────────────────────────────────────

function SkillGroup({ title, skills, allSkills, education, projects, onEdit, onDelete }: {
  title: string; skills: Skill[]; allSkills: Skill[]
  education: any[]; projects: any[]
  onEdit: (i: number) => void; onDelete: (i: number) => void
}) {
  return (
    <div>
      <h4 className="font-semibold mb-3" style={{ color: '#1C2D4F' }}>{title}</h4>
      {skills.length === 0 ? (
        <p className="text-sm" style={{ color: '#A9B4CD' }}>No {title.toLowerCase()} added yet.</p>
      ) : (
        <div className="space-y-3">
          {skills.map(skill => {
            const originalIndex = allSkills.indexOf(skill)
            return (
              <SkillItem key={originalIndex} skill={skill} education={education} projects={projects}
                onEdit={() => onEdit(originalIndex)} onDelete={() => onDelete(originalIndex)} />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SkillItem
// ─────────────────────────────────────────────────────────────────────────────

function SkillItem({ skill, education, projects, onEdit, onDelete }: {
  skill: Skill; education: any[]; projects: any[]
  onEdit: () => void; onDelete: () => void
}) {
  const cfg = LEVEL_CONFIG[skill.level as keyof typeof LEVEL_CONFIG]

  const linkedToText = (() => {
    const { educationIds = [], projectIds = [] } = skill.usedIn || {}
    const items: string[] = []
    educationIds.forEach((i: number) => {
      const e = education?.[i]
      if (e) items.push(e.university || e.institution || `Education ${i + 1}`)
    })
    projectIds.forEach((i: number) => {
      const p = projects?.[i]
      if (p) items.push(p.name || `Project ${i + 1}`)
    })
    return items.length > 0 ? items.join(', ') : null
  })()

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-semibold mb-1" style={{ color: '#1C2D4F' }}>{skill.name}</div>
          {linkedToText && <div className="text-xs mb-2" style={{ color: '#A9B4CD' }}>Linked to: {linkedToText}</div>}
          {cfg && (
            <>
              <div className="flex gap-1 mb-1">
                {cfg.bars.map((filled, i) => (
                  <div key={i} className="h-2 flex-1 rounded-full"
                    style={{ backgroundColor: filled ? cfg.color : '#E5E7EB' }} />
                ))}
              </div>
              <div className="text-xs" style={{ color: '#A9B4CD' }}>{cfg.label} — {cfg.desc}</div>
            </>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button onClick={onEdit} className="px-3 py-1 rounded text-sm font-semibold"
            style={{ backgroundColor: 'white', border: '2px solid #0273B1', color: '#0273B1' }}>Edit</button>
          <button onClick={onDelete} className="px-3 py-1 rounded text-sm font-semibold"
            style={{ backgroundColor: 'white', border: '2px solid #EF4444', color: '#EF4444' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SkillForm
// ─────────────────────────────────────────────────────────────────────────────

function SkillForm({ skill, education, projects, onSave, onCancel }: {
  skill: Skill | null; education: any[]; projects: any[]
  onSave: (skill: Skill) => void; onCancel: () => void
}) {
  const isEditing = !!skill

  const [fields, setFields] = useState<Skill>({
    name:     skill?.name     || '',
    category: skill?.category || 'technical',
    level:    skill?.level    || '',
    usedIn:   skill?.usedIn   || { educationIds: [], projectIds: [] },
  })
  const [skillOptions, setSkillOptions] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiFetch<{ skills: { id: string; name: string }[] }>('/api/skills')
        if (!cancelled) setSkillOptions(res.skills || [])
      } catch {
        if (!cancelled) setSkillOptions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const set = (key: keyof Skill, value: any) => setFields(prev => ({ ...prev, [key]: value }))

  const toggleLinked = (type: 'educationIds' | 'projectIds', index: number) => {
    const current = fields.usedIn?.[type] || []
    const updated = current.includes(index) ? current.filter((id: number) => id !== index) : [...current, index]
    setFields(prev => ({ ...prev, usedIn: { ...prev.usedIn, [type]: updated } }))
  }

  const handleSubmit = () => {
    if (!fields.name || !fields.category || !fields.level) return
    onSave(fields)
  }

  return (
    <div>
      <h4 className="text-lg font-bold mb-6" style={{ color: '#1C2D4F' }}>
        {isEditing ? 'Edit Skill' : 'Add Skill'}
      </h4>

      <div className="space-y-6">
        {/* Skill Name */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>Skill Name</label>
          {loading ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-400">Loading skills...</div>
          ) : (
            <SearchableDropdown
              options={skillOptions.map(s => ({ value: s.name, label: s.name }))}
              value={fields.name}
              onChange={v => set('name', v)}
              placeholder="Select skill"
              className="w-full"
              allOptionLabel="Select skill"
            />
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>Category</label>
          <div className="relative">
            <select value={fields.category} onChange={e => set('category', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10">
              <option value="">Select category</option>
              <option value="technical">Technical Skills</option>
              <option value="business">Business Skills</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Proficiency Level */}
        <div>
          <label className="block text-xs font-medium mb-3" style={{ color: '#0273B1' }}>Proficiency Level</label>
          <div className="space-y-3">
            {(Object.entries(LEVEL_CONFIG) as [string, typeof LEVEL_CONFIG[keyof typeof LEVEL_CONFIG]][]).map(([key, cfg], num) => (
              <button key={key} type="button" onClick={() => set('level', key)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${fields.level === key ? cfg.border : 'border-gray-200'}`}
                style={{ backgroundColor: fields.level === key ? cfg.bg : 'white' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white"
                    style={{ backgroundColor: cfg.color }}>{num + 1}</div>
                  <span className="font-semibold text-base" style={{ color: '#1C2D4F' }}>{cfg.label}</span>
                </div>
                <div className="flex gap-1 mb-2">
                  {cfg.bars.map((filled, i) => (
                    <div key={i} className="h-2 flex-1 rounded-full"
                      style={{ backgroundColor: filled ? cfg.color : '#E5E7EB' }} />
                  ))}
                </div>
                <p className="text-sm" style={{ color: '#6B7280' }}>{cfg.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-6">
        <button onClick={onCancel}
          className="px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
          style={{ backgroundColor: 'white', color: '#1C2D4F' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white' }}
        >Cancel</button>
        <button onClick={handleSubmit}
          className="px-6 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
          style={{ backgroundColor: '#0273B1' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#025a8f' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0273B1' }}
        >{isEditing ? 'Save Changes' : 'Add Skill'}</button>
      </div>
    </div>
  )
}