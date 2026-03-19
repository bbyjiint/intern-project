'use client'

import SearchableDropdown from '@/components/SearchableDropdown'

export type ViewTab = 'all' | 'new' | 'job-match' | 'accepted' | 'declined'

const ACADEMIC_YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'job-match', label: 'Job Match' },
  { key: 'accepted', label: 'Accept' },
  { key: 'declined', label: 'Decline' },
] as const

interface University {
  id: string
  name: string
  thname: string | null
  code: string | null
}

interface ApplicantFiltersProps {
  // filter values
  searchQuery: string
  positionFilter: string
  academicYearFilter: string
  institutionFilter: string
  durationFilter: string
  internshipStartFilter: string
  internshipEndFilter: string
  activeTab: ViewTab
  // options
  positionOptions: string[]
  universities: University[]
  universitiesLoading: boolean
  totalCount: number
  // callbacks
  onSearchChange: (v: string) => void
  onPositionChange: (v: string) => void
  onAcademicYearChange: (v: string) => void
  onInstitutionChange: (v: string) => void
  onDurationChange: (v: string) => void
  onInternshipStartChange: (v: string) => void
  onInternshipEndChange: (v: string) => void
  onTabChange: (tab: ViewTab) => void
  onClearFilters: () => void
}

export default function ApplicantFilters({
  searchQuery, positionFilter, academicYearFilter, institutionFilter,
  durationFilter, internshipStartFilter, internshipEndFilter, activeTab,
  positionOptions, universities, universitiesLoading, totalCount,
  onSearchChange, onPositionChange, onAcademicYearChange, onInstitutionChange,
  onDurationChange, onInternshipStartChange, onInternshipEndChange,
  onTabChange, onClearFilters,
}: ApplicantFiltersProps) {
  return (
    <>
      {/* Filter Card */}
      <div className="mb-[16px] rounded-[16px] bg-white px-6 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition-colors dark:bg-[#070e12] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] dark:ring-1 dark:ring-[#d1d5db]">
        {/* Row 1: Search | Position | Academic Year */}
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">Search</label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-[#9CA3AF] dark:text-[#686868]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search"
                className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white pl-9 pr-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-[#ececec] dark:bg-[#1e1e1e] dark:text-[#e5e7eb] dark:placeholder:text-[#7f7f7f]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">Position</label>
            <div className="relative">
              <select
                value={positionFilter}
                onChange={(e) => onPositionChange(e.target.value)}
                className="h-[42px] w-full appearance-none rounded-[8px] border border-[#D1D5DB] bg-white px-3 pr-9 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] dark:border-[#ececec] dark:bg-[#1e1e1e] dark:text-[#e5e7eb]"
              >
                <option value="">Position</option>
                {positionOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-[#6B7280] dark:text-[#686868]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">Academic Year</label>
            <div className="relative">
              <select
                value={academicYearFilter}
                onChange={(e) => onAcademicYearChange(e.target.value)}
                className="h-[42px] w-full appearance-none rounded-[8px] border border-[#D1D5DB] bg-white px-3 pr-9 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] dark:border-[#ececec] dark:bg-[#1e1e1e] dark:text-[#e5e7eb]"
              >
                <option value="">Year</option>
                {ACADEMIC_YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-[#6B7280] dark:text-[#686868]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Internship Period | Duration | Institution */}
        <div className="mb-4 grid grid-cols-[1fr_16px_1fr_1fr_2fr] items-end gap-3">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">Internship Period</label>
            <input
              type="date"
              value={internshipStartFilter}
              onChange={(e) => onInternshipStartChange(e.target.value)}
              className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] [color-scheme:light] dark:border-[#ececec] dark:bg-[#1e1e1e] dark:text-[#e5e7eb] dark:[color-scheme:dark]"
            />
          </div>
          <div className="flex items-center justify-center pb-[2px] text-[16px] text-[#9CA3AF] dark:text-[#757575]">–</div>
          <div>
            <label className="invisible mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">End</label>
            <input
              type="date"
              value={internshipEndFilter}
              onChange={(e) => onInternshipEndChange(e.target.value)}
              className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:border-[#94A3B8] [color-scheme:light] dark:border-[#ececec] dark:bg-[#1e1e1e] dark:text-[#e5e7eb] dark:[color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">Duration</label>
            <input
              type="text"
              value={durationFilter}
              onChange={(e) => onDurationChange(e.target.value)}
              placeholder="Duration (Month)"
              className="h-[42px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-[#ececec] dark:bg-[#1e1e1e] dark:text-[#e5e7eb] dark:placeholder:text-[#7f7f7f]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#374151] dark:text-[#e5e7eb]">Institution</label>
            {universitiesLoading ? (
              <div className="flex h-[42px] w-full items-center rounded-[8px] border border-[#D1D5DB] bg-gray-50 px-3 dark:border-[#ececec] dark:bg-[#1e1e1e]">
                <span className="text-[13px] text-[#9CA3AF] dark:text-[#7f7f7f]">Loading...</span>
              </div>
            ) : (
              <SearchableDropdown
                options={universities.map((uni) => ({
                  value: uni.name,
                  label: uni.thname ? `${uni.name} (${uni.thname})` : uni.name,
                  code: uni.code,
                }))}
                value={institutionFilter}
                onChange={onInstitutionChange}
                placeholder="Select Institution Name"
                className="w-full"
                allOptionLabel="All Universities"
                variant="applicants"
              />
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClearFilters}
            className="h-[38px] rounded-[8px] border border-[#D1D5DB] bg-white px-5 text-[13px] font-medium text-[#374151] transition hover:bg-[#F9FAFB] dark:border-[#ECE8E1] dark:bg-[#070e12] dark:text-[#e5e7eb] dark:hover:bg-[#323232]"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-[12px] flex flex-wrap gap-[8px]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`min-w-[85px] rounded-[6px] border px-[18px] py-[8px] text-[12px] font-semibold transition ${
              activeTab === tab.key
                ? 'border-[#2563EB] bg-white text-[#2563EB] dark:bg-[#fefefe] dark:text-[#a6a19a]'
                : 'border-[#CBD5E1] bg-white text-[#374151] hover:bg-[#F8FAFC] dark:border-[#d1d5db] dark:bg-[#070e12] dark:text-[#e5e7eb] dark:hover:bg-[#323232]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="mb-[16px] text-[14px] font-semibold text-[#1F2937] dark:text-[#ffffff]">
        {totalCount} Total Candidate{totalCount === 1 ? '' : 's'}
      </p>
    </>
  )
}