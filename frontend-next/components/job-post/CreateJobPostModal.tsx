'use client'

import { useEffect, useState } from 'react'

export interface CreateJobPostModalValues {
  jobTitle: string
  workplaceType: 'on-site' | 'hybrid' | 'remote'
  positionsAvailable: string
  allowance: string
  allowancePeriod: 'Month' | 'Week' | 'Day'
  gpa: string
  jobDescription: string
  jobSpecification: string
}

interface CreateJobPostModalProps {
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (values: CreateJobPostModalValues) => Promise<void> | void
}

const initialValues: CreateJobPostModalValues = {
  jobTitle: '',
  workplaceType: 'on-site',
  positionsAvailable: '',
  allowance: '',
  allowancePeriod: 'Month',
  gpa: '',
  jobDescription: '',
  jobSpecification: '',
}

export default function CreateJobPostModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateJobPostModalProps) {
  const [values, setValues] = useState<CreateJobPostModalValues>(initialValues)

  useEffect(() => {
    if (isOpen) {
      setValues(initialValues)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6" onClick={onClose}>
      <div
        className="w-full max-w-[1060px] rounded-[20px] bg-white px-[38px] pb-[34px] pt-[26px] shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-[18px] flex items-start justify-between gap-4">
          <h2 className="text-[28px] font-bold leading-none text-[#111827]">Create Job Post</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Close create job post modal"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault()
            await onSubmit(values)
          }}
          className="space-y-[18px]"
        >
          <div>
            <label className="mb-[8px] block text-[16px] font-semibold text-[#111827]">Job Title</label>
            <input
              type="text"
              value={values.jobTitle}
              onChange={(event) => setValues((prev) => ({ ...prev, jobTitle: event.target.value }))}
              placeholder="e.g. Frontend Developer Intern"
              className="h-[42px] w-full rounded-[8px] border border-[#CBD5E1] px-[16px] text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8]"
              required
            />
          </div>

          <div>
            <label className="mb-[8px] block text-[16px] font-semibold text-[#111827]">Internship format</label>
            <div className="grid grid-cols-3 overflow-hidden rounded-[8px] border border-[#A3A3A3]">
              {([
                ['on-site', 'On-site'],
                ['hybrid', 'Hybrid'],
                ['remote', 'Remote'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValues((prev) => ({
                      ...prev,
                      workplaceType: value,
                    }))
                  }
                  className={`h-[42px] border-r border-[#A3A3A3] text-[14px] font-medium transition last:border-r-0 ${
                    values.workplaceType === value
                      ? 'bg-[#EFF6FF] text-[#2563EB]'
                      : 'bg-white text-[#404040]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-[8px] block text-[16px] font-semibold text-[#111827]">Number of applicants</label>
            <input
              type="number"
              min="0"
              value={values.positionsAvailable}
              onChange={(event) => setValues((prev) => ({ ...prev, positionsAvailable: event.target.value }))}
              placeholder="Enter number of available positions"
              className="h-[42px] w-full rounded-[8px] border border-[#CBD5E1] px-[16px] text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8]"
            />
          </div>

          <div>
            <label className="mb-[8px] block text-[16px] font-semibold text-[#111827]">Allowance</label>
            <div className="flex items-center gap-[14px]">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={values.allowance}
                  onChange={(event) => setValues((prev) => ({ ...prev, allowance: event.target.value }))}
                  placeholder="Example: 5,000"
                  className="h-[42px] w-full rounded-[8px] border border-[#A3A3A3] px-[16px] pr-10 text-[14px] text-[#111827] outline-none placeholder:text-[#8A8A8A]"
                />
                <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[20px] text-[#404040]">฿</span>
              </div>
              <span className="text-[28px] leading-none text-[#111827]">/</span>
              <div className="w-[156px]">
                <select
                  value={values.allowancePeriod}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      allowancePeriod: event.target.value as CreateJobPostModalValues['allowancePeriod'],
                    }))
                  }
                  className="h-[42px] w-full appearance-none rounded-[8px] border border-[#A3A3A3] bg-white px-[16px] text-[14px] text-[#404040] outline-none"
                >
                  <option value="Month">Month</option>
                  <option value="Week">Week</option>
                  <option value="Day">Day</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-[8px] block text-[16px] font-semibold text-[#111827]">GPA</label>
            <input
              type="text"
              inputMode="decimal"
              value={values.gpa}
              onChange={(event) => setValues((prev) => ({ ...prev, gpa: event.target.value }))}
              placeholder="Example: 3.50"
              className="h-[42px] w-full rounded-[8px] border border-[#CBD5E1] px-[16px] text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8]"
            />
          </div>

          <div>
            <label className="mb-[8px] block text-[16px] font-semibold text-[#111827]">Job description</label>
            <textarea
              value={values.jobDescription}
              onChange={(event) => setValues((prev) => ({ ...prev, jobDescription: event.target.value }))}
              placeholder="Describe responsibilities, tasks, and project scope"
              className="min-h-[154px] w-full rounded-[8px] border border-[#CBD5E1] px-[16px] py-[14px] text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8]"
              required
            />
          </div>

          <div>
            <label className="mb-[8px] block text-[16px] font-semibold text-[#111827]">Applicant qualifications</label>
            <textarea
              value={values.jobSpecification}
              onChange={(event) => setValues((prev) => ({ ...prev, jobSpecification: event.target.value }))}
              placeholder="List required skills, education, or experience"
              className="min-h-[154px] w-full rounded-[8px] border border-[#CBD5E1] px-[16px] py-[14px] text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8]"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-[6px]">
            <button
              type="button"
              onClick={onClose}
              className="flex h-[40px] items-center justify-center rounded-[10px] border border-[#D1D5DB] bg-white px-5 text-[14px] font-semibold text-[#374151] transition hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-[40px] items-center justify-center rounded-[10px] bg-[#2563EB] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {isSubmitting ? 'Creating...' : 'Create Job Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
