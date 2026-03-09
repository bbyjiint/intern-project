'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import EmployerNavbar from '@/components/EmployerNavbar'
import EmployerSidebar from '@/components/EmployerSidebar'
import CandidateCard from '@/components/CandidateCard'
import CandidateProfileModal from '@/components/CandidateProfileModal'
import { apiFetch } from '@/lib/api'

interface Candidate {
  id: string
  name: string
  role: string
  university: string
  major: string | null
  graduationDate: string | null
  location?: string | null
  skills: string[]
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
        const normalized = (data.candidates || []).map((c) => ({
          ...c,
          role: c.role || 'Intern',
          university: c.university || 'Unknown University',
          major: c.major ?? null,
          graduationDate: c.graduationDate ?? null,
          location: c.location ?? null,
          skills: Array.isArray(c.skills) ? c.skills : [],
          initials: c.initials || (c.name ? c.name.slice(0, 2).toUpperCase() : 'U'),
        }))
        setApiCandidates(normalized)
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
        <EmployerSidebar activeItem="applicants" />

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

