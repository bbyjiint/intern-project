'use client'

import { useState, useEffect, useRef } from 'react'
import { ProfileData } from '@/hooks/useProfile'
import { apiFetch } from '@/lib/api'
import MultiSelectDropdown from '@/components/MultiSelectDropdown'

interface Province {
  id: string
  name: string
  thname: string | null
}

const DEFAULT_POSITIONS = ['HR', 'Accounting', 'Marketing', 'IT', 'Finance', 'Sales', 'Operations', 'Engineering']

interface PersonalModalProps {
  isOpen: boolean
  profile: ProfileData | null
  onClose: () => void
  onSave: () => Promise<void> | void
}

export default function PersonalModal({ isOpen, profile, onClose, onSave }: PersonalModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [provinces, setProvinces] = useState<Province[]>([])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    phoneNumber: '',
    email: '',
    bio: '',
    photo: '',
    positionsOfInterest: [] as string[],
    preferredLocations: [] as string[],
    startDate: '',
    endDate: '',
  })

  // Sync ข้อมูลเมื่อ Profile เปลี่ยนหรือเปิด Modal
  useEffect(() => {
    if (profile && isOpen) {
      const names = (profile.fullName || '').split(' ')
      setFormData({
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        // @ts-ignore
        gender: profile.gender || '',
        // @ts-ignore
        dateOfBirth: profile.dateOfBirth || '',
        // @ts-ignore
        nationality: profile.nationality || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.contactEmail || '',
        bio: profile.professionalSummary || profile.bio || '',
        photo: profile.profileImage || '',
        // แปลง Array ให้เป็น String คั่นด้วยลูกน้ำเพื่อนำมาแสดงใน Input
        positionsOfInterest: profile.positionsOfInterest || [],
        // @ts-ignore
        preferredLocations: profile.preferredLocations || [],
        // @ts-ignore
        startDate: profile.startDate || '',
        // @ts-ignore
        endDate: profile.endDate || '',
      })
      setImagePreview(profile.profileImage || '/api/placeholder/150/150')
    }
  }, [profile, isOpen])

  // Load provinces
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setImagePreview(result)
        setFormData(prev => ({ ...prev, photo: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    
    try {
      const payload = {
        ...profile,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        professionalSummary: formData.bio,
        bio: formData.bio,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        phoneNumber: formData.phoneNumber,
        contactEmail: formData.email,
        profileImage: formData.photo,
        // แยก String กลับเป็น Array ก่อนบันทึก
        positionsOfInterest: formData.positionsOfInterest,
        preferredLocations: formData.preferredLocations,
        startDate: formData.startDate,
        endDate: formData.endDate,
      }

      const response = await apiFetch('/api/candidates/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response) {
        await onSave() 
        onClose()
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-slate-800">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[95vh] flex flex-col relative overflow-hidden">
        
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <h2 className="text-lg font-bold">Profile Information</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col-reverse md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">First Name</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">Gender</label>
                <div className="flex gap-4 items-center h-9">
                  {['Male', 'Female'].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="gender" 
                        checked={formData.gender === g} 
                        onChange={() => setFormData(prev => ({...prev, gender: g}))} 
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                      />
                      <span className="text-sm font-medium group-hover:text-blue-600">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Date of birth</label>
                  <input 
                    type="date" 
                    value={formData.dateOfBirth} 
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Nationality</label>
                  <select value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white focus:border-blue-500">
                    <option value="Thai">Thai</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-center shrink-0">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img src={imagePreview} className="w-32 h-32 rounded-2xl object-cover border-2 border-transparent group-hover:border-blue-400" alt="Profile" />
                <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md">
                  <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500">About You</label>
            <textarea 
              rows={4} 
              value={formData.bio || ''} 
              onChange={(e) => setFormData({...formData, bio: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm resize-none" 
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500">Phone Number</label>
              <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* --- เพิ่ม Section Career Preference --- */}
          <div className="pt-6 mt-6 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Career Preference</h3>
            <div className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Position(s) of Interest<span className="text-red-500">*</span></label>
                <MultiSelectDropdown
                  options={DEFAULT_POSITIONS}
                  value={formData.positionsOfInterest}
                  onChange={selected => setFormData({...formData, positionsOfInterest: selected})}
                  placeholder="Select one or more positions (e.g., HR, Accounting)"
                  helperText="Select one or more positions (e.g., HR, Accounting)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">
                  Preferred Location(s)<span className="text-red-500">*</span> <span className="text-slate-500 font-normal text-xs">(Select up to 3 provinces)</span>
                </label>
                <MultiSelectDropdown
                  options={provinces.map(p => ({
                    value: p.id,
                    label: p.thname ? `${p.name} (${p.thname})` : p.name,
                  }))}
                  value={formData.preferredLocations}
                  onChange={selected => {
                    if (selected.length <= 3) {
                      setFormData({...formData, preferredLocations: selected})
                    }
                  }}
                  placeholder="Add preferred province"
                  maxSelections={3}
                  helperText="(Select up to 3 provinces)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Internship Period<span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="date" 
                      value={formData.startDate} 
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                      className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-blue-500" 
                    />
                  </div>
                  <span className="text-slate-400 font-medium">-</span>
                  <div className="relative flex-1">
                    <input 
                      type="date" 
                      value={formData.endDate} 
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                      className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
          {/* --- จบ Section Career Preference --- */}

        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t">
          <button onClick={onClose} disabled={isSaving} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mr-2">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 transition-all flex items-center justify-center min-w-[80px]"
          >
            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}