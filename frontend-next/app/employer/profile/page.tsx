'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EmployerNavbar from '@/components/EmployerNavbar'
import { apiFetch } from '@/lib/api'

interface CompanyProfileData {
  companyName: string
  companyDescription: string
  businessType: string
  companySize: string
  addressDetails: string
  subDistrict: string
  district: string
  province: string
  postcode: string
  phoneNumber: string
  email: string
  websiteUrl: string
  contactName: string
  profileImage?: string
  professionalSummary?: string
  education?: Array<{
    id: string
    university: string
    degree: string
    gpa?: string
    startDate: string
    endDate: string
    coursework?: string[]
    achievements?: string[]
  }>
  experience?: Array<{
    id: string
    title: string
    company: string
    department?: string
    startDate: string
    endDate: string
    manager?: string
  }>
}

export default function EmployerProfilePage() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<CompanyProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check user role first, then fetch profile data
    const checkRoleAndLoadProfile = async () => {
      try {
        // Check user role
        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        
        // If user has CANDIDATE role, redirect to intern profile
        if (userData.user.role === 'CANDIDATE') {
          router.push('/intern/profile')
          return
        }
        
        // If user has no role, redirect to role selection
        if (!userData.user.role) {
          router.push('/role-selection')
          return
        }

        // User has COMPANY role, proceed to load company profile
        const data = await apiFetch<{ profile: CompanyProfileData }>('/api/companies/profile')
        console.log('Profile data received:', data)
        
        // Ensure profile data exists and has at least companyName
        if (data && data.profile) {
          setProfileData(data.profile)
          // Also save to localStorage for backward compatibility
          localStorage.setItem('employerProfileData', JSON.stringify(data.profile))
        } else {
          console.warn('Profile data is missing or invalid:', data)
          setProfileData(null)
        }
        setIsLoading(false)
      } catch (error: any) {
        console.error('Failed to load profile data:', error)
        console.error('Error status:', error.status)
        console.error('Error message:', error.message)
        
        // If 403 Forbidden, it's a role mismatch - redirect based on error message
        if (error.status === 403) {
          const errorMessage = error.message || ''
          if (errorMessage.includes('CANDIDATE role')) {
            router.push('/intern/profile')
            return
          }
        }
        
        // If 404, profile doesn't exist yet - that's okay
        if (error.status === 404) {
          console.log('Profile not found (404)')
          setProfileData(null)
        } else {
          // Fallback to localStorage if API fails
          const savedData = localStorage.getItem('employerProfileData')
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData)
              console.log('Using localStorage fallback:', parsed)
              setProfileData(parsed)
            } catch (e) {
              console.error('Failed to parse profile data:', e)
              setProfileData(null)
            }
          } else {
            setProfileData(null)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    checkRoleAndLoadProfile()
    // Set current date from calendar
    updateDate()
  }, [router])

  const updateDate = () => {
    const now = new Date()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    const dayName = days[now.getDay()]
    const day = now.getDate()
    const month = months[now.getMonth()]
    const year = now.getFullYear()
    
    setCurrentDate(`${dayName}, ${day} ${month} ${year}`)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        const updatedData = { ...profileData!, profileImage: imageUrl }
        setProfileData(updatedData)
        localStorage.setItem('employerProfileData', JSON.stringify(updatedData))
        
        // Dispatch custom event to update navbar
        window.dispatchEvent(new Event('profileImageUpdated'))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const selectedDate = new Date(e.target.value)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      
      const dayName = days[selectedDate.getDay()]
      const day = selectedDate.getDate()
      const month = months[selectedDate.getMonth()]
      const year = selectedDate.getFullYear()
      
      setCurrentDate(`${dayName}, ${day} ${month} ${year}`)
    }
  }

  const getBusinessTypeLabel = (type: string) => {
    switch (type) {
      case 'private':
        return 'Private Company'
      case 'state-owned':
        return 'State-owned enterprise'
      default:
        return type
    }
  }

  const getCompanySizeLabel = (size: string) => {
    switch (size) {
      case 'less-than-10':
        return 'Less than 10 people'
      case '10-50':
        return '10-50 people'
      case '51-200':
        return '51-200 people'
      case '201-500':
        return '201-500 people'
      case '501-1000':
        return '501-1000 people'
      case 'more-than-1000':
        return 'More than 1000 people'
      default:
        return size
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'C'
    // Get first letter of company name
    return name.charAt(0).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployerNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show "no profile" only if we're not loading and profileData is explicitly null (404)
  // If profileData exists but has empty fields, still show the profile page
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployerNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-10">
            <p className="text-gray-600">No profile data found. Please complete your profile setup.</p>
            <button
              onClick={() => router.push('/employer/profile-setup')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Profile Setup
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white min-h-screen pt-8 border-r border-gray-200">
          <div className="px-6 space-y-2">
            <Link
              href="/employer/profile"
              className="px-4 py-3 rounded-lg flex items-center space-x-3"
              style={{ backgroundColor: '#0273B1' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-white">Profile</span>
            </Link>
            <Link
              href="/employer/dashboard"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
              style={{ color: '#1C2D4F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F4F8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">Applicants</span>
            </Link>
            <Link
              href="/employer/job-post"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
              style={{ color: '#1C2D4F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0273B1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#1C2D4F'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Job Post</span>
            </Link>
            <Link
              href="/employer/bookmark"
              className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors"
              style={{ color: '#1C2D4F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F4F8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="font-medium">Bookmark</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1" style={{ background: 'linear-gradient(to bottom, #E3F2FD 0%, #FFFFFF 300px)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#1C2D4F' }}>
                Welcome, {profileData?.companyName || 'Company Name'}
              </h1>
              <p className="text-sm text-gray-500">{currentDate}</p>
            </div>

            {/* Profile Image Card - Large card with profile image */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {profileData?.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-24 h-24 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#0273B1' }}
                      >
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {profileData?.companyName || 'Company Name'}
                    </h2>
                    <p className="text-gray-600 mb-3">
                      {profileData?.email || 'email@company.com'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/employer/profile-setup?step=1')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #0273B1',
                    color: '#0273B1'
                  }}
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Company Description Card */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
                  Company Description
                </h2>
                <button 
                  onClick={() => router.push('/employer/profile-setup?step=1')}
                  className="px-4 py-2 border-2 rounded-lg font-medium text-sm transition-colors" 
                  style={{ borderColor: '#0273B1', color: '#0273B1' }}
                >
                  Edit
                </button>
              </div>
              <p className="text-gray-700">
                {profileData.companyDescription || 'No description provided.'}
              </p>
            </div>

            {/* Company Information Card */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
                  Company Information
                </h2>
                <button 
                  onClick={() => router.push('/employer/profile-setup?step=1')}
                  className="px-4 py-2 border-2 rounded-lg font-medium text-sm transition-colors" 
                  style={{ borderColor: '#0273B1', color: '#0273B1' }}
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2">
                {profileData.businessType ? (
                  <p className="text-gray-700">
                    <span className="font-medium">Business Type:</span> {getBusinessTypeLabel(profileData.businessType)}
                  </p>
                ) : (
                  <p className="text-gray-500">No data provided.</p>
                )}
                {profileData.companySize && (
                  <p className="text-gray-700">
                    <span className="font-medium">Company Size:</span> {getCompanySizeLabel(profileData.companySize)}
                  </p>
                )}
              </div>
            </div>

            {/* Company Address Card */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
                  Company Address
                </h2>
                <button 
                  onClick={() => router.push('/employer/profile-setup?step=2')}
                  className="px-4 py-2 border-2 rounded-lg font-medium text-sm transition-colors" 
                  style={{ borderColor: '#0273B1', color: '#0273B1' }}
                >
                  Edit
                </button>
              </div>
              {profileData.addressDetails || profileData.subDistrict || profileData.district || profileData.province || profileData.postcode ? (
                <div className="space-y-2">
                  {profileData.addressDetails && (
                    <p className="text-gray-700">{profileData.addressDetails}</p>
                  )}
                  {[profileData.subDistrict, profileData.district, profileData.province, profileData.postcode].filter(Boolean).length > 0 && (
                    <p className="text-gray-700">
                      {[profileData.subDistrict, profileData.district, profileData.province, profileData.postcode].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No data provided.</p>
              )}
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
                  Contact Information
                </h2>
                <button 
                  onClick={() => router.push('/employer/profile-setup?step=3')}
                  className="px-4 py-2 border-2 rounded-lg font-medium text-sm transition-colors" 
                  style={{ borderColor: '#0273B1', color: '#0273B1' }}
                >
                  Edit
                </button>
              </div>
              {profileData.phoneNumber || profileData.email || profileData.websiteUrl || profileData.contactName ? (
                <div className="space-y-2">
                  {profileData.phoneNumber && (
                    <p className="text-gray-700">
                      <span className="font-medium">Phone:</span> {profileData.phoneNumber}
                    </p>
                  )}
                  {profileData.email && (
                    <p className="text-gray-700">
                      <span className="font-medium">Email:</span> {profileData.email}
                    </p>
                  )}
                  {profileData.websiteUrl && (
                    <p className="text-gray-700">
                      <span className="font-medium">Website:</span>{' '}
                      <a href={profileData.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profileData.websiteUrl}
                      </a>
                    </p>
                  )}
                  {profileData.contactName && (
                    <p className="text-gray-700">
                      <span className="font-medium">Contact Name:</span> {profileData.contactName}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No data provided.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
