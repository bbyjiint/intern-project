'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import CompanyHubLogo from '@/components/CompanyHubLogo'

export default function EmployerNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const isFindCandidatesPage = pathname?.includes('/find-candidates')
  const isMessagesPage = pathname?.includes('/messages')
  const isJobPostPage = pathname?.startsWith('/employer/job-post')
  const [userData, setUserData] = useState<{ displayName?: string; email?: string } | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load user data from API
    const loadUserData = async () => {
      try {
        const data = await apiFetch<{ user: { displayName?: string; email?: string } }>('/api/auth/me')
        setUserData(data.user)
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    }

    const loadProfileData = () => {
      const savedData = localStorage.getItem('employerProfileData')
      if (savedData) {
        try {
          setProfileData(JSON.parse(savedData))
        } catch (e) {
          console.error('Failed to parse profile data:', e)
        }
      }
    }
    
    loadUserData()
    loadProfileData()
    
    // Listen for storage changes to sync profile image
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'employerProfileData') {
        loadProfileData()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom event for same-window updates
    const handleProfileUpdate = () => {
      loadProfileData()
      loadUserData()
    }
    
    window.addEventListener('profileImageUpdated', handleProfileUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profileImageUpdated', handleProfileUpdate)
    }
  }, [])

  // Poll for unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await apiFetch<{ unreadCount: number }>('/api/messages/unread-count')
        setUnreadCount(data.unreadCount)
      } catch (error) {
        // Silently fail - don't show errors for unread count
      }
    }

    // Fetch immediately
    fetchUnreadCount()

    // Poll every 5 seconds
    const interval = setInterval(fetchUnreadCount, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const getInitials = (name: string) => {
    if (!name) return 'C'
    return name.charAt(0).toUpperCase()
  }

  const handleOpenCreateJobPost = () => {
    if (typeof window !== 'undefined' && isJobPostPage) {
      window.dispatchEvent(new CustomEvent('openCreateJobPostModal'))
      return
    }

    router.push('/employer/job-post?create=1')
  }

  return (
    <nav className="border-b border-[#E5E7EB] bg-white">
      <div className="layout-container">
        <div className="flex h-[100px] items-center justify-between">
          <div className="flex items-center gap-10">
            <CompanyHubLogo href="/employer/dashboard" />
            <div className="hidden md:flex items-center gap-10">
              <Link
                href="/employer/find-candidates"
                className="text-[16px] font-medium transition-colors"
                style={{ color: isFindCandidatesPage ? '#1C2D4F' : '#A9B4CD' }}
                onMouseEnter={(e) => {
                  if (!isFindCandidatesPage) {
                    e.currentTarget.style.color = '#1C2D4F'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFindCandidatesPage) {
                    e.currentTarget.style.color = '#A9B4CD'
                  }
                }}
              >
                Find Candidates
              </Link>
              <Link
                href="/employer/messages"
                className="relative text-[16px] font-medium transition-colors"
                style={{ color: isMessagesPage ? '#1C2D4F' : '#A9B4CD' }}
                onMouseEnter={(e) => {
                  if (!isMessagesPage) {
                    e.currentTarget.style.color = '#1C2D4F'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMessagesPage) {
                    e.currentTarget.style.color = '#A9B4CD'
                  }
                }}
              >
                Message
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-6 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <a
                href="mailto:support@companyhub.local?subject=Bug%20Report"
                className="text-[16px] font-medium transition-colors"
                style={{ color: '#A9B4CD' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1C2D4F'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#A9B4CD'
                }}
              >
                Report bug
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleOpenCreateJobPost}
              className="flex items-center space-x-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#E3F5FF', color: '#0273B1' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0273B1'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E3F5FF'
                e.currentTarget.style.color = '#0273B1'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Job Post</span>
            </button>
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center gap-3">
                <div className="hidden text-right md:block">
                  <div className="text-sm font-semibold text-gray-900">
                    {userData?.displayName || profileData?.companyName || 'Company Name'}
                  </div>
                </div>
                <div className="relative h-12 w-12">
                  <Link
                    href="/employer/profile"
                    className="block h-12 w-12 overflow-hidden rounded-full bg-[#F4F4FA] cursor-pointer"
                  >
                    {profileData?.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt="Profile"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="flex h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: '#0273B1' }}
                      >
                        <span className="text-white font-semibold text-sm">
                          {getInitials(userData?.displayName || profileData?.companyName || 'C')}
                        </span>
                      </div>
                    )}
                  </Link>
                  {/* Dropdown indicator - small gray circle with arrow */}
                  <button
                    className="absolute bottom-0 right-0 z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#E5E7EB] cursor-pointer transition-colors hover:bg-[#D1D5DB]"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowDropdown(!showDropdown)
                    }}
                  >
                    <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/employer/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    href="/employer/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Applicants
                  </Link>
                  <Link
                    href="/employer/job-post"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Job Post
                  </Link>
                  <Link
                    href="/employer/bookmark"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Bookmark
                  </Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      ;(async () => {
                        try {
                          await apiFetch(`/api/auth/logout`, { method: 'POST' })
                        } catch {
                          // ignore
                        } finally {
                          // Clear cached client data
                          localStorage.removeItem('user')
                          localStorage.removeItem('employerProfileData')
                          localStorage.removeItem('employerConversations')
                          localStorage.removeItem('jobPosts')
                          localStorage.removeItem('bookmarkedCandidates')
                          router.push('/')
                          setShowDropdown(false)
                        }
                      })()
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

