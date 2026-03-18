'use client'

import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '@/lib/api'
import MultiSelectDropdown from '@/components/MultiSelectDropdown'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Province {
  id: string
  name: string
  thname: string | null
}

interface FormFields {
  firstName: string
  lastName: string
  gender: string
  dateOfBirth: string
  nationality: string
  email: string
  phoneNumber: string
  aboutYou: string
  photo: string | null
  positionsOfInterest: string[]
  preferredLocations: string[]
  internshipStart: string
  internshipEnd: string
  internshipPeriod: string
}

interface Step1Props {
  data: any
  onUpdate: (data: any) => void
  onSkip?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DEFAULT_POSITIONS = ['HR', 'Accounting', 'Marketing', 'IT', 'Finance', 'Sales', 'Operations', 'Engineering']

// ─────────────────────────────────────────────────────────────────────────────
// AIBadge
// ─────────────────────────────────────────────────────────────────────────────

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ml-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
      ✨ AI FILLED
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseDate(val: string): { day: number; month: number; year: number } | null {
  if (!val) return null
  const iso = val.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return { year: +iso[1], month: +iso[2], day: +iso[3] }
  const dmy = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmy) return { day: +dmy[1], month: +dmy[2], year: +dmy[3] }
  return null
}

function toDisplayDate(val: string): string {
  const p = parseDate(val)
  if (!p) return val
  return `${String(p.day).padStart(2, '0')}/${String(p.month).padStart(2, '0')}/${p.year}`
}

// ─────────────────────────────────────────────────────────────────────────────
// DayMonthYearPicker
// ─────────────────────────────────────────────────────────────────────────────

function DayMonthYearPicker({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'day' | 'month' | 'year'>('day')
  const wrapRef = useRef<HTMLDivElement>(null)

  const parsed = parseDate(value)
  const today = new Date()
  const [calYear, setCalYear] = useState(parsed?.year ?? today.getFullYear())
  const [calMonth, setCalMonth] = useState(parsed?.month ?? today.getMonth() + 1)

  useEffect(() => {
    const p = parseDate(value)
    if (p) {
      setCalYear(p.year)
      setCalMonth(p.month)
    }
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate()
  const getFirstDay = (y: number, m: number) => new Date(y, m - 1, 1).getDay()

  const prevMonth = () => {
    if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const selectDay = (day: number) => {
    onChange(`${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
    setOpen(false)
  }

  const days = Array.from({ length: getDaysInMonth(calYear, calMonth) }, (_, i) => i + 1)
  const blanks = Array.from({ length: getFirstDay(calYear, calMonth) }, (_, i) => i)

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          type="text"
          readOnly
          value={value ? toDisplayDate(value) : ''}
          placeholder={placeholder}
          onClick={() => { setOpen(v => !v); setView('day') }}
          className="w-full px-4 py-3 pr-10 border rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer transition-colors"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => { setOpen(v => !v); setView('day') }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 min-w-[300px]">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex gap-1">
              <button type="button" onClick={() => setView('month')} className="font-bold text-sm px-3 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100">
                {MONTHS[calMonth - 1]}
              </button>
              <button type="button" onClick={() => setView('year')} className="font-bold text-sm px-3 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100">
                {calYear}
              </button>
            </div>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {view === 'month' && (
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((m, i) => (
                <button key={m} type="button"
                  onClick={() => { setCalMonth(i + 1); setView('day') }}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                    calMonth === i + 1 
                    ? 'bg-sky-600 text-white' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/30'
                  }`}
                >{m}</button>
              ))}
            </div>
          )}

          {view === 'year' && (
            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {Array.from({ length: 100 }, (_, i) => today.getFullYear() - i).map(y => (
                <button key={y} type="button"
                  onClick={() => { setCalYear(y); setView('day') }}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                    calYear === y 
                    ? 'bg-sky-600 text-white' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/30'
                  }`}
                >{y}</button>
              ))}
            </div>
          )}

          {view === 'day' && (
            <>
              <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {blanks.map(b => <div key={`b${b}`} />)}
                {days.map(day => {
                  const isActive = parsed?.day === day && parsed?.month === calMonth && parsed?.year === calYear
                  return (
                    <button key={day} type="button"
                      onClick={() => selectDay(day)}
                      className={`w-full aspect-square rounded-full text-sm font-bold transition-all flex items-center justify-center ${
                        isActive 
                        ? 'bg-sky-600 text-white shadow-md' 
                        : 'text-slate-700 dark:text-slate-200 hover:bg-sky-100 dark:hover:bg-sky-900/50'
                      }`}
                    >{day}</button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

function buildFormFields(data: any): FormFields {
  const nameParts = (data.fullName || '').split(' ')
  let internshipStart = data.internshipStart || ''
  let internshipEnd = data.internshipEnd || ''
  if (!internshipStart && data.internshipPeriod) {
    const parts = data.internshipPeriod.split(' - ')
    internshipStart = parts[0] || ''
    internshipEnd = parts[1] || ''
  }
  return {
    firstName: data.firstName || nameParts[0] || '',
    lastName: data.lastName || nameParts.slice(1).join(' ') || '',
    gender: data.gender || '',
    dateOfBirth: data.dateOfBirth || '',
    nationality: data.nationality || 'Thai',
    email: data.email || '',
    phoneNumber: data.phoneNumber || '',
    aboutYou: data.aboutYou || data.professionalSummary || '',
    photo: data.photo || data.profileImage || null,
    positionsOfInterest: data.positionsOfInterest || [],
    preferredLocations: data.preferredLocations || [],
    internshipStart,
    internshipEnd,
    internshipPeriod: data.internshipPeriod || '',
  }
}

export default function Step1GeneralInfo({ data, onUpdate, onSkip }: Step1Props) {
  const [fields, setFields] = useState<FormFields>(() => buildFormFields(data))
  const [provinces, setProvinces] = useState<Province[]>([])
  const [selectedProvinceIds, setSelectedProvinceIds] = useState<string[]>([])

  useEffect(() => {
    const built = buildFormFields(data)
    setFields(built)
    if (data.preferredLocations?.length > 0) setSelectedProvinceIds(data.preferredLocations)
  }, [data])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiFetch<{ provinces: Province[] }>('/api/addresses/provinces')
        if (!cancelled) setProvinces(res.provinces || [])
      } catch {
        if (!cancelled) setProvinces([])
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleChange = (field: keyof FormFields, value: any) => {
    const updated = { ...fields, [field]: value }
    if (field === 'firstName' || field === 'lastName') {
      (updated as any).fullName = `${updated.firstName} ${updated.lastName}`.trim()
    }
    if (field === 'internshipStart' || field === 'internshipEnd') {
      const start = field === 'internshipStart' ? value : updated.internshipStart
      const end = field === 'internshipEnd' ? value : updated.internshipEnd
      updated.internshipPeriod = start && end ? `${start} - ${end}` : start || end || ''
    }
    setFields(updated)
    onUpdate(updated)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => handleChange('photo', reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-4xl mx-auto p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Profile Information
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            This step is optional — you can fill your profile at any time.
          </p>
        </div>
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-sky-600 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all active:scale-95"
          >
            Skip &gt;
          </button>
        )}
      </div>

      {/* AI Autofill Banner */}
      {data._aiAutofilled && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-8 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-sm animate-in fade-in slide-in-from-top-2">
          <span className="text-xl">✨</span>
          <div>
            <span className="font-bold text-indigo-900 dark:text-indigo-200">AI autofilled your profile</span>
            <p className="text-indigo-700 dark:text-indigo-300/80">Fields marked with AI badge were read from your resume.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-sky-700 dark:text-sky-400 uppercase tracking-wide">
                First Name {data._aiFilled_firstName && <AIBadge />}
              </label>
              <input
                type="text"
                value={fields.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
                placeholder="John"
                className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-sky-700 dark:text-sky-400 uppercase tracking-wide">
                Last Name {data._aiFilled_lastName && <AIBadge />}
              </label>
              <input
                type="text"
                value={fields.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
                placeholder="Doe"
                className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-3 text-sky-700 dark:text-sky-400 uppercase tracking-wide">Gender</label>
            <div className="flex gap-6">
              {['Male', 'Female'].map(g => (
                <label key={g} className="group flex items-center cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={fields.gender === g}
                      onChange={e => handleChange('gender', e.target.value)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 dark:border-slate-600 checked:border-sky-600 transition-all"
                    />
                    <div className="pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-sky-600 opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="ml-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-sky-600 transition-colors">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-sky-700 dark:text-sky-400 uppercase tracking-wide">Date of Birth</label>
              <DayMonthYearPicker value={fields.dateOfBirth} onChange={val => handleChange('dateOfBirth', val)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-sky-700 dark:text-sky-400 uppercase tracking-wide">Nationality</label>
              <select
                value={fields.nationality}
                onChange={e => handleChange('nationality', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none appearance-none transition-all"
              >
                <option value="Thai">Thai</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-sky-700 dark:text-sky-400 uppercase tracking-wide">
                Email {data._aiFilled_email && <AIBadge />}
              </label>
              <input
                type="email"
                value={fields.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="hello@example.com"
                className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-sky-700 dark:text-sky-400 uppercase tracking-wide">
                Phone Number {data._aiFilled_phoneNumber && <AIBadge />}
              </label>
              <input
                type="tel"
                value={fields.phoneNumber}
                onChange={e => handleChange('phoneNumber', e.target.value)}
                placeholder="08X-XXX-XXXX"
                className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Profile Photo - Sidebar style */}
        <div className="lg:col-span-4 flex justify-center lg:justify-end">
          <div className="sticky top-6">
            <label className="block text-sm font-bold mb-3 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center lg:text-right">Profile Photo</label>
            <div className="relative group">
              {fields.photo ? (
                <div className="relative h-40 w-40 overflow-hidden rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl">
                  <img src={fields.photo} alt="Profile" className="h-full w-full object-cover" />
                  <button
                    onClick={() => handleChange('photo', null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all">
                  <svg className="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-xs font-bold text-slate-400">Add Picture</span>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About You */}
      <div className="mt-10 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <label className="block text-sm font-bold mb-1 text-sky-700 dark:text-sky-400 uppercase">
          About You {data._aiFilled_aboutYou && <AIBadge />}
        </label>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
          Brief description of your background, skills, or interests.
        </p>
        <textarea
          value={fields.aboutYou}
          onChange={e => handleChange('aboutYou', e.target.value)}
          placeholder="Tell us about yourself..."
          rows={5}
          className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none"
        />
      </div>

      {/* Career Preference */}
      <div className="mt-10 pt-10 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight">Career Preference</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-3 text-sky-700 dark:text-sky-400 uppercase">Positions of Interest</label>
              <MultiSelectDropdown
                options={DEFAULT_POSITIONS}
                value={fields.positionsOfInterest}
                onChange={selected => handleChange('positionsOfInterest', selected)}
                placeholder="Choose positions..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-3 text-sky-700 dark:text-sky-400 uppercase">Preferred Locations</label>
              <MultiSelectDropdown
                options={provinces.map(p => ({
                  value: p.id,
                  label: p.thname ? `${p.name} (${p.thname})` : p.name,
                }))}
                value={selectedProvinceIds}
                onChange={selected => {
                  if (selected.length <= 3) {
                    setSelectedProvinceIds(selected)
                    handleChange('preferredLocations', selected)
                  }
                }}
                maxSelections={3}
                placeholder="Add provinces (Max 3)"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-sky-50/50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/30">
            <label className="block text-sm font-bold mb-4 text-sky-700 dark:text-sky-400 uppercase">Internship Period</label>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Start Date</span>
                <DayMonthYearPicker value={fields.internshipStart} onChange={val => handleChange('internshipStart', val)} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">End Date</span>
                <DayMonthYearPicker value={fields.internshipEnd} onChange={val => handleChange('internshipEnd', val)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}