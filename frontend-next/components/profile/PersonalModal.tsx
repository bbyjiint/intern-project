'use client'

import { useState, useEffect, useRef } from 'react'
import { ProfileData } from '@/hooks/useProfile'
import { apiFetch } from '@/lib/api'

interface PersonalModalProps {
  isOpen: boolean
  profile: ProfileData | null
  onClose: () => void
  onSave: () => Promise<void> | void // เปลี่ยนเป็นรองรับ async
}

export default function PersonalModal({ isOpen, profile, onClose, onSave }: PersonalModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Female',
    dateOfBirth: '',
    nationality: 'Thai',
    phoneNumber: '',
    contactEmail: '',
    bio: '',
    profileImage: '',
    positionsOfInterest: [] as string[],
    preferredLocations: [] as string[],
    internshipPeriod: '',
  })

  useEffect(() => {
    if (profile && isOpen) {
      const names = (profile.fullName || '').split(' ')
      setFormData({
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        gender: (profile as any).gender || 'Female',
        dateOfBirth: (profile as any).dateOfBirth || '',
        nationality: (profile as any).nationality || 'Thai',
        phoneNumber: profile.phoneNumber || '',
        contactEmail: profile.contactEmail || '',
        bio: profile.bio || '',
        profileImage: profile.profileImage || '',
        positionsOfInterest: profile.positionsOfInterest || [],
        preferredLocations: profile.preferredLocations || [],
        internshipPeriod: (profile as any).internshipPeriod || '',
      })
      setImagePreview(profile.profileImage || '/api/placeholder/150/150')
    }
  }, [profile, isOpen])

  const handleImageClick = () => fileInputRef.current?.click()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setImagePreview(result)
        setFormData(prev => ({ ...prev, profileImage: result }))
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
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        phoneNumber: formData.phoneNumber,
        contactEmail: formData.contactEmail,
        bio: formData.bio,
        profileImage: formData.profileImage,
        internshipPeriod: formData.internshipPeriod,
        positionsOfInterest: formData.positionsOfInterest.filter(Boolean),
        preferredLocations: formData.preferredLocations.filter(Boolean),
      }

      const response = await apiFetch('/api/candidates/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

      if (response) {
        // หัวใจสำคัญ: เรียก onSave (refresh ข้อมูล) และรอจนกว่าจะเสร็จ
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
        
        {/* Header */}
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
                      <input type="radio" name="gender" checked={formData.gender === g} onChange={() => setFormData(prev => ({...prev, gender: g}))} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm font-medium group-hover:text-blue-600">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Date of birth</label>
                  <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
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

            {/* Profile Image */}
            <div className="flex justify-center shrink-0">
              <div className="relative group cursor-pointer" onClick={handleImageClick}>
                <img src={imagePreview} className="w-32 h-32 rounded-2xl object-cover border-2 border-transparent group-hover:border-blue-400" alt="Profile" />
                <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md">
                  <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} onClick={e => e.stopPropagation()} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-500">About You</label>
            <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">Email</label>
                <input type="email" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">Phone Number</label>
                <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
              </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Career Preference</h3>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-500">Position(s) of Interest</label>
              <input 
                type="text" 
                value={formData.positionsOfInterest.join(', ')}
                onChange={(e) => setFormData({...formData, positionsOfInterest: e.target.value.split(',').map(s => s.trim())})}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" 
              />
            </div>
          </div>
        </div>

        {/* Footer */}
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