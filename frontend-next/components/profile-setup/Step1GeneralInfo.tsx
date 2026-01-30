'use client'

import { useState } from 'react'

interface Step1GeneralInfoProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step1GeneralInfo({ data, onUpdate }: Step1GeneralInfoProps) {
  const [formData, setFormData] = useState({
    fullName: data.fullName || '',
    email: data.email || '',
    phoneNumber: data.phoneNumber || '',
    aboutYou: data.aboutYou || '',
    photo: data.photo || null,
  })

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const updated = { ...formData, photo: reader.result as string }
        setFormData(updated)
        onUpdate(updated)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8" style={{ color: '#0273B1', fontWeight: 700 }}>
        General Information
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Form Fields */}
        <div className="flex-1 max-w-md space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Example: Jane Smith"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Phone Number
            </label>
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="text"
                  defaultValue="+66"
                  className="w-20 px-4 py-3 pr-8 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="Phone Number"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Add Picture */}
        <div className="ml-auto">
          {formData.photo ? (
            <div className="relative w-32">
              <img
                src={formData.photo}
                alt="Profile"
                className="w-full aspect-square object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  const updated = { ...formData, photo: null }
                  setFormData(updated)
                  onUpdate(updated)
                }}
                className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="cursor-pointer block w-32">
              <div className="w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-colors" style={{ backgroundColor: '#E3F5FF' }}>
                <svg className="w-6 h-6 mb-1" style={{ color: '#0273B1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px] font-medium" style={{ color: '#0273B1' }}>
                  Add Picture
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* About You (Optional) - Full Width */}
      <div className="mt-8">
        <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
          About You (Optional)
        </label>
        <p className="text-xs mb-3" style={{ color: '#A9B4CD' }}>
          Add a short description highlighting your background, skills, or interests.
        </p>
        
        {/* Text Area */}
        <textarea
          value={formData.aboutYou}
          onChange={(e) => handleChange('aboutYou', e.target.value)}
          placeholder="Write a brief overview of yourself"
          rows={5}
          maxLength={3000}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        
        {/* Character Counter */}
        <div className="text-right text-xs mt-1" style={{ color: '#A9B4CD' }}>
          {formData.aboutYou.length}/3,000
        </div>
      </div>
    </div>
  )
}
