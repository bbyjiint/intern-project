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

  // Sync calendar when value changes externally (e.g. on data load)
  useEffect(() => {
    const p = parseDate(value)
    if (p) {
      setCalYear(p.year)
      setCalMonth(p.month)
    }
  }, [value])

  // Close on outside click
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

  const btnStyle = (active: boolean) => ({
    backgroundColor: active ? '#0273B1' : 'transparent',
    color: active ? '#fff' : '#1C2D4F',
  })

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          type="text"
          readOnly
          value={value ? toDisplayDate(value) : ''}
          placeholder={placeholder}
          onClick={() => { setOpen(v => !v); setView('day') }}
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => { setOpen(v => !v); setView('day') }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4" style={{ minWidth: 280 }}>
          {/* Nav header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => setView(v => v === 'month' ? 'day' : 'month')}
                className="font-semibold text-sm px-2 py-1 rounded hover:bg-gray-100"
                style={{ color: '#1C2D4F' }}
              >
                {MONTHS[calMonth - 1]}
              </button>
              <button type="button"
                onClick={() => setView(v => v === 'year' ? 'day' : 'year')}
                className="font-semibold text-sm px-2 py-1 rounded hover:bg-gray-100"
                style={{ color: '#1C2D4F' }}
              >
                {calYear}
              </button>
            </div>
            <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Month picker */}
          {view === 'month' && (
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((m, i) => (
                <button key={m} type="button"
                  onClick={() => { setCalMonth(i + 1); setView('day') }}
                  className="py-2 rounded-lg text-sm font-medium transition-colors"
                  style={btnStyle(calMonth === i + 1)}
                  onMouseEnter={e => { if (calMonth !== i + 1) e.currentTarget.style.backgroundColor = '#E3F5FF' }}
                  onMouseLeave={e => { if (calMonth !== i + 1) e.currentTarget.style.backgroundColor = 'transparent' }}
                >{m}</button>
              ))}
            </div>
          )}

          {/* Year picker */}
          {view === 'year' && (
            <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
              {Array.from({ length: 100 }, (_, i) => today.getFullYear() - i).map(y => (
                <button key={y} type="button"
                  onClick={() => { setCalYear(y); setView('day') }}
                  className="py-2 rounded-lg text-sm font-medium transition-colors"
                  style={btnStyle(calYear === y)}
                  onMouseEnter={e => { if (calYear !== y) e.currentTarget.style.backgroundColor = '#E3F5FF' }}
                  onMouseLeave={e => { if (calYear !== y) e.currentTarget.style.backgroundColor = 'transparent' }}
                >{y}</button>
              ))}
            </div>
          )}

          {/* Day picker */}
          {view === 'day' && (
            <>
              <div className="grid grid-cols-7 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-center text-xs font-medium py-1" style={{ color: '#A9B4CD' }}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {blanks.map(b => <div key={`b${b}`} />)}
                {days.map(day => {
                  const active = parsed?.day === day && parsed?.month === calMonth && parsed?.year === calYear
                  return (
                    <button key={day} type="button"
                      onClick={() => selectDay(day)}
                      className="w-full aspect-square rounded-full text-sm font-medium transition-colors flex items-center justify-center"
                      style={btnStyle(active)}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#E3F5FF' }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
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
// Step1GeneralInfo
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

  // FIX: Sync form when parent data changes (e.g. after loadProfile on refresh)
  useEffect(() => {
    const built = buildFormFields(data)
    setFields(built)

    // Sync province IDs — they come as UUID strings from backend
    const locs = data.preferredLocations || []
    if (locs.length > 0) {
      setSelectedProvinceIds(locs)
    }
  }, [data])

  // Load provinces once — after load, sync selectedProvinceIds if needed
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiFetch<{ provinces: Province[] }>('/api/addresses/provinces')
        if (cancelled) return
        setProvinces(res.provinces || [])
      } catch {
        if (!cancelled) setProvinces([])
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleChange = (field: keyof FormFields, value: string | string[]) => {
    const updated = { ...fields, [field]: value } as FormFields

    if (field === 'firstName' || field === 'lastName') {
      ;(updated as any).fullName = `${updated.firstName} ${updated.lastName}`.trim()
    }

    // Auto-combine internship period string
    if (field === 'internshipStart' || field === 'internshipEnd') {
      const start = field === 'internshipStart' ? value as string : updated.internshipStart
      const end = field === 'internshipEnd' ? value as string : updated.internshipEnd
      updated.internshipPeriod = start && end ? `${start} - ${end}` : start || end || ''
    }

    setFields(updated)
    onUpdate(updated)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const updated = { ...fields, photo: reader.result as string }
      setFields(updated)
      onUpdate(updated)
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    const updated = { ...fields, photo: null }
    setFields(updated)
    onUpdate(updated)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#1C2D4F', fontWeight: 700 }}>
            Profile Information
          </h2>
          <p className="text-sm" style={{ color: '#A9B4CD' }}>
            This step is optional — you can fill your profile information at any time.
          </p>
        </div>
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            style={{ border: '2px solid #0273B1', color: '#0273B1', backgroundColor: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F0F4F8' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white' }}
          >
            Skip &gt;
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column — form fields */}
        <div className="flex-1 space-y-5">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>First Name</label>
              <input
                type="text"
                value={fields.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
                placeholder="Your First Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>Last Name</label>
              <input
                type="text"
                value={fields.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
                placeholder="Your Last Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>Gender</label>
            <div className="flex gap-4">
              {['Male', 'Female'].map(g => (
                <label key={g} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={fields.gender === g}
                    onChange={e => handleChange('gender', e.target.value)}
                    className="mr-2"
                    style={{ accentColor: '#0273B1' }}
                  />
                  <span className="text-sm" style={{ color: '#1C2D4F' }}>{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>Date of Birth</label>
            <DayMonthYearPicker
              value={fields.dateOfBirth}
              onChange={val => handleChange('dateOfBirth', val)}
            />
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>Nationality</label>
            <select
              value={fields.nationality}
              onChange={e => handleChange('nationality', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Thai">Thai</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>Email</label>
            <input
              type="email"
              value={fields.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>Phone Number</label>
            <input
              type="tel"
              value={fields.phoneNumber}
              onChange={e => handleChange('phoneNumber', e.target.value)}
              placeholder="e.g. 08x-xxx-xxxx"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right column — photo */}
        <div className="ml-auto">
          {fields.photo ? (
            <div className="relative w-32">
              <img src={fields.photo} alt="Profile" className="w-full aspect-square object-cover rounded-lg" />
              <button
                onClick={removePhoto}
                className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="cursor-pointer block w-32">
              <div
                className="w-full aspect-square rounded-lg flex flex-col items-center justify-center border-2 border-dashed transition-colors"
                style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}
              >
                <svg className="w-6 h-6 mb-1" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Add Picture</span>
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* About You */}
      <div className="mt-8">
        <label className="block text-xs font-medium mb-1" style={{ color: '#0273B1' }}>About You</label>
        <p className="text-xs mb-3" style={{ color: '#A9B4CD' }}>
          Add a short description highlighting your background, skills, or interests.
        </p>
        <textarea
          value={fields.aboutYou}
          onChange={e => handleChange('aboutYou', e.target.value)}
          placeholder="Write a brief overview of yourself"
          rows={5}
          maxLength={3000}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Career Preference */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-bold mb-6" style={{ color: '#1C2D4F', fontWeight: 700 }}>Career Preference</h3>

        <div className="space-y-6">
          {/* Positions of Interest */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>Position(s) of Interest</label>
            <MultiSelectDropdown
              options={DEFAULT_POSITIONS}
              value={fields.positionsOfInterest}
              onChange={selected => handleChange('positionsOfInterest', selected)}
              placeholder="Select one or more positions (e.g., HR, Accounting)"
              helperText="Select one or more positions (e.g., HR, Accounting)"
            />
          </div>

          {/* Preferred Locations */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>Preferred Location(s)</label>
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
              placeholder="Add preferred province"
              maxSelections={3}
              helperText="(Select up to 3 provinces)"
            />
          </div>

          {/* Internship Period */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>Internship Period</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#A9B4CD' }}>Start Date</label>
                <DayMonthYearPicker
                  value={fields.internshipStart}
                  onChange={val => handleChange('internshipStart', val)}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#A9B4CD' }}>End Date</label>
                <DayMonthYearPicker
                  value={fields.internshipEnd}
                  onChange={val => handleChange('internshipEnd', val)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}