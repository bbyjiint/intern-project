'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import CandidateCard from '@/components/CandidateCard'
import CandidateProfileModal from '@/components/CandidateProfileModal'
import { apiFetch, getToken } from '@/lib/api'
import Link from 'next/link'

interface Candidate {
  name: string
  role?: string
  university?: string
  major?: string
  graduationDate?: string
  skills?: string[]
  initials: string
  email?: string
  about?: string
  status?: 'interviewed' | 'accepted' | 'rejected'
}

export default function EmployerDashboardPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<'all' | 'interviewed' | 'accepted' | 'rejected'>('all')
  const [bookmarkedCandidates, setBookmarkedCandidates] = useState<Set<string>>(new Set()) // Using candidate IDs
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [apiCandidates, setApiCandidates] = useState<Candidate[]>([])
  const [apiError, setApiError] = useState<string | null>(null)

  // Check user role and redirect if necessary
  useEffect(() => {
    const checkRole = async () => {
      try {
        const token = getToken()
        if (!token) {
          router.push('/login')
          return
        }

        const userData = await apiFetch<{ user: { role: string | null } }>('/api/auth/me')
        
        // If user has CANDIDATE role, redirect to intern pages
        if (userData.user.role === 'CANDIDATE') {
          router.push('/intern/dashboard')
          return
        }
        
        // If user has no role, redirect to role selection
        if (!userData.user.role) {
          router.push('/role-selection')
          return
        }
      } catch (error) {
        console.error('Failed to check user role:', error)
        // If auth fails, redirect to login
        router.push('/login')
      }
    }

    checkRole()
  }, [router])

  useEffect(() => {
    ;(async () => {
      try {
        // Load bookmarked candidates from API
        const bookmarksData = await apiFetch<{ candidates: Array<{ id: string }> }>(`/api/bookmarks`)
        const bookmarkIds = new Set(bookmarksData.candidates.map((c) => c.id))
        setBookmarkedCandidates(bookmarkIds)
      } catch (err) {
        console.error('Failed to load bookmarks:', err)
        // Fallback to localStorage for backward compatibility
        const savedBookmarks = localStorage.getItem('bookmarkedCandidates')
        if (savedBookmarks) {
          try {
            const bookmarks = JSON.parse(savedBookmarks)
            setBookmarkedCandidates(new Set(bookmarks))
          } catch (e) {
            console.error('Failed to parse bookmarked candidates:', e)
          }
        }
      }

      // Load all candidates
      try {
        const data = await apiFetch<{ candidates: Candidate[] }>(`/api/candidates`)
        setApiCandidates(data.candidates || [])
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Failed to load candidates')
        setApiCandidates([])
      }
    })()
  }, [])

  const candidates = useMemo(() => {
    return apiCandidates || []
  }, [apiCandidates])

  const handleBookmark = async (e: React.MouseEvent, candidateId: string) => {
    e.stopPropagation()
    const isCurrentlyBookmarked = bookmarkedCandidates.has(candidateId)
    const newBookmarks = new Set(bookmarkedCandidates)

    try {
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        await apiFetch(`/api/bookmarks/${candidateId}`, { method: 'DELETE' })
        newBookmarks.delete(candidateId)
      } else {
        // Add bookmark
        await apiFetch(`/api/bookmarks/${candidateId}`, { method: 'POST' })
        newBookmarks.add(candidateId)
      }
      setBookmarkedCandidates(newBookmarks)
    } catch (err) {
      console.error('Failed to update bookmark:', err)
      // Show error to user (you might want to add a toast notification here)
    }
  }

  const handleCardClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const filteredCandidates = candidates.filter((candidate) => {
    if (statusFilter === 'all') return true
    return candidate.status === statusFilter
  })

  const statusCounts = useMemo(() => {
    return {
      all: candidates.length,
      interviewed: candidates.filter((c) => c.status === 'interviewed').length,
      accepted: candidates.filter((c) => c.status === 'accepted').length,
      rejected: candidates.filter((c) => c.status === 'rejected').length,
    }
  }, [candidates])

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white min-h-screen pt-8 border-r border-gray-200">
          <div className="px-6 space-y-2">
            <Link
              href="/employer/profile"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profile</span>
            </Link>
            <Link
              href="/employer/dashboard"
              className="px-4 py-3 rounded-lg flex items-center space-x-3"
              style={{ backgroundColor: '#0273B1' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium text-white">Applicants</span>
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
                e.currentTarget.style.color = '#0273B1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#1C2D4F'
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
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {apiError && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              {apiError}
            </div>
          )}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Applicants</h1>
          </div>

          <div className="border-t border-blue-200 pt-6">
            <div className="mb-6">
              <p className="text-lg font-medium text-gray-700 mb-4">{filteredCandidates.length} interns found</p>
              <div className="flex space-x-4 border-b border-gray-200">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-white text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({statusCounts.all})
                </button>
                <button
                  onClick={() => setStatusFilter('interviewed')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === 'interviewed'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-white text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Interviewed ({statusCounts.interviewed})
                </button>
                <button
                  onClick={() => setStatusFilter('accepted')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === 'accepted'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-white text-green-600 hover:text-green-700'
                  }`}
                >
                  Accepted ({statusCounts.accepted})
                </button>
                <button
                  onClick={() => setStatusFilter('rejected')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === 'rejected'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-white text-red-600 hover:text-red-700'
                  }`}
                >
                  Rejected ({statusCounts.rejected})
                </button>
              </div>
            </div>

            {filteredCandidates.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No candidates found matching your criteria.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id || candidate.name}
                  {...candidate}
                  isBookmarked={bookmarkedCandidates.has(candidate.id || candidate.name)}
                  onBookmark={(e) => handleBookmark(e, candidate.id || candidate.name)}
                  onClick={() => handleCardClick(candidate)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedCandidate && (
        <CandidateProfileModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      )}
    </div>
  )
}

