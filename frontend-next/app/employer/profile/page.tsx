'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import EmployerSidebar from '@/components/EmployerSidebar'
import SearchableDropdown from '@/components/SearchableDropdown'
import CompanyInfoEditPopup from '@/components/CompanyInfoEditPopup'
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
  provinceId?: string
  districtId?: string
  subdistrictId?: string
  phoneNumber: string
  email: string
  websiteUrl: string
  contactName: string
  profileImage?: string
}

export default function EmployerProfilePage() {
  const router = useRouter()
  const [profileData, setProfileData] = useState<CompanyProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false)
  const [savingSection, setSavingSection] = useState<'address' | 'contact' | null>(null)

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

  const [contactForm, setContactForm] = useState({
    phoneNumber: '',
    email: '',
    websiteUrl: '',
    contactName: '',
  })

  const [provinces, setProvinces] = useState<Array<{ id: string; name: string; thname: string | null; code: string | null }>>([])
  const [districts, setDistricts] = useState<Array<{ id: string; name: string; thname: string | null; postalCode: string | null }>>([])
  const [subdistricts, setSubdistricts] = useState<Array<{ id: string; name: string; thname: string | null }>>([])
  const [provincesLoading, setProvincesLoading] = useState(false)
  const [districtsLoading, setDistrictsLoading] = useState(false)
  const [subdistrictsLoading, setSubdistrictsLoading] = useState(false)

  // ─── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const { user } = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')

        if (user.role === 'CANDIDATE') { router.push('/intern/profile'); return }
        if (!user.role) { router.push('/role-selection'); return }

        const data = await apiFetch<{ profile: CompanyProfileData }>('/api/companies/profile')
        if (data?.profile) {
          setProfileData(data.profile)
          localStorage.setItem('employerProfileData', JSON.stringify(data.profile))
        }
      } catch (err: any) {
        if (err.status === 403 && err.message?.includes('CANDIDATE role')) {
          router.push('/intern/profile'); return
        }
        if (err.status !== 404) {
          const saved = localStorage.getItem('employerProfileData')
          if (saved) { try { setProfileData(JSON.parse(saved)) } catch {} }
        }
      } finally {
        setIsLoading(false)
      }
    }

    init()
    setCurrentDate(formatDate(new Date()))

    const loadProvinces = async () => {
      setProvincesLoading(true)
      try {
        const res = await apiFetch<{ provinces: typeof provinces }>('/api/addresses/provinces')
        setProvinces(res.provinces || [])
      } finally {
        setProvincesLoading(false)
      }
    }
    loadProvinces()
  }, [router])

  // ─── Load districts when province changes ────────────────────────────────────
  useEffect(() => {
    if (!addressForm.provinceId) { setDistricts([]); setSubdistricts([]); return }
    const load = async () => {
      setDistrictsLoading(true)
      try {
        const res = await apiFetch<{ districts: typeof districts }>(`/api/addresses/districts?provinceId=${addressForm.provinceId}`)
        setDistricts(res.districts || [])
      } finally {
        setDistrictsLoading(false)
      }
    }
    load()
  }, [addressForm.provinceId])

  // ─── Load subdistricts when district changes ─────────────────────────────────
  useEffect(() => {
    if (!addressForm.districtId) { setSubdistricts([]); return }
    const load = async () => {
      setSubdistrictsLoading(true)
      try {
        const res = await apiFetch<{ subdistricts: typeof subdistricts }>(`/api/addresses/subdistricts?districtId=${addressForm.districtId}`)
        setSubdistricts(res.subdistricts || [])
      } finally {
        setSubdistrictsLoading(false)
      }
    }
    load()
  }, [addressForm.districtId])

  // ─── Auto-fill postcode when district selected ───────────────────────────────
  useEffect(() => {
    if (!addressForm.districtId || !districts.length) return
    const selected = districts.find((d) => d.id === addressForm.districtId)
    if (selected?.postalCode) {
      setAddressForm((prev) => ({ ...prev, postcode: selected.postalCode! }))
    }
  }, [addressForm.districtId, districts])

  // ─── Sync forms when profileData loads ───────────────────────────────────────
  useEffect(() => {
    if (!profileData) return
    setAddressForm({
      postcode: profileData.postcode || '',
      subDistrict: profileData.subDistrict || '',
      district: profileData.district || '',
      province: profileData.province || '',
      addressDetails: profileData.addressDetails || '',
      provinceId: profileData.provinceId || '',
      districtId: profileData.districtId || '',
      subdistrictId: profileData.subdistrictId || '',
    })
    setContactForm({
      phoneNumber: profileData.phoneNumber || '',
      email: profileData.email || '',
      websiteUrl: profileData.websiteUrl || '',
      contactName: profileData.contactName || '',
    })
  }, [profileData])

  // ─── Auto-save address when IDs change ───────────────────────────────────────
  useEffect(() => {
    if (!profileData || !addressForm.provinceId) return
    const isInitial =
      profileData.provinceId === addressForm.provinceId &&
      profileData.districtId === addressForm.districtId &&
      profileData.subdistrictId === addressForm.subdistrictId
    if (isInitial) return

    const timer = setTimeout(() => saveAddress(), 1000)
    return () => clearTimeout(timer)
  }, [addressForm.provinceId, addressForm.districtId, addressForm.subdistrictId])

  // ─── Auto-save postcode when changed ─────────────────────────────────────────
  useEffect(() => {
    if (!profileData || !addressForm.postcode) return
    const timer = setTimeout(() => saveAddress(), 1200)
    return () => clearTimeout(timer)
  }, [addressForm.postcode])

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const updateProfileCache = (updated: CompanyProfileData) => {
    setProfileData(updated)
    localStorage.setItem('employerProfileData', JSON.stringify(updated))
    window.dispatchEvent(new Event('profileImageUpdated'))
  }

  const saveAddress = async () => {
    if (!profileData) return
    const payload = { ...addressForm }
    try {
      await apiFetch('/api/companies/profile', { method: 'PUT', body: JSON.stringify(payload) })
      updateProfileCache({ ...profileData, ...payload })
    } catch (err) {
      console.error('Auto-save address failed:', err)
    }
  }

  const getBusinessTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      'private': 'Private Company',
      'state-owned': 'State-owned enterprise',
    }
    return map[type] || type
  }

  const getCompanySizeLabel = (size: string) => {
    const map: Record<string, string> = {
      'less-than-10': 'Less than 10 people',
      '10-50': '10-50 people',
      '51-200': '51-200 people',
      '201-500': '201-500 people',
      '501-1000': '501-1000 people',
      'more-than-1000': 'More than 1000 people',
    }
    return map[size] || size
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageUrl = reader.result as string
      updateProfileCache({ ...profileData!, profileImage: imageUrl })
      apiFetch('/api/companies/profile', {
        method: 'PUT',
        body: JSON.stringify({ profileImage: imageUrl }),
      }).catch(console.error)
    }
    reader.readAsDataURL(file)
  }

  const handleCompanyInfoSave = async () => {
    try {
      const data = await apiFetch<{ profile: CompanyProfileData }>('/api/companies/profile')
      if (data?.profile) updateProfileCache(data.profile)
    } catch (err) {
      console.error('Failed to reload profile:', err)
    }
  }

  const handleAddressSave = async () => {
    if (!profileData) return
    setSavingSection('address')
    setError(null)
    try {
      await apiFetch('/api/companies/profile', { method: 'PUT', body: JSON.stringify(addressForm) })
      updateProfileCache({ ...profileData, ...addressForm })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address')
    } finally {
      setSavingSection(null)
    }
  }

  const handleContactSave = async () => {
    if (!profileData) return
    setSavingSection('contact')
    setError(null)
    try {
      await apiFetch('/api/companies/profile', { method: 'PUT', body: JSON.stringify(contactForm) })
      updateProfileCache({ ...profileData, ...contactForm })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact')
    } finally {
      setSavingSection(null)
    }
  }

  // ─── Render states ────────────────────────────────────────────────────────────
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

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployerNavbar />
        <div className="layout-container layout-page">
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

  // ─── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <EmployerNavbar />
      <div className="flex min-h-[calc(100vh-100px)]">
        <EmployerSidebar activeItem="profile" />

        <div className="flex-1 bg-[#E6EBF4]">
          <div className="layout-container layout-page">

            {/* Welcome */}
            <div className="mb-[14px]">
              <h1 className="mb-2 text-[32px] font-bold leading-none tracking-[-0.02em] text-[#05060A]">
                Welcome, {profileData.companyName || 'Company Name'}
              </h1>
              <p className="text-[14px] text-[#6B7280]">{currentDate}</p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Company Info Card */}
            <div className="mb-6 rounded-[14px] bg-white px-[28px] py-[22px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-start gap-[18px]">
                {/* Logo */}
                <div
                  className="relative flex h-[94px] w-[94px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F3F4F7]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profileData.profileImage ? (
                    <img src={profileData.profileImage} alt="Profile" className="h-[70px] w-[70px] object-contain" />
                  ) : (
                    <div className="flex h-[70px] w-[70px] items-center justify-center rounded-md bg-[#0273B1]">
                      <span className="text-lg font-semibold text-white">
                        {profileData.companyName?.charAt(0).toUpperCase() || 'C'}
                      </span>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>

                {/* Info */}
                <div className="flex-1 pt-[16px]">
                  <div className="mb-[26px] flex items-start justify-between gap-4">
                    <div>
                      <h2 className="mb-1 text-[21px] font-bold leading-tight text-[#111827]">
                        {profileData.companyName || 'Company Name'}
                      </h2>
                      <p className="text-[14px] text-[#9CA3AF]">{profileData.email || 'info@company.com'}</p>
                    </div>
                    <button
                      onClick={() => setIsEditPopupOpen(true)}
                      className="rounded-[6px] border border-[#0273B1] px-[14px] py-[6px] text-[13px] font-medium text-[#0273B1] transition-colors hover:bg-[#F0F4F8]"
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

            {/* Address Card */}
            <div className="mb-6 rounded-[14px] bg-white px-[24px] py-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center text-[#2563EB]">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z" />
                  </svg>
                </span>
                <h2 className="text-[18px] font-bold text-[#1F2937]">Company Address</h2>
              </div>

              <div className="mx-auto max-w-[856px] space-y-[10px]">
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
                      options={provinces.map((p) => ({ value: p.id, label: p.thname ? `${p.name} (${p.thname})` : p.name }))}
                      value={addressForm.provinceId}
                      onChange={(value) => {
                        const selected = provinces.find((p) => p.id === value)
                        setAddressForm((prev) => ({
                          ...prev,
                          provinceId: value,
                          province: selected?.name || '',
                          districtId: '', district: '',
                          subdistrictId: '', subDistrict: '',
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
                      options={districts.map((d) => ({ value: d.id, label: d.thname ? `${d.name} (${d.thname})` : d.name }))}
                      value={addressForm.districtId}
                      onChange={(value) => {
                        const selected = districts.find((d) => d.id === value)
                        setAddressForm((prev) => ({
                          ...prev,
                          districtId: value,
                          district: selected?.name || '',
                          postcode: selected?.postalCode || prev.postcode,
                          subdistrictId: '', subDistrict: '',
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
                      options={subdistricts.map((s) => ({ value: s.id, label: s.thname ? `${s.name} (${s.thname})` : s.name }))}
                      value={addressForm.subdistrictId}
                      onChange={(value) => {
                        const selected = subdistricts.find((s) => s.id === value)
                        setAddressForm((prev) => ({ ...prev, subdistrictId: value, subDistrict: selected?.name || '' }))
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
                    <p className="mt-1 text-xs text-[#6B7280]">Postal code is automatically filled based on the selected district</p>
                  )}
                </div>

                <div className="flex justify-end pt-[6px]">
                  <button
                    onClick={handleAddressSave}
                    disabled={savingSection === 'address'}
                    className="rounded-[6px] bg-[#2563EB] px-[18px] py-[7px] text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
                  >
                    {savingSection === 'address' ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="rounded-[14px] bg-white px-[24px] py-[20px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center text-[#2563EB]">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.897 1.368l.62 1.86a2 2 0 01-.45 2.046l-1.27 1.27a16 16 0 006.656 6.656l1.27-1.27a2 2 0 012.046-.45l1.86.62A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <h2 className="text-[18px] font-bold text-[#1F2937]">Contact Information</h2>
              </div>

              <div className="mx-auto max-w-[856px] space-y-[10px]">
                <div>
                  <label className="mb-[6px] block text-[14px] text-[#4B5563]">Phone Number</label>
                  <div className="flex gap-[10px]">
                    <select className="h-[38px] w-[64px] rounded-[6px] border border-[#D1D5DB] bg-white px-3 text-[14px] text-[#374151] outline-none">
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
                    className="rounded-[6px] bg-[#2563EB] px-[18px] py-[7px] text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
                  >
                    {savingSection === 'contact' ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {profileData && (
        <CompanyInfoEditPopup
          isOpen={isEditPopupOpen}
          onClose={() => setIsEditPopupOpen(false)}
          onSave={handleCompanyInfoSave}
          initialData={{
            companyName: profileData.companyName || '',
            companyDescription: profileData.companyDescription || '',
            businessType: profileData.businessType || '',
            companySize: profileData.companySize || '',
            profileImage: profileData.profileImage,
          }}
        />
      )}
    </div>
  )
}