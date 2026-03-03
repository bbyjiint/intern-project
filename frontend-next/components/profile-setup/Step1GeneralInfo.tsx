'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import MultiSelectDropdown from '@/components/MultiSelectDropdown'

interface Step1GeneralInfoProps {
  data: any
  onUpdate: (data: any) => void
  onSkip?: () => void
}

export default function Step1GeneralInfo({ data, onUpdate, onSkip }: Step1GeneralInfoProps) {
  const [formData, setFormData] = useState({
    firstName: data.firstName || data.fullName?.split(' ')[0] || '',
    lastName: data.lastName || data.fullName?.split(' ').slice(1).join(' ') || '',
    gender: data.gender || '',
    dateOfBirth: data.dateOfBirth || '',
    nationality: data.nationality || 'Thai',
    email: data.email || '',
    phoneNumber: data.phoneNumber || '',
    aboutYou: data.aboutYou || '',
    photo: data.photo || null,
    positionsOfInterest: data.positionsOfInterest || [],
    preferredLocations: data.preferredLocations || [],
    internshipPeriod: data.internshipPeriod || '',
  })

  // Dropdown options - will be loaded from database later
  const [positions, setPositions] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])

  // Load dropdown options from database (placeholder for future API integration)
  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        // TODO: Replace with actual API endpoints when available
        // const positionsData = await apiFetch<{ positions: string[] }>('/api/positions')
        // const locationsData = await apiFetch<{ locations: string[] }>('/api/locations')
        // setPositions(positionsData.positions)
        // setLocations(locationsData.locations)

        // Temporary mock data - will be replaced with database data
        setPositions(['HR', 'Accounting', 'Marketing', 'IT', 'Finance', 'Sales', 'Operations', 'Engineering'])
        setLocations(['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Hua Hin', 'Krabi', 'Ayutthaya', 'Chonburi'])
      } catch (error) {
        console.error('Failed to load dropdown options:', error)
        // Fallback to mock data on error
        setPositions(['HR', 'Accounting', 'Marketing', 'IT', 'Finance'])
        setLocations(['Bangkok', 'Chiang Mai', 'Phuket'])
      }
    }

    loadDropdownOptions()
  }, [])

  // Sync formData when data prop changes (e.g., when profile data is loaded from API)
  useEffect(() => {
    const fullNameParts = (data.fullName || '').split(' ')
    setFormData({
      firstName: data.firstName || fullNameParts[0] || '',
      lastName: data.lastName || fullNameParts.slice(1).join(' ') || '',
      gender: data.gender || '',
      dateOfBirth: data.dateOfBirth || '',
      nationality: data.nationality || 'Thai',
      email: data.email || '',
      phoneNumber: data.phoneNumber || '',
      aboutYou: data.aboutYou || data.professionalSummary || '',
      photo: data.photo || data.profileImage || null,
      positionsOfInterest: data.positionsOfInterest || [],
      preferredLocations: data.preferredLocations || [],
      internshipPeriod: data.internshipPeriod || '',
    })
  }, [data])

  const handleChange = (field: string, value: string | string[]) => {
    const updated = { ...formData, [field]: value }
    // Combine firstName and lastName into fullName for backward compatibility
    if (field === 'firstName' || field === 'lastName') {
      updated.fullName = `${updated.firstName} ${updated.lastName}`.trim()
    }
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
      {/* Header with Skip Button */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#1C2D4F', fontWeight: 700 }}>
            Profile Information
          </h2>
          <p className="text-sm" style={{ color: '#A9B4CD' }}>
            This step is optional - you can fill your profile Information at any time.
          </p>
        </div>
        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            style={{
              border: '2px solid #0273B1',
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
            Skip &gt;
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Form Fields */}
        <div className="flex-1 space-y-6">
          {/* First Name and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Your Last Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Gender
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === 'Male'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="mr-2"
                  style={{ accentColor: '#0273B1' }}
                />
                <span className="text-sm" style={{ color: '#1C2D4F' }}>Male</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender === 'Female'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="mr-2"
                  style={{ accentColor: '#0273B1' }}
                />
                <span className="text-sm" style={{ color: '#1C2D4F' }}>Female</span>
              </label>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Date of birth
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Nationality
            </label>
            <select
              value={formData.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Thai">Thai</option>
              <option value="Other">Other</option>
            </select>
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
              placeholder="Example@gmail.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="e.g., 08x-xxx-xxxx"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              <div className="w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-colors border-2 border-dashed" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}>
                <svg className="w-6 h-6 mb-1" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>
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
          About You
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Career Preference Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-bold mb-6" style={{ color: '#1C2D4F', fontWeight: 700 }}>
          Career Preference
        </h3>

        <div className="space-y-6">
          {/* Position(s) of Interest */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Position(s) of Interest
            </label>
            <MultiSelectDropdown
              options={positions.length > 0 ? positions : ['HR', 'Accounting', 'Marketing', 'IT', 'Finance']}
              value={formData.positionsOfInterest}
              onChange={(selected) => handleChange('positionsOfInterest', selected)}
              placeholder="Select one or more positions (e.g., HR, Accounting)"
              helperText="Select one or more positions (e.g., HR, Accounting)"
            />
          </div>

          {/* Preferred Location(s) */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Preferred Location(s)
            </label>
            <MultiSelectDropdown
              options={locations.length > 0 ? locations : ['Bangkok', 'Chiang Mai', 'Phuket']}
              value={formData.preferredLocations}
              onChange={(selected) => {
                if (selected.length <= 3) {
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
            <label className="block text-xs font-medium mb-2" style={{ color: '#0273B1' }}>
              Internship Period
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.internshipPeriod}
                onChange={(e) => handleChange('internshipPeriod', e.target.value)}
                placeholder="MM/DD/YYYY - MM/DD/YYYY"
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
