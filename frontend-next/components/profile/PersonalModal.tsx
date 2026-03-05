'use client'

import { useState, useEffect } from 'react'
import { ProfileData } from '@/hooks/useProfile'
import { apiFetch } from '@/lib/api'

interface PersonalModalProps {
  isOpen: boolean
  profile: ProfileData | null
  onClose: () => void
  onSave: () => void
}

export default function PersonalModal({ isOpen, profile, onClose, onSave }: PersonalModalProps) {
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

  const [isSaving, setIsSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')

  // Initialize data
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
      setImagePreview(profile.profileImage || '/api/placeholder/100/100')
    }
  }, [profile, isOpen])

  // แก้ไข: เพิ่มการเซฟลง formData เมื่อเลือกรูป
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setImagePreview(result)
        setFormData(prev => ({ ...prev, profileImage: result })) // <--- ต้องอัปเดตตัวนี้ด้วย
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // รวม Payload ให้ครบถ้วน ป้องกันข้อมูลที่ไม่ได้อยู่ในฟอร์มหาย
      const payload = {
        ...profile, // รักษา id และ metadata อื่นๆ
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        phoneNumber: formData.phoneNumber,
        contactEmail: formData.contactEmail,
        bio: formData.bio,
        profileImage: formData.profileImage,
        internshipPeriod: formData.internshipPeriod,
        // สำคัญ: ต้องส่ง 2 ตัวนี้กลับไปด้วย ข้อมูลเดิมจะได้ไม่หาย
        positionsOfInterest: formData.positionsOfInterest,
        preferredLocations: formData.preferredLocations,
      }

      const response = await apiFetch('/api/candidates/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

      if (response) {
        await onSave() // แจ้ง Parent ให้อัปเดต UI
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
        <div className="px-6 pt-6 pb-2 flex justify-between items-center border-b border-transparent">
          <h2 className="text-lg font-bold">Profile Information</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* ส่วนข้อมูลส่วนตัว (First Name, Last Name, Gender, DOB, Nationality, Profile Image) */}
          <div className="flex flex-col-reverse md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">First Name<span className="text-red-500">*</span></label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Last Name<span className="text-red-500">*</span></label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gender<span className="text-red-500">*</span></label>
                <div className="flex gap-4 items-center">
                  {['Male', 'Female'].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="gender" checked={formData.gender === g} onChange={() => setFormData(prev => ({...prev, gender: g}))} className="w-3.5 h-3.5 text-blue-600 border-slate-300" />
                      <span className="text-xs font-medium group-hover:text-blue-600">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Date of birth<span className="text-red-500">*</span></label>
                  <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Nationality<span className="text-red-500">*</span></label>
                  <select value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white focus:border-blue-500">
                    <option value="Thai">Thai</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-center shrink-0">
              <div className="relative group">
                <img src={imagePreview} className="w-32 h-32 rounded-xl object-cover border-2 border-slate-100 shadow-sm" alt="Profile" />
                <label className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-full shadow-md border border-slate-100 cursor-pointer hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
            </div>
          </div>

          {/* About You Section */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">About You</label>
            <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm resize-none" placeholder="Add a short description highlighting your background, skills, or interests." />
          </div>

          <hr className="border-slate-100" />

          {/* Contact Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Email<span className="text-red-500">*</span></label>
                <input type="email" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Phone Number<span className="text-red-500">*</span></label>
                <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
              </div>
          </div>

          {/* เพิ่มส่วน: Career Preference (จากภาพที่ 12 และ 13) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Career Preference</h3>
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Position(s) of Interest<span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="e.g. Backend Developer, AI Developer (comma separated)"
                value={formData.positionsOfInterest.join(', ')}
                onChange={(e) => setFormData({...formData, positionsOfInterest: e.target.value.split(',').map(s => s.trim())})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Preferred Location(s)<span className="text-red-500">*</span> (Select up to 3 provinces)</label>
              <input 
                type="text" 
                placeholder="e.g. Bangkok, Chiang Mai"
                value={formData.preferredLocations.join(', ')}
                onChange={(e) => setFormData({...formData, preferredLocations: e.target.value.split(',').map(s => s.trim())})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Internship Period<span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="01/05/2026 - 04/24/2026"
                  value={formData.internshipPeriod}
                  onChange={(e) => setFormData({...formData, internshipPeriod: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" 
                />
                <svg className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-600 mr-2">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-[#2563EB] text-white text-sm font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 transition-all active:scale-95"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}