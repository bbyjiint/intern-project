'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import EmployerSidebar from '@/components/EmployerSidebar'
import SearchableDropdown from '@/components/SearchableDropdown'
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
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [addressForm, setAddressForm] = useState({
    postcode: '',
    subDistrict: '',
    district: '',
    province: '',
    addressDetails: '',
    provinceId: '',
    districtId: '',
    subdistrictId: '',
  })
  const [provinces, setProvinces] = useState<Array<{ id: string; name: string; thname: string | null; code: string | null }>>([])
  const [districts, setDistricts] = useState<Array<{ id: string; name: string; thname: string | null; postalCode: string | null }>>([])
  const [subdistricts, setSubdistricts] = useState<Array<{ id: string; name: string; thname: string | null }>>([])
  const [provincesLoading, setProvincesLoading] = useState(false)
  const [districtsLoading, setDistrictsLoading] = useState(false)
  const [subdistrictsLoading, setSubdistrictsLoading] = useState(false)
  const [contactForm, setContactForm] = useState({
    phoneNumber: '',
    email: '',
    websiteUrl: '',
    contactName: '',
  })
  const [savingSection, setSavingSection] = useState<'address' | 'contact' | null>(null)

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
    
    // Load provinces on mount
    const loadProvinces = async () => {
      setProvincesLoading(true)
      try {
        const response = await apiFetch<{ provinces: Array<{ id: string; name: string; thname: string | null; code: string | null }> }>('/api/addresses/provinces')
        setProvinces(response.provinces || [])
      } catch (err) {
        console.error('Failed to load provinces:', err)
        setProvinces([])
      } finally {
        setProvincesLoading(false)
      }
    }
    loadProvinces()
  }, [router])
  
  // Load districts when province is selected
  useEffect(() => {
    if (addressForm.provinceId) {
      const loadDistricts = async () => {
        setDistrictsLoading(true)
        try {
          const response = await apiFetch<{ districts: Array<{ id: string; name: string; thname: string | null; postalCode: string | null }> }>(
            `/api/addresses/districts?provinceId=${addressForm.provinceId}`
          )
          setDistricts(response.districts || [])
        } catch (err) {
          console.error('Failed to load districts:', err)
          setDistricts([])
        } finally {
          setDistrictsLoading(false)
        }
      }
      loadDistricts()
    } else {
      setDistricts([])
      setSubdistricts([])
    }
  }, [addressForm.provinceId])
  
  // Load subdistricts when district is selected
  useEffect(() => {
    if (addressForm.districtId) {
      const loadSubdistricts = async () => {
        setSubdistrictsLoading(true)
        try {
          const response = await apiFetch<{ subdistricts: Array<{ id: string; name: string; thname: string | null }> }>(
            `/api/addresses/subdistricts?districtId=${addressForm.districtId}`
          )
          setSubdistricts(response.subdistricts || [])
        } catch (err) {
          console.error('Failed to load subdistricts:', err)
          setSubdistricts([])
        } finally {
          setSubdistrictsLoading(false)
        }
      }
      loadSubdistricts()
    } else {
      setSubdistricts([])
    }
  }, [addressForm.districtId])
  
  // Auto-fill postal code when district is selected
  useEffect(() => {
    if (addressForm.districtId && districts.length > 0) {
      const selectedDistrict = districts.find((d) => d.id === addressForm.districtId)
      if (selectedDistrict?.postalCode) {
        setAddressForm((prev) => ({ ...prev, postcode: selectedDistrict.postalCode || prev.postcode }))
      }
    }
  }, [addressForm.districtId, districts])

  useEffect(() => {
    if (!profileData) return

    setAddressForm({
      postcode: profileData.postcode || '',
      subDistrict: profileData.subDistrict || '',
      district: profileData.district || '',
      province: profileData.province || '',
      addressDetails: profileData.addressDetails || '',
      provinceId: (profileData as any).provinceId || '',
      districtId: (profileData as any).districtId || '',
      subdistrictId: (profileData as any).subdistrictId || '',
    })

    setContactForm({
      phoneNumber: profileData.phoneNumber || '',
      email: profileData.email || '',
      websiteUrl: profileData.websiteUrl || '',
      contactName: profileData.contactName || '',
    })
  }, [profileData])

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
        ;(async () => {
          try {
            await apiFetch('/api/companies/profile', {
              method: 'PUT',
              body: JSON.stringify({ profileImage: imageUrl }),
            })
          } catch (error) {
            console.error('Failed to save profile image:', error)
          }
        })()
      }
      reader.readAsDataURL(file)
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

  const goToStep = (step: number) => {
    router.push(`/employer/profile-setup?step=${step}`)
  }

  const updateProfileCache = (updatedProfile: CompanyProfileData) => {
    setProfileData(updatedProfile)
    localStorage.setItem('employerProfileData', JSON.stringify(updatedProfile))
    window.dispatchEvent(new Event('profileImageUpdated'))
  }

  const handleAddressSave = async () => {
    if (!profileData) return

    setSavingSection('address')
    setError(null)

    try {
      const payload = {
        postcode: addressForm.postcode,
        subDistrict: addressForm.subDistrict,
        district: addressForm.district,
        province: addressForm.province,
        addressDetails: addressForm.addressDetails,
        provinceId: addressForm.provinceId,
        districtId: addressForm.districtId,
        subdistrictId: addressForm.subdistrictId,
      }

      await apiFetch('/api/companies/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

      updateProfileCache({ ...profileData, ...payload })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address information')
    } finally {
      setSavingSection(null)
    }
  }

  const handleContactSave = async () => {
    if (!profileData) return

    setSavingSection('contact')
    setError(null)

    try {
      const payload = {
        phoneNumber: contactForm.phoneNumber,
        email: contactForm.email,
        websiteUrl: contactForm.websiteUrl,
        contactName: contactForm.contactName,
      }

      await apiFetch('/api/companies/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

      updateProfileCache({ ...profileData, ...payload })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact information')
    } finally {
      setSavingSection(null)
    }
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
    <div className="min-h-screen bg-[#F6F7FB]">
      <EmployerNavbar />
      <div className="flex min-h-[calc(100vh-100px)]">
        <EmployerSidebar activeItem="profile" />

        {/* Main Content */}
        <div className="flex-1 bg-[#E6EBF4]">
          <div className="mx-auto max-w-[1120px] px-[46px] py-[34px]">
            {/* Welcome Section */}
            <div className="mb-[14px]">
              <h1 className="mb-2 text-[32px] font-bold leading-none tracking-[-0.02em]" style={{ color: '#05060A' }}>
                Welcome, {profileData?.companyName || 'Company Name'}
              </h1>
              <p className="text-[14px]" style={{ color: '#6B7280' }}>{currentDate}</p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mb-6 rounded-[14px] bg-white px-[28px] py-[22px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-start gap-[18px]">
                  <div
                    className="relative flex h-[94px] w-[94px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F3F4F7]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profileData?.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt="Profile"
                        className="h-[70px] w-[70px] object-contain"
                      />
                    ) : (
                      <div 
                        className="flex h-[70px] w-[70px] items-center justify-center rounded-md"
                        style={{ backgroundColor: '#0273B1' }}
                      >
                        <span className="text-lg font-semibold text-white">
                          {profileData.companyName?.slice(0, 1).toUpperCase() || 'C'}
                        </span>
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

                  <div className="flex-1 pt-[16px]">
                    <div className="mb-[26px] flex items-start justify-between gap-4">
                      <div>
                        <h2 className="mb-1 text-[21px] font-bold leading-tight text-[#111827]">
                          {profileData?.companyName || 'Company Name'}
                        </h2>
                        <p className="text-[14px] text-[#9CA3AF]">
                          {profileData?.email || 'info@company.com'}
                        </p>
                      </div>

                      <button
                        onClick={() => goToStep(1)}
                        className="rounded-[6px] border px-[14px] py-[6px] text-[13px] font-medium text-[#0273B1] transition-colors hover:bg-[#F0F4F8]"
                        style={{ borderColor: '#0273B1' }}
                      >
                        Edit
                      </button>
                    </div>

                    <p className="mb-[16px] max-w-[880px] text-[13px] leading-[1.55] text-[#4B5563]">
                      {profileData.companyDescription || '-'}
                    </p>

                    <div className="grid max-w-[680px] grid-cols-2 gap-10">
                      <div>
                        <h3 className="mb-[8px] text-[17px] font-bold text-[#111827]">Business Type</h3>
                        <p className="text-[14px] text-[#4B5563]">
                          {profileData.businessType ? getBusinessTypeLabel(profileData.businessType) : '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="mb-[8px] text-[17px] font-bold text-[#111827]">Company Size</h3>
                        <p className="text-[14px] text-[#4B5563]">
                          {profileData.companySize ? getCompanySizeLabel(profileData.companySize) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-[14px] bg-white px-[24px] py-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-[#2563EB]">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
                  </svg>
                </span>
                <h2 className="text-[18px] font-bold text-[#1F2937]">Company Address</h2>
              </div>

              <div className="mx-auto max-w-[856px]">
                <div className="space-y-[10px]">
                  {/* Address Details */}
                  <div>
                    <label className="mb-[6px] block text-[14px] text-[#4B5563]">Address Details</label>
                    <textarea
                      value={addressForm.addressDetails}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, addressDetails: e.target.value }))}
                      rows={4}
                      className="min-h-[110px] w-full resize-none rounded-[6px] border border-[#D1D5DB] px-3 py-3 text-[14px] text-[#374151] outline-none focus:border-[#94A3B8]"
                      placeholder="Enter address details (e.g., building number, street)"
                    />
                  </div>

                  {/* Province */}
                  <div>
                    <label className="mb-[6px] block text-[14px] text-[#4B5563]">Province</label>
                    {provincesLoading ? (
                      <div className="h-[38px] w-full rounded-[6px] border border-[#D1D5DB] bg-gray-50 flex items-center justify-center">
                        <span className="text-[14px] text-[#6B7280]">Loading provinces...</span>
                      </div>
                    ) : (
                      <SearchableDropdown
                        options={provinces.map((prov) => ({
                          value: prov.id,
                          label: prov.thname ? `${prov.name} (${prov.thname})` : prov.name,
                        }))}
                        value={addressForm.provinceId}
                        onChange={(value) => {
                          const selectedProvince = provinces.find((p) => p.id === value)
                          setAddressForm((prev) => ({
                            ...prev,
                            provinceId: value,
                            province: selectedProvince?.name || '',
                            districtId: '',
                            district: '',
                            subdistrictId: '',
                            subDistrict: '',
                            postcode: '',
                          }))
                        }}
                        placeholder="Search by name..."
                        className="w-full"
                        allOptionLabel="Select Province"
                      />
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label className="mb-[6px] block text-[14px] text-[#4B5563]">District</label>
                    {!addressForm.provinceId ? (
                      <div className="h-[38px] w-full rounded-[6px] border border-[#D1D5DB] bg-gray-100 flex items-center justify-center">
                        <span className="text-[14px] text-[#6B7280]">Please select a province first</span>
                      </div>
                    ) : districtsLoading ? (
                      <div className="h-[38px] w-full rounded-[6px] border border-[#D1D5DB] bg-gray-50 flex items-center justify-center">
                        <span className="text-[14px] text-[#6B7280]">Loading districts...</span>
                      </div>
                    ) : (
                      <SearchableDropdown
                        options={districts.map((dist) => ({
                          value: dist.id,
                          label: dist.thname ? `${dist.name} (${dist.thname})` : dist.name,
                        }))}
                        value={addressForm.districtId}
                        onChange={(value) => {
                          const selectedDistrict = districts.find((d) => d.id === value)
                          setAddressForm((prev) => ({
                            ...prev,
                            districtId: value,
                            district: selectedDistrict?.name || '',
                            postcode: selectedDistrict?.postalCode || prev.postcode,
                            subdistrictId: '',
                            subDistrict: '',
                          }))
                        }}
                        placeholder="Search by name..."
                        className="w-full"
                        allOptionLabel="Select District"
                      />
                    )}
                  </div>

                  {/* Subdistrict */}
                  <div>
                    <label className="mb-[6px] block text-[14px] text-[#4B5563]">Subdistrict</label>
                    {!addressForm.districtId ? (
                      <div className="h-[38px] w-full rounded-[6px] border border-[#D1D5DB] bg-gray-100 flex items-center justify-center">
                        <span className="text-[14px] text-[#6B7280]">Please select a district first</span>
                      </div>
                    ) : subdistrictsLoading ? (
                      <div className="h-[38px] w-full rounded-[6px] border border-[#D1D5DB] bg-gray-50 flex items-center justify-center">
                        <span className="text-[14px] text-[#6B7280]">Loading subdistricts...</span>
                      </div>
                    ) : (
                      <SearchableDropdown
                        options={subdistricts.map((sub) => ({
                          value: sub.id,
                          label: sub.thname ? `${sub.name} (${sub.thname})` : sub.name,
                        }))}
                        value={addressForm.subdistrictId}
                        onChange={(value) => {
                          const selectedSubdistrict = subdistricts.find((s) => s.id === value)
                          setAddressForm((prev) => ({
                            ...prev,
                            subdistrictId: value,
                            subDistrict: selectedSubdistrict?.name || '',
                          }))
                        }}
                        placeholder="Search by name..."
                        className="w-full"
                        allOptionLabel="Select Subdistrict"
                      />
                    )}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="mb-[6px] block text-[14px] text-[#4B5563]">Postal Code</label>
                    <input
                      type="text"
                      value={addressForm.postcode}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, postcode: e.target.value }))}
                      className="h-[38px] w-full rounded-[6px] border border-[#D1D5DB] px-3 text-[14px] text-[#374151] outline-none focus:border-[#94A3B8] bg-gray-50"
                      placeholder="Auto-filled when district is selected"
                      readOnly={!!(addressForm.provinceId && addressForm.districtId && addressForm.subdistrictId)}
                    />
                    {addressForm.provinceId && addressForm.districtId && addressForm.subdistrictId && (
                      <p className="mt-1 text-xs text-[#6B7280]">
                        Postal code is automatically filled based on the selected district
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-[6px] block text-[14px] text-[#4B5563]">Address</label>
                    <textarea
                      value={addressForm.addressDetails}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, addressDetails: e.target.value }))}
                      rows={4}
                      className="min-h-[110px] w-full resize-none rounded-[6px] border border-[#D1D5DB] px-3 py-3 text-[14px] text-[#374151] outline-none focus:border-[#94A3B8]"
                    />
                  </div>

                  <div className="flex justify-end pt-[6px]">
                    <button
                      onClick={handleAddressSave}
                      disabled={savingSection === 'address'}
                      className="rounded-[6px] bg-[#2563EB] px-[18px] py-[7px] text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
                    >
                      {savingSection === 'address' ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[14px] bg-white px-[24px] py-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-[#2563EB]">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.897 1.368l.62 1.86a2 2 0 01-.45 2.046l-1.27 1.27a16 16 0 006.656 6.656l1.27-1.27a2 2 0 012.046-.45l1.86.62A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <h2 className="text-[18px] font-bold text-[#1F2937]">Contact Information</h2>
              </div>

              <div className="mx-auto max-w-[856px]">
                <div className="space-y-[10px]">
                  <div>
                    <label className="mb-[6px] block text-[14px] text-[#4B5563]">Phone Number</label>
                    <div className="flex gap-[10px]">
                      <select
                        value="+66"
                        onChange={() => undefined}
                        className="h-[38px] w-[64px] rounded-[6px] border border-[#D1D5DB] bg-white px-3 text-[14px] text-[#374151] outline-none"
                      >
                        <option value="+66">+66</option>
                      </select>
                      <input
                        type="text"
                        value={contactForm.phoneNumber}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                        className="h-[38px] flex-1 rounded-[6px] border border-[#D1D5DB] px-3 text-[14px] text-[#374151] outline-none focus:border-[#94A3B8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-[6px] block text-[14px] text-[#4B5563]">Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="h-[38px] w-full rounded-[6px] border border-[#D1D5DB] px-3 text-[14px] text-[#374151] outline-none focus:border-[#94A3B8]"
                    />
                  </div>

                  <div>
                    <label className="mb-[6px] block text-[14px] text-[#4B5563]">Website URL</label>
                    <input
                      type="text"
                      value={contactForm.websiteUrl}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                      className="h-[38px] w-full rounded-[6px] border border-[#D1D5DB] px-3 text-[14px] text-[#374151] outline-none focus:border-[#94A3B8]"
                    />
                  </div>

                  <div>
                    <label className="mb-[6px] block text-[14px] text-[#4B5563]">Contact Name</label>
                    <input
                      type="text"
                      value={contactForm.contactName}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, contactName: e.target.value }))}
                      className="h-[38px] w-full rounded-[6px] border border-[#D1D5DB] px-3 text-[14px] text-[#374151] outline-none focus:border-[#94A3B8]"
                    />
                  </div>

                  <div className="flex justify-end pt-[6px]">
                    <button
                      onClick={handleContactSave}
                      disabled={savingSection === 'contact'}
                      className="rounded-[6px] bg-[#2563EB] px-[18px] py-[7px] text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8]"
                    >
                      {savingSection === 'contact' ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
