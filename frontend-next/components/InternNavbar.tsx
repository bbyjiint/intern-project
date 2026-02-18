'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'

interface InternNavbarProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onFindJob?: () => void
}

export default function InternNavbar({ searchQuery, onSearchChange, onFindJob }: InternNavbarProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const isFindCompaniesPage = pathname?.includes('/find-companies')
  const isMessagesPage = pathname?.includes('/messages')
  const [userData, setUserData] = useState<{ displayName?: string; email?: string } | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [localSearchQuery, setLocalSearchQuery] = useState('')

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
      const savedData = localStorage.getItem('internProfileData')
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
      if (e.key === 'internProfileData') {
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
    if (!name) return 'I'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearchQuery(searchQuery)
    }
  }, [searchQuery])

  const currentSearchQuery = searchQuery !== undefined ? searchQuery : localSearchQuery
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    if (onSearchChange) {
      onSearchChange(value)
    }
  }

  const handleFindJob = () => {
    if (onFindJob) {
      onFindJob()
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8 flex-1">
            <div>
              <Link href="/intern/profile" className="text-2xl font-semibold tracking-tight" style={{ color: '#0273B1' }}>
                CompanyHub
              </Link>
            </div>
            <div className="hidden md:flex space-x-6">
              <Link
                href="/intern/find-companies"
                className="font-medium pb-1 transition-colors"
                style={{ color: isFindCompaniesPage ? '#0273B1' : '#A9B4CD' }}
                onMouseEnter={(e) => {
                  if (!isFindCompaniesPage) {
                    e.currentTarget.style.color = '#0273B1'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFindCompaniesPage) {
                    e.currentTarget.style.color = '#A9B4CD'
                  }
                }}
              >
                Find Companies
              </Link>
              <Link
                href="/intern/messages"
                className="font-medium pb-1 transition-colors relative"
                style={{ color: isMessagesPage ? '#0273B1' : '#A9B4CD' }}
                onMouseEnter={(e) => {
                  if (!isMessagesPage) {
                    e.currentTarget.style.color = '#0273B1'
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
            </div>
            {isFindCompaniesPage && (
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <input
                    type="text"
                    value={currentSearchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFindJob()
                      }
                    }}
                    placeholder="What position are you looking for?"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            )}
            {isFindCompaniesPage && (
              <button
                onClick={handleFindJob}
                className="px-6 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
                style={{ backgroundColor: '#0273B1' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#025a8f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0273B1'
                }}
              >
                Find Job
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <Link
                    href="/intern/profile"
                    className="block w-10 h-10 rounded-full overflow-hidden cursor-pointer"
                  >
                    {profileData?.profileImage ? (
                      <img
                        src={profileData.profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#0273B1' }}
                      >
                        <span className="text-white font-semibold text-sm">
                          {getInitials(profileData?.fullName || userData?.displayName || userData?.email || 'I')}
                        </span>
                      </div>
                    )}
                  </Link>
                  {/* Dropdown indicator - small gray circle with arrow */}
                  <button
                    className="absolute bottom-0 right-0 w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors z-10"
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
                    href="/intern/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    href="/intern/applied"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Applied
                  </Link>
                  <Link
                    href="/intern/bookmark"
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
                          localStorage.removeItem('user')
                          localStorage.removeItem('internProfileData')
                          localStorage.removeItem('internConversations')
                          localStorage.removeItem('savedJobs')
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
