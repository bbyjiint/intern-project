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
  _aiTag?: boolean
}

interface Step3Props {
  data: any
  onUpdate: (data: any) => void
  onSkip?: () => void
}

const LEVEL_CONFIG = {
  beginner: { 
    label: 'Beginner', 
    desc: 'Learning basics, needs guidance', 
    color: '#10B981', 
    bg: 'bg-green-50 dark:bg-green-900/20', 
    border: 'border-green-500', 
    text: 'text-green-700 dark:text-green-400',
    bars: [true, false, false] 
  },
  intermediate: { 
    label: 'Intermediate', 
    desc: 'Can work independently', 
    color: '#3B82F6', 
    bg: 'bg-blue-50 dark:bg-blue-900/20', 
    border: 'border-blue-500', 
    text: 'text-blue-700 dark:text-blue-400',
    bars: [true, true, false] 
  },
  advanced: { 
    label: 'Advanced', 
    desc: 'Can mentor others', 
    color: '#9333EA', 
    bg: 'bg-purple-50 dark:bg-purple-900/20', 
    border: 'border-purple-500', 
    text: 'text-purple-700 dark:text-purple-400',
    bars: [true, true, true] 
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ml-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
      ✨ AI filled
    </span>
  )
}

export default function Step3SkillsProjects({ data, onUpdate, onSkip }: Step3Props) {
  const [skills, setSkills] = useState<Skill[]>(data.skills || [])
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const initializedRef = useRef(false)
  useEffect(() => {
    if (initializedRef.current) return
    const incoming = data.skills || []
    if (incoming.length === 0) return
    setSkills(incoming)
    initializedRef.current = true
  }, [data.skills])

  const applySkills = (updated: Skill[]) => {
    setSkills(updated)
    onUpdate({ skills: updated })
  }

  const handleAdd = (skill: Skill) => { applySkills([...skills, skill]); setShowForm(false) }
  const handleEdit = (index: number, skill: Skill) => { const u = [...skills]; u[index] = skill; applySkills(u); setEditingIndex(null) }
  const handleDelete = (index: number) => { applySkills(skills.filter((_, i) => i !== index)) }

  const technical = skills.filter(s => s.category === 'technical')
  const business = skills.filter(s => s.category === 'business')
  const aiSkillsNeedingReview = skills.filter(s => s._aiTag && !s.level).length

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Skills</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            This step is optional — you can fill your profile information at any time.
          </p>
        </div>
        {onSkip && (
          <button onClick={onSkip} className="px-5 py-2 rounded-xl font-bold text-sm border-2 border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all active:scale-95">
            Skip &gt;
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-sky-700 dark:text-sky-400">Your Skills</h3>
              <button onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-lg font-bold text-sm bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-500 transition-all">
                + Add Skill
              </button>
            </div>

            {/* AI Banner */}
            {data._aiFilled_skills && skills.length > 0 && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-6 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-sm">
                <span className="text-lg">✨</span>
                <div>
                  <p className="font-bold text-indigo-900 dark:text-indigo-200">
                    AI autofilled {skills.length} skills from your resume
                  </p>
                  <p className="text-indigo-700 dark:text-indigo-300/80 mt-0.5 font-medium">
                    {aiSkillsNeedingReview > 0 
                      ? `${aiSkillsNeedingReview} skills need a proficiency level review.` 
                      : "Please review and adjust proficiency levels as needed."}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <SkillGroup title="Technical Skills" skills={technical} allSkills={skills}
                education={data.education} projects={data.projects}
                onEdit={i => setEditingIndex(i)} onDelete={handleDelete} />

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

function SkillGroup({ title, skills, allSkills, education, projects, onEdit, onDelete }: any) {
  return (
    <div>
      <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{title}</h4>
      {skills.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-600 font-medium">
          No {title.toLowerCase()} added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {skills.map((skill: any) => {
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

function SkillItem({ skill, education, projects, onEdit, onDelete }: any) {
  const cfg = LEVEL_CONFIG[skill.level as keyof typeof LEVEL_CONFIG]
  const { educationIds = [], projectIds = [] } = skill.usedIn || {}

  return (
    <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-slate-900 dark:text-white">{skill.name}</span>
            {skill._aiTag && <AIBadge />}
          </div>

          {(educationIds.length > 0 || projectIds.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Linked:</span>
              {[...educationIds.map((id: any) => education?.[id]?.university), ...projectIds.map((id: any) => projects?.[id]?.name)]
                .filter(Boolean).map((n, i) => (
                <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {n}
                </span>
              ))}
            </div>
          )}

          {cfg ? (
            <div className="max-w-xs">
              <div className="flex gap-1.5 mb-2">
                {cfg.bars.map((filled, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${filled ? '' : 'bg-slate-200 dark:bg-slate-700'}`}
                    style={{ backgroundColor: filled ? cfg.color : undefined }} />
                ))}
              </div>
              <p className={`text-xs font-bold ${cfg.text}`}>{cfg.label} — <span className="opacity-80 font-medium">{cfg.desc}</span></p>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
              <span>⚠</span> Needs Proficiency Level
            </div>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <button onClick={onEdit} className="px-4 py-1.5 rounded-lg text-xs font-bold border-2 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Edit</button>
          <button onClick={onDelete} className="px-4 py-1.5 rounded-lg text-xs font-bold border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  )
}

function SkillForm({ skill, education, projects, onSave, onCancel }: any) {
  const isEditing = !!skill
  const [fields, setFields] = useState<Skill>({
    name: skill?.name || '',
    category: skill?.category || 'technical',
    level: skill?.level || '',
    usedIn: skill?.usedIn || { educationIds: [], projectIds: [] },
    _aiTag: skill?._aiTag || false,
  })
  const [skillOptions, setSkillOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiFetch<any>('/api/skills')
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

  const labelClasses = "block text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-widest mb-3"
  const inputClasses = "w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 transition-all outline-none"

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
        {isEditing ? 'Update Skill' : 'Add New Skill'}
        {isEditing && skill?._aiTag && <AIBadge />}
      </h4>

      <div className="space-y-8">
        <div>
          <label className={labelClasses}>Skill Name</label>
          {loading ? (
            <div className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 animate-pulse text-slate-400">Loading skills...</div>
          ) : (
            <SearchableDropdown
              options={skillOptions.map(s => ({ value: s.name, label: s.name }))}
              value={fields.name}
              onChange={v => set('name', v)}
              placeholder="Search or select a skill"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>Category</label>
            <select value={fields.category} onChange={e => set('category', e.target.value)} className={inputClasses}>
              <option value="technical">Technical Skills</option>
              <option value="business">Business Skills</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClasses}>Proficiency Level</label>
          <div className="grid grid-cols-1 gap-3">
            {(Object.entries(LEVEL_CONFIG) as any).map(([key, cfg]: any, index: number) => (
              <button key={key} type="button" onClick={() => set('level', key)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${fields.level === key ? `${cfg.border} ${cfg.bg}` : 'border-slate-200 dark:border-slate-800 bg-transparent'}`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
                    style={{ backgroundColor: cfg.color }}>{index + 1}</div>
                  <span className="font-bold text-lg text-slate-900 dark:text-white">{cfg.label}</span>
                </div>
                <div className="flex gap-1 mb-3">
                  {cfg.bars.map((filled: any, i: number) => (
                    <div key={i} className="h-1.5 flex-1 rounded-full"
                      style={{ backgroundColor: filled ? cfg.color : '#cbd5e1' }} />
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{cfg.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-10 border-t border-slate-100 dark:border-slate-800 mt-10">
        <button onClick={onCancel} className="px-8 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          Cancel
        </button>
        <button onClick={() => {
          if (!fields.name || !fields.level) return
          onSave({ ...fields, _aiTag: false })
        }} className="px-8 py-3 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 shadow-lg shadow-sky-200 dark:shadow-none transition-all active:scale-95">
          {isEditing ? 'Save Changes' : 'Add to Profile'}
        </button>
      </div>
    </div>
  )
}