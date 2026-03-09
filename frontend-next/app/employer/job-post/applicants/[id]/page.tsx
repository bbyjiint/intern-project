'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import EmployerSidebar from '@/components/EmployerSidebar'
import CandidateProfileModal from '@/components/CandidateProfileModal'
import { apiFetch } from '@/lib/api'

interface Applicant {
  id: string
  candidateId: string
  name: string
  email: string
  initials: string
  appliedDate: string
  status: 'new' | 'shortlisted' | 'reviewed' | 'rejected'
  skills: string[]
}

interface JobPost {
  id: string
  title: string
  companyName: string
  location: string
  workType: string
}

// Mock applicants data
const mockApplicants: Applicant[] = [
  {
    id: '1',
    candidateId: '1',
    name: 'John Doe',
    email: 'johndoe@email.com',
    initials: 'JD',
    appliedDate: '3 days ago',
    status: 'new',
    skills: ['Figma', 'UX Research'],
  },
  {
    id: '2',
    candidateId: '2',
    name: 'Jane Smith',
    email: 'jane.smith@mail.com',
    initials: 'JS',
    appliedDate: '4 days ago',
    status: 'shortlisted',
    skills: ['UI', 'Prototyping'],
  },
  {
    id: '3',
    candidateId: '3',
    name: 'Emily Johnson',
    email: 'emily.johnson@mail.com',
    initials: 'EJ',
    appliedDate: '5 days ago',
    status: 'new',
    skills: [],
  },
  {
    id: '4',
    candidateId: '4',
    name: 'Michael Brown',
    email: 'michael.brown@mail.com',
    initials: 'MB',
    appliedDate: '6 days ago',
    status: 'reviewed',
    skills: ['Wireframing', 'Adobe XD'],
  },
  {
    id: '5',
    candidateId: '5',
    name: 'Sarah Lee',
    email: 'sarah.lee@email.com',
    initials: 'SL',
    appliedDate: '1 week ago',
    status: 'reviewed',
    skills: ['Interaction Design', 'Figma'],
  },
  {
    id: '6',
    candidateId: '6',
    name: 'Sarah Lee',
    email: 'sarah.lee@email.com',
    initials: 'SL',
    appliedDate: 'A week ago',
    status: 'rejected',
    skills: ['UX Research', 'Photoshop'],
  },
]

function formatDate(date: Date): string {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800'
    case 'shortlisted':
      return 'bg-green-100 text-green-800'
    case 'reviewed':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function ViewApplicantsPage() {
  const params = useParams()
  const router = useRouter()
  const jobPostId = params?.id as string
  
  const [jobPost, setJobPost] = useState<JobPost | null>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'shortlisted' | 'rejected'>('all')
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      if (!jobPostId) return
      try {
        const data = await apiFetch<{ jobPost: JobPost; applicants: Applicant[] }>(`/api/job-posts/${jobPostId}/applicants`)
        setJobPost(data.jobPost)
        setApplicants(data.applicants || [])
      } catch (e) {
        console.error('Failed to load applicants:', e)
        setApplicants(mockApplicants as any)
      }
    }

    load()
  }, [jobPostId])

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const matchesSearch = 
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [applicants, searchQuery, statusFilter])

  const statusCounts = useMemo(() => {
    return {
      all: applicants.length,
      new: applicants.filter((a) => a.status === 'new').length,
      reviewed: applicants.filter((a) => a.status === 'reviewed').length,
      shortlisted: applicants.filter((a) => a.status === 'shortlisted').length,
      rejected: applicants.filter((a) => a.status === 'rejected').length,
    }
  }, [applicants])

  const handleShortlist = async (applicantId: string) => {
    try {
      await apiFetch(`/api/job-posts/${jobPostId}/applicants/${applicantId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'shortlisted' }),
      })
      setApplicants(applicants.map(a => a.id === applicantId ? { ...a, status: 'shortlisted' as const } : a))
    } catch (e) {
      console.error('Failed to shortlist applicant:', e)
    }
  }

  const handleReject = async (applicantId: string) => {
    try {
      await apiFetch(`/api/job-posts/${jobPostId}/applicants/${applicantId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' }),
      })
      setApplicants(applicants.map(a => a.id === applicantId ? { ...a, status: 'rejected' as const } : a))
    } catch (e) {
      console.error('Failed to reject applicant:', e)
    }
  }

  const handleViewProfile = (applicant: Applicant) => {
    // Convert applicant to candidate format for modal
    setSelectedApplicant(applicant)
  }

  const handleSelectApplicant = (applicantId: string) => {
    const newSelected = new Set(selectedApplicants)
    if (newSelected.has(applicantId)) {
      newSelected.delete(applicantId)
    } else {
      newSelected.add(applicantId)
    }
    setSelectedApplicants(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedApplicants.size === filteredApplicants.length) {
      setSelectedApplicants(new Set())
    } else {
      setSelectedApplicants(new Set(filteredApplicants.map(a => a.id)))
    }
  }

  if (!jobPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployerNavbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Job post not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      <div className="flex">
        <EmployerSidebar activeItem="job-post" />

        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            {/* Job Post Overview */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{jobPost.title}</h1>
              <p className="text-gray-600 mb-4">
                {jobPost.companyName} {jobPost.location} ({jobPost.workType})
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                  </button>
                  <button className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filter
                  </button>
                  <button className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    Sort
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{filteredApplicants.length} Applicants</p>
                  <p className="text-sm text-gray-600">{filteredApplicants.length} Applicants</p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Filter Tabs */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All <span className="ml-1 text-xs">({statusCounts.all})</span>
                </button>
                <button
                  onClick={() => setStatusFilter('new')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    statusFilter === 'new'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  New <span className="ml-1 text-xs">({statusCounts.new})</span>
                </button>
                <button
                  onClick={() => setStatusFilter('reviewed')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    statusFilter === 'reviewed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Reviewed <span className="ml-1 text-xs">({statusCounts.reviewed})</span>
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  Education
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Applicants Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedApplicants.size === filteredApplicants.length && filteredApplicants.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Applied Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Key Skills</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedApplicants.has(applicant.id)}
                          onChange={() => handleSelectApplicant(applicant.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {applicant.initials}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{applicant.name}</p>
                            <p className="text-sm text-gray-500">{applicant.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{applicant.appliedDate}</td>
                      <td className="py-4 px-4">
                        {applicant.status === 'new' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleShortlist(applicant.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleReject(applicant.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-red-700 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </div>
                        )}
                        {applicant.status !== 'new' && (
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusBadgeColor(applicant.status)}`}>
                            {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2">
                          {applicant.skills.length > 0 ? (
                            applicant.skills.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleViewProfile(applicant)}
                          className={`px-4 py-1 rounded-lg text-xs font-medium transition-colors ${
                            applicant.status === 'reviewed' && applicant.name === 'Sarah Lee' && applicant.appliedDate === '1 week ago'
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          View
                          {applicant.status === 'reviewed' && applicant.name === 'Sarah Lee' && applicant.appliedDate === '1 week ago' && (
                            <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredApplicants.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No applicants found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {selectedApplicant && (
        <CandidateProfileModal
          candidate={{
            id: selectedApplicant.candidateId,
            name: selectedApplicant.name,
            role: '',
            university: '',
            major: '',
            graduationDate: '',
            skills: selectedApplicant.skills,
            initials: selectedApplicant.initials,
            email: selectedApplicant.email,
            about: '',
          }}
          onClose={() => setSelectedApplicant(null)}
        />
      )}
    </div>
  )
}
