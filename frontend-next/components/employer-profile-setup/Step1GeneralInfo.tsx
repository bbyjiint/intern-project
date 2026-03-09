'use client'

import { useState, useEffect } from 'react'

interface Step1GeneralInfoProps {
  data: any
  onUpdate: (data: any) => void
}

export default function Step1GeneralInfo({ data, onUpdate }: Step1GeneralInfoProps) {
  const [formData, setFormData] = useState({
    companyName: data.companyName || '',
    companyDescription: data.companyDescription || '',
    businessType: data.businessType || '',
    companySize: data.companySize || '',
    companyLogo: data.companyLogo || data.logoURL || null,
  })

  // Sync formData when data prop changes (e.g., when profile data is loaded from API)
  useEffect(() => {
    setFormData({
      companyName: data.companyName || '',
      companyDescription: data.companyDescription || '',
      businessType: data.businessType || '',
      companySize: data.companySize || '',
      companyLogo: data.companyLogo || data.logoURL || null,
    })
  }, [data.companyName, data.companyDescription, data.businessType, data.companySize, data.companyLogo, data.logoURL])

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onUpdate(updated)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const updated = { ...formData, companyLogo: reader.result as string }
      setFormData(updated)
      onUpdate(updated)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <h2 className="mb-8 text-[22px] font-bold leading-none" style={{ color: '#23325B', fontWeight: 700 }}>
        Company Information
      </h2>

      <div className="space-y-[15px]">
        <div className="grid items-start gap-8 lg:grid-cols-[494px_minmax(0,1fr)] lg:gap-[40px]">
          <div className="max-w-[494px] space-y-[14px]">
            <div>
              <label className="mb-[6px] block text-[14px] font-semibold" style={{ color: '#253858' }}>
                Company Name<span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Company Name"
                className="h-[32px] w-full rounded-[5px] border border-[#CBD5E1] bg-white px-[14px] text-[12px] text-[#1E293B] outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE]"
              />
            </div>

            <div>
              <label className="mb-[6px] block text-[14px] font-semibold" style={{ color: '#253858' }}>
                Company Size<span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={formData.companySize}
                onChange={(e) => handleChange('companySize', e.target.value)}
                className="h-[32px] w-full rounded-[5px] border border-[#CBD5E1] bg-white px-[14px] text-[12px] text-[#64748B] outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE]"
              >
                <option value="">Select company size</option>
                <option value="less-than-10">Less than 10 people</option>
                <option value="10-50">10-50 people</option>
                <option value="51-200">51-200 people</option>
                <option value="201-500">201-500 people</option>
                <option value="501-1000">501-1000 people</option>
                <option value="more-than-1000">More than 1000 people</option>
              </select>
            </div>

            <div>
              <label className="mb-[6px] block text-[14px] font-semibold" style={{ color: '#253858' }}>
                Business Type<span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div className="flex flex-wrap gap-x-[30px] gap-y-2 pt-[1px]">
                <label className="flex cursor-pointer items-center gap-[10px] text-[13px]" style={{ color: '#6B7280' }}>
                  <input
                    type="radio"
                    name="businessType"
                    value="private"
                    checked={formData.businessType === 'private'}
                    onChange={(e) => handleChange('businessType', e.target.value)}
                    className="h-[13px] w-[13px]"
                    style={{ accentColor: '#0273B1' }}
                  />
                  <span>Private Company</span>
                </label>
                <label className="flex cursor-pointer items-center gap-[10px] text-[13px]" style={{ color: '#6B7280' }}>
                  <input
                    type="radio"
                    name="businessType"
                    value="state-owned"
                    checked={formData.businessType === 'state-owned'}
                    onChange={(e) => handleChange('businessType', e.target.value)}
                    className="h-[13px] w-[13px]"
                    style={{ accentColor: '#0273B1' }}
                  />
                  <span>State-owned enterprise</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-[6px] lg:justify-end">
            {formData.companyLogo ? (
              <div className="w-[170px]">
                <div className="overflow-hidden rounded-[4px] border border-[#E5E7EB] bg-[#F3F4F6]">
                  <img
                    src={formData.companyLogo}
                    alt="Company logo preview"
                    className="h-[170px] w-[170px] object-cover"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <label
                    className="cursor-pointer rounded-[8px] border border-[#0273B1] px-3 py-2 text-xs font-semibold text-[#0273B1] transition hover:bg-[#F0F4F8]"
                  >
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...formData, companyLogo: null }
                      setFormData(updated)
                      onUpdate(updated)
                    }}
                    className="rounded-[8px] border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#64748B] transition hover:bg-[#F8FAFC]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div
                  className="flex h-[170px] w-[170px] items-center justify-center rounded-[4px] border border-[#E5E7EB] text-center transition hover:bg-[#EDF2F7]"
                  style={{ backgroundColor: '#EFF2F4' }}
                >
                  <div className="flex items-center gap-[10px]">
                    <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#0273B1] text-[14px] text-white">
                      +
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: '#334155' }}>
                      Add Picture
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="pt-[4px]">
          <label className="mb-[6px] block text-[14px] font-semibold" style={{ color: '#253858' }}>
            Company Description<span style={{ color: '#EF4444' }}>*</span>
          </label>
          <p className="mb-[8px] text-[13px] leading-[1.4]" style={{ color: '#6B7280' }}>
            Provide a brief overview of your company, including industry, services, and key strengths.
          </p>
          <textarea
            value={formData.companyDescription}
            onChange={(e) => handleChange('companyDescription', e.target.value)}
            placeholder="Describe your company, industry focus, and core services"
            rows={6}
            maxLength={2000}
            className="min-h-[116px] w-full resize-none rounded-[5px] border border-[#CBD5E1] bg-white px-[14px] py-[10px] text-[12px] text-[#1E293B] outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE]"
          />
        </div>
      </div>
    </div>
  )
}
