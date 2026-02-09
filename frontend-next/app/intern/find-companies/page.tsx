'use client'

import { useEffect, useState, useMemo } from 'react'
import InternNavbar from '@/components/InternNavbar'
import { apiFetch } from '@/lib/api'

interface JobPost {
  id: string
  jobTitle: string
  companyName: string
  companyLogo: string
  location: string
  workType: string
  jobType: 'full-time' | 'part-time' | 'internship'
  seniorityLevel: 'student' | 'entry' | 'mid' | 'senior' | 'director' | 'vp'
  field: string
  positions: number
  allowance: string
  skills: string[]
  postedDate: string
  isBookmarked?: boolean
  jobDescription?: string
  jobSpecification?: string
  isUrgent?: boolean
}

const mockJobs: JobPost[] = [
  {
    id: '1',
    jobTitle: 'UX/UI Designer',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'Remote',
    jobType: 'internship',
    seniorityLevel: 'student',
    field: 'IT&Software',
    positions: 5,
    allowance: '200-300 THB/Day',
    skills: ['Design', 'User Experience', 'Senior'],
    postedDate: '15 January 2026',
    isBookmarked: false,
  },
  {
    id: '2',
    jobTitle: 'Web Developer',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'Remote',
    jobType: 'full-time',
    seniorityLevel: 'entry',
    field: 'IT&Software',
    positions: 5,
    allowance: '15,000 THB',
    skills: ['Design', 'User Experience', 'Senior'],
    postedDate: '15 January 2026',
    isBookmarked: false,
  },
  {
    id: '3',
    jobTitle: 'Web Developer',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'Remote',
    jobType: 'full-time',
    seniorityLevel: 'entry',
    field: 'IT&Software',
    positions: 5,
    allowance: '15,000 THB',
    skills: ['Design', 'User Experience', 'Senior'],
    postedDate: '15 January 2026',
    isBookmarked: false,
  },
  {
    id: '4',
    jobTitle: 'Business Analysis (BA)',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'On-site',
    jobType: 'internship',
    seniorityLevel: 'student',
    field: 'IT&Software',
    positions: 5,
    allowance: '200-300 THB/Day',
    skills: ['Design', 'User Experience', 'Senior'],
    postedDate: '15 January 2026',
    isBookmarked: false,
  },
  {
    id: '5',
    jobTitle: 'Recruiter',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'On-site',
    jobType: 'part-time',
    seniorityLevel: 'entry',
    field: 'Human Resource/HR',
    positions: 5,
    allowance: '15,000 THB',
    skills: ['Design', 'User Experience', 'Senior'],
    postedDate: '15 January 2026',
    isBookmarked: false,
  },
  {
    id: '6',
    jobTitle: 'Recruiter',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'On-site',
    jobType: 'part-time',
    seniorityLevel: 'entry',
    field: 'Human Resource/HR',
    positions: 5,
    allowance: '15,000 THB',
    skills: ['Design', 'User Experience', 'Senior'],
    postedDate: '15 January 2026',
    isBookmarked: false,
  },
  {
    id: '7',
    jobTitle: 'UX/UI Designer',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'Remote',
    jobType: 'internship',
    seniorityLevel: 'student',
    field: 'IT&Software',
    positions: 5,
    allowance: '200-300 THB/Day',
    skills: ['Design', 'User Experience', 'Senior'],
    postedDate: '15 January 2026',
    isBookmarked: false,
  },
  {
    id: '8',
    jobTitle: 'Web Developer',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'Remote',
    jobType: 'full-time',
    seniorityLevel: 'entry',
    field: 'IT&Software',
    positions: 5,
    allowance: '15,000 THB',
    skills: ['Design', 'User Experience', 'Senior'],
    postedDate: '15 January 2026',
    isBookmarked: false,
  },
  {
    id: '9',
    jobTitle: 'Web Developer',
    companyName: 'Trinity Securities Co., Ltd.',
    companyLogo: 'TRINITY',
    location: 'Silom, Bangkok',
    workType: 'Remote',
    jobType: 'full-time',
    seniorityLevel: 'entry',
    field: 'IT&Software',
    positions: 5,
    allowance: '15,000 THB',
    skills: ['Design', 'User Experience', 'Senior'],
    postedDate: '15 January 2026',
    isBookmarked: false,
  },
]

export default function FindCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [fullTime, setFullTime] = useState(false)
  const [partTime, setPartTime] = useState(true)
  const [internship, setInternship] = useState(true)
  const [studentLevel, setStudentLevel] = useState(true)
  const [entryLevel, setEntryLevel] = useState(true)
  const [midLevel, setMidLevel] = useState(false)
  const [seniorLevel, setSeniorLevel] = useState(false)
  const [directors, setDirectors] = useState(false)
  const [vpOrAbove, setVpOrAbove] = useState(false)
  const [minSalary, setMinSalary] = useState('10000')
  const [maxSalary, setMaxSalary] = useState('500000')
  const [salaryRange, setSalaryRange] = useState([10000, 500000])
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set())
  const [ignoredJobs, setIgnoredJobs] = useState<Set<string>>(new Set())
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null)
  const [showJobDetailModal, setShowJobDetailModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let bookmarksSet = new Set<string>()

    const loadSaved = async () => {
      try {
        const [bm, ig] = await Promise.all([
          apiFetch<{ jobIds: string[] }>(`/api/intern/job-bookmarks`),
          apiFetch<{ jobIds: string[] }>(`/api/intern/job-ignored`),
        ])
        bookmarksSet = new Set(bm.jobIds || [])
        setBookmarkedJobs(bookmarksSet)
        setIgnoredJobs(new Set(ig.jobIds || []))
      } catch (e) {
        console.error('Failed to load intern bookmark/ignore from API, falling back to localStorage:', e)

        // Fallback: localStorage (legacy demo behavior)
        const savedBookmarks = localStorage.getItem('internBookmarkedJobs')
        if (savedBookmarks) {
          try {
            const bookmarks = JSON.parse(savedBookmarks)
            bookmarksSet = new Set(bookmarks)
            setBookmarkedJobs(bookmarksSet)
          } catch (err) {
            console.error('Failed to parse bookmarked jobs:', err)
          }
        }

        const savedIgnored = localStorage.getItem('internIgnoredJobs')
        if (savedIgnored) {
          try {
            const ignored = JSON.parse(savedIgnored)
            setIgnoredJobs(new Set(ignored))
          } catch (err) {
            console.error('Failed to parse ignored jobs:', err)
          }
        }
      }
    }

    // Fetch job posts from API
    const loadJobPosts = async () => {
      setIsLoading(true)
      try {
        const data = await apiFetch<{ jobPosts: JobPost[] }>('/api/job-posts/public')
        // Mark bookmarked jobs using the loaded bookmarks
        const jobsWithBookmarks = data.jobPosts.map((job) => ({
          ...job,
          isBookmarked: bookmarksSet.has(job.id),
        }))
        setJobs(jobsWithBookmarks)
      } catch (error) {
        console.error('Failed to load job posts:', error)
        // Fallback to mock data if API fails
        setJobs(mockJobs)
      } finally {
        setIsLoading(false)
      }
    }

    ;(async () => {
      await loadSaved()
      await loadJobPosts()
    })()
  }, [])

  const handleBookmark = async (id: string) => {
    const newBookmarks = new Set(bookmarkedJobs)
    if (newBookmarks.has(id)) {
      try {
        await apiFetch(`/api/intern/job-bookmarks/${id}`, { method: 'DELETE' })
      } catch (e) {
        console.error('Failed to remove bookmark:', e)
      }
      newBookmarks.delete(id)
    } else {
      try {
        await apiFetch(`/api/intern/job-bookmarks/${id}`, { method: 'POST' })
      } catch (e) {
        console.error('Failed to bookmark:', e)
      }
      newBookmarks.add(id)
    }
    setBookmarkedJobs(newBookmarks)
    // Keep legacy localStorage in sync for backward compatibility
    localStorage.setItem('internBookmarkedJobs', JSON.stringify(Array.from(newBookmarks)))
    
    // Update job's bookmark status
    setJobs(jobs.map(job => 
      job.id === id ? { ...job, isBookmarked: newBookmarks.has(id) } : job
    ))
  }

  const handleIgnore = async (id: string) => {
    const newIgnored = new Set(ignoredJobs)
    if (newIgnored.has(id)) {
      try {
        await apiFetch(`/api/intern/job-ignored/${id}`, { method: 'DELETE' })
      } catch (e) {
        console.error('Failed to un-ignore job:', e)
      }
      newIgnored.delete(id)
    } else {
      try {
        await apiFetch(`/api/intern/job-ignored/${id}`, { method: 'POST' })
      } catch (e) {
        console.error('Failed to ignore job:', e)
      }
      newIgnored.add(id)
    }
    setIgnoredJobs(newIgnored)
    localStorage.setItem('internIgnoredJobs', JSON.stringify(Array.from(newIgnored)))
  }

  const handleSalaryRangeChange = (value: number) => {
    const maxValue = parseInt(maxSalary.replace(/,/g, ''), 10) || 500000
    const newMin = Math.min(value, maxValue)
    setSalaryRange([newMin, maxValue])
    setMinSalary(newMin.toString())
  }

  const handleMaxSalaryChange = (value: number) => {
    const minValue = parseInt(minSalary.replace(/,/g, ''), 10) || 10000
    const newMax = Math.max(value, minValue)
    setSalaryRange([minValue, newMax])
    setMaxSalary(newMax.toString())
  }

  const handleApplySalary = () => {
    // Salary filter is already applied in filteredJobs useMemo
    // This function can be used for additional actions if needed
  }

  const handleResetSalary = () => {
    setMinSalary('10000')
    setMaxSalary('500000')
    setSalaryRange([10000, 500000])
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Ignore filter - exclude ignored jobs
      if (ignoredJobs.has(job.id)) {
        return false
      }

      // Search filter
      const matchesSearch =
        !searchQuery ||
        job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

      // Job type filter - show all if none selected, otherwise match selected types
      const hasJobTypeSelected = fullTime || partTime || internship
      const matchesJobType = !hasJobTypeSelected ||
        (fullTime && job.jobType === 'full-time') ||
        (partTime && job.jobType === 'part-time') ||
        (internship && job.jobType === 'internship')

      // Seniority level filter - show all if none selected, otherwise match selected levels
      const hasSenioritySelected = studentLevel || entryLevel || midLevel || seniorLevel || directors || vpOrAbove
      const matchesSeniority = !hasSenioritySelected ||
        (studentLevel && job.seniorityLevel === 'student') ||
        (entryLevel && job.seniorityLevel === 'entry') ||
        (midLevel && job.seniorityLevel === 'mid') ||
        (seniorLevel && job.seniorityLevel === 'senior') ||
        (directors && job.seniorityLevel === 'director') ||
        (vpOrAbove && job.seniorityLevel === 'vp')

      // Salary filter - extract numeric value from allowance string
      const extractSalary = (allowance: string): number => {
        // Extract numbers from strings like "200-300 THB/Day" or "15,000 THB"
        const numbers = allowance.match(/[\d,]+/g)
        if (numbers && numbers.length > 0) {
          // Take the first number, remove commas, and convert to number
          return parseInt(numbers[0].replace(/,/g, ''), 10)
        }
        return 0
      }
      
      const jobSalary = extractSalary(job.allowance)
      const minSalaryNum = parseInt(minSalary.replace(/,/g, ''), 10) || 0
      const maxSalaryNum = parseInt(maxSalary.replace(/,/g, ''), 10) || 1000000
      const matchesSalary = jobSalary >= minSalaryNum && jobSalary <= maxSalaryNum

      return matchesSearch && matchesJobType && matchesSeniority && matchesSalary
    })
  }, [jobs, ignoredJobs, searchQuery, fullTime, partTime, internship, studentLevel, entryLevel, midLevel, seniorLevel, directors, vpOrAbove, minSalary, maxSalary])

  const getJobTypeCount = (type: 'full-time' | 'part-time' | 'internship') => {
    return jobs.filter(job => job.jobType === type).length
  }

  const getSeniorityCount = (level: string) => {
    return jobs.filter(job => job.seniorityLevel === level).length
  }

  const getJobTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return { bg: '#E3F2FD', text: '#0273B1' }
      case 'part-time':
        return { bg: '#FFF3E0', text: '#F57C00' }
      case 'internship':
        return { bg: '#E8F5E9', text: '#2E7D32' }
      default:
        return { bg: '#F5F5F5', text: '#616161' }
    }
  }

  const getWorkTypeBadgeColor = (type: string) => {
    if (type === 'Remote' || type === 'Hybrid') {
      return { bg: '#E8F5E9', text: '#2E7D32' }
    }
    return { bg: '#F5F5F5', text: '#616161' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InternNavbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFindJob={() => {
          // Handle find job action
        }}
      />

      <div className="flex">
        {/* Left Sidebar - Filters */}
        <div className="w-80 bg-white min-h-screen border-r border-gray-200 p-6">
          {/* Type of Employment */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Type of Employment</h3>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={fullTime}
                    onChange={(e) => setFullTime(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Full Time Jobs</span>
                </div>
                <span className="text-gray-500 text-sm">{getJobTypeCount('full-time')}</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={partTime}
                    onChange={(e) => setPartTime(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Part Time Jobs</span>
                </div>
                <span className="text-gray-500 text-sm">{getJobTypeCount('part-time')}</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={internship}
                    onChange={(e) => setInternship(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Internship Jobs</span>
                </div>
                <span className="text-gray-500 text-sm">{getJobTypeCount('internship')}</span>
              </label>
            </div>
          </div>

          {/* Seniority Level */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Seniority Level</h3>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={studentLevel}
                    onChange={(e) => setStudentLevel(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Student Level</span>
                </div>
                <span className="text-gray-500 text-sm">{getSeniorityCount('student')}</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={entryLevel}
                    onChange={(e) => setEntryLevel(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Entry Level</span>
                </div>
                <span className="text-gray-500 text-sm">{getSeniorityCount('entry')}</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={midLevel}
                    onChange={(e) => setMidLevel(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Mid Level</span>
                </div>
                <span className="text-gray-500 text-sm">{getSeniorityCount('mid')}</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={seniorLevel}
                    onChange={(e) => setSeniorLevel(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Senior Level</span>
                </div>
                <span className="text-gray-500 text-sm">{getSeniorityCount('senior')}</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={directors}
                    onChange={(e) => setDirectors(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Directors</span>
                </div>
                <span className="text-gray-500 text-sm">{getSeniorityCount('director')}</span>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={vpOrAbove}
                    onChange={(e) => setVpOrAbove(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">VP or Above</span>
                </div>
                <span className="text-gray-500 text-sm">{getSeniorityCount('vp')}</span>
              </label>
            </div>
          </div>

          {/* Salary Range */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Salary Range</h3>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="1000000"
                step="1000"
                value={salaryRange[0]}
                onChange={(e) => handleSalaryRangeChange(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min</label>
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => {
                    const val = e.target.value
                    const numVal = parseInt(val.replace(/,/g, ''), 10) || 0
                    const maxVal = parseInt(maxSalary.replace(/,/g, ''), 10) || 500000
                    const newMin = Math.min(numVal, maxVal)
                    setMinSalary(newMin.toString())
                    setSalaryRange([newMin, maxVal])
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max</label>
                <input
                  type="number"
                  value={maxSalary}
                  onChange={(e) => {
                    const val = e.target.value
                    const numVal = parseInt(val.replace(/,/g, ''), 10) || 500000
                    const minVal = parseInt(minSalary.replace(/,/g, ''), 10) || 10000
                    const newMax = Math.max(numVal, minVal)
                    setMaxSalary(newMax.toString())
                    setSalaryRange([minVal, newMax])
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleApplySalary}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm text-white transition-colors"
                style={{ backgroundColor: '#0273B1' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0273B1'
                }}
              >
                Apply
              </button>
              <button
                onClick={handleResetSalary}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLoading ? 'Loading...' : `${filteredJobs.length} Jobs Found`}
            </h2>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading job posts...</div>
            </div>
          )}

          {/* Job Cards Grid */}
          {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const isBookmarked = bookmarkedJobs.has(job.id)
              
              return (
                <div key={job.id} className="bg-gray-50 rounded-lg p-6 relative">
                  {/* Menu and Bookmark Icons - Three dots first, then bookmark */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedJob(job)
                        setShowJobDetailModal(true)
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleBookmark(job.id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors z-10"
                    >
                      <svg
                        className={`w-5 h-5 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Company Logo and Job Info */}
                  <div className="flex items-start mb-4">
                    {/* TRINITY Logo - Dark blue background with red triangle and yellow text */}
                    <div className="relative w-16 h-16 mr-4 flex-shrink-0">
                      <div className="w-16 h-16 rounded" style={{ backgroundColor: '#0F172A' }}>
                        <div className="relative w-full h-full flex flex-col items-center justify-center p-1.5">
                          {/* Red Triangle with Yellow Border */}
                          <div className="relative flex items-center justify-center mb-0.5">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L22 20H2L12 2Z" fill="#DC2626" stroke="#FCD34D" strokeWidth="1.2"/>
                            </svg>
                          </div>
                          {/* TRINITY Text on Yellow Background */}
                          <div className="absolute bottom-0 left-0 right-0 px-0.5 py-0.5" style={{ backgroundColor: '#FCD34D' }}>
                            <span className="text-[7px] font-bold uppercase leading-tight block text-center" style={{ 
                              color: '#FCD34D',
                              textShadow: '0.5px 0.5px 0px #000, -0.5px -0.5px 0px #000, 0.5px -0.5px 0px #000, -0.5px 0.5px 0px #000',
                              WebkitTextStroke: '0.4px #000',
                              letterSpacing: '0.02em'
                            }}>
                              {job.companyLogo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{job.jobTitle}</h3>
                      <p className="text-sm text-gray-700 mb-1">{job.companyName}</p>
                      <p className="text-xs text-gray-600">{job.location}</p>
                    </div>
                  </div>

                  {/* Job Type and Work Type Tags - Light green with icons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      {job.jobType === 'full-time' ? 'Full-Time' : job.jobType === 'part-time' ? 'Part-Time' : 'Internship'}
                    </span>
                    {(job.workType === 'Remote' || job.workType === 'Hybrid' || job.workType === 'On-site') && (
                      <span className="px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        {job.workType}
                      </span>
                    )}
                  </div>

                  {/* Job Details with Icons */}
                  <div className="mb-4 space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Field: <span className="font-bold">{job.field}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Openings: <span className="font-bold">{job.positions} Positions</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Allowance: <span className="font-bold">{job.allowance}</span></span>
                    </div>
                  </div>

                  {/* Skills Tags - Light grey */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-md text-xs text-gray-600"
                          style={{ backgroundColor: '#F3F4F6' }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer - Date and Unavailable Icon */}
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-xs text-gray-400">{job.postedDate}</span>
                    <button
                      onClick={() => handleIgnore(job.id)}
                      className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                      title={ignoredJobs.has(job.id) ? 'Show this post' : 'Ignore this post'}
                    >
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>
      </div>

      {/* Job Detail Modal */}
      {showJobDetailModal && selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isBookmarked={bookmarkedJobs.has(selectedJob.id)}
          onClose={() => {
            setShowJobDetailModal(false)
            setSelectedJob(null)
          }}
          onBookmark={() => handleBookmark(selectedJob.id)}
        />
      )}
    </div>
  )
}

// Job Detail Modal Component
interface JobDetailModalProps {
  job: JobPost
  isBookmarked: boolean
  onClose: () => void
  onBookmark: () => void
}

function JobDetailModal({ job, isBookmarked, onClose, onBookmark }: JobDetailModalProps) {
  // Parse job description and specification into lists
  const parseToList = (text: string): string[] => {
    if (!text) return []
    // Split by newlines or numbers
    const lines = text.split(/\n+/).filter(line => line.trim())
    // If lines start with numbers, extract them
    return lines.map(line => {
      // Remove leading numbers and dots
      return line.replace(/^\d+\.\s*/, '').trim()
    }).filter(line => line.length > 0)
  }

  const jobDescriptionList = parseToList(job.jobDescription || '')
  const jobSpecificationList = parseToList(job.jobSpecification || '')

  // Format job title with job type prefix
  const formattedJobTitle = job.jobType === 'internship' 
    ? `Internship - ${job.jobTitle}`
    : job.jobType === 'part-time'
    ? `Part-Time - ${job.jobTitle}`
    : job.jobTitle

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        {/* URGENT Badge and Bookmark - Top Right */}
        <div className="absolute top-6 right-6 flex items-center space-x-3 z-10">
          {job.isUrgent && (
            <div className="relative">
              <div className="bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
                URGENT
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
              </div>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onBookmark()
            }}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <svg
              className={`w-6 h-6 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {/* Header Section */}
          <div className="flex items-start mb-6">
            {/* Company Logo */}
            <div className="relative w-20 h-20 mr-6 flex-shrink-0">
              <div className="w-20 h-20 rounded" style={{ backgroundColor: '#0F172A' }}>
                <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
                  {/* Red Triangle with Yellow Border */}
                  <div className="relative flex items-center justify-center mb-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L22 20H2L12 2Z" fill="#DC2626" stroke="#FCD34D" strokeWidth="1.2"/>
                    </svg>
                  </div>
                  {/* TRINITY Text */}
                  <div className="absolute bottom-0 left-0 right-0 px-1 py-1" style={{ backgroundColor: '#FCD34D' }}>
                    <span className="text-[8px] font-bold uppercase leading-tight block text-center" style={{ 
                      color: '#FCD34D',
                      textShadow: '0.5px 0.5px 0px #000, -0.5px -0.5px 0px #000, 0.5px -0.5px 0px #000, -0.5px 0.5px 0px #000',
                      WebkitTextStroke: '0.4px #000',
                      letterSpacing: '0.02em'
                    }}>
                      {job.companyLogo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{formattedJobTitle}</h2>
              <p className="text-lg text-gray-700 mb-1">{job.companyName}</p>
              <p className="text-base text-gray-600">{job.location}</p>
            </div>
          </div>

          {/* Job Description */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Job Description</h3>
            {jobDescriptionList.length > 0 ? (
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                {jobDescriptionList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-600">No description provided.</p>
            )}
          </div>

          {/* Job Specification */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Job Specification</h3>
            {jobSpecificationList.length > 0 ? (
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                {jobSpecificationList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-600">No specification provided.</p>
            )}
          </div>

          {/* Allowance */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Allowance</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>{job.allowance || 'No allowance specified'}</li>
            </ul>
          </div>

          {/* Workplace Type */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Workplace Type</h3>
            <ul className="list-disc list-inside text-gray-700">
              <li>
                {job.workType === 'Remote' ? 'Work From Home (Remote)' :
                 job.workType === 'Hybrid' ? 'Hybrid' :
                 job.workType === 'On-site' ? 'On-site' :
                 job.workType || 'Not specified'}
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              ;(async () => {
                try {
                  await apiFetch(`/api/job-posts/${job.id}/apply`, { method: 'POST' })
                } catch (e) {
                  console.error('Failed to apply:', e)
                } finally {
                  onClose()
                }
              })()
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            style={{ backgroundColor: '#0273B1' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#025a8f'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0273B1'
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
