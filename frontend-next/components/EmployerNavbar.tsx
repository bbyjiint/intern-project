'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import ThemedCompanyHubLogo from '@/components/ThemedCompanyHubLogo'
import ThemeToggle from '@/components/ThemeToggle'
import ReportBugModal from './ReportBugModal'

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
  const [isBugModalOpen, setIsBugModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ✅ แปลง path รูปให้เป็น URL เต็ม
  const resolveImageUrl = (image?: string) => {
    if (!image) return null
    if (image.startsWith('http')) return image
    return `http://localhost:5001${image}`
  }

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await apiFetch<{ user: { displayName?: string; email?: string } }>('/api/auth/me')
        setUserData(data.user)
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    }

    // ✅ โหลดจาก API โดยตรง เหมือน intern
    const loadProfileData = async () => {
      try {
        const data = await apiFetch<{ profile: any }>('/api/companies/profile')
        if (data?.profile) {
          const minimal = {
            companyName: data.profile.companyName,
            profileImage: data.profile.profileImage,
          }
          setProfileData(minimal)
          localStorage.setItem('employerProfileData', JSON.stringify(minimal))
        }
      } catch (error) {
        // fallback ไป localStorage ถ้า API ล้มเหลว
        const savedData = localStorage.getItem('employerProfileData')
        if (savedData) {
          try {
            setProfileData(JSON.parse(savedData))
          } catch (e) {
            console.error('Failed to parse profile data:', e)
          }
        }
      }
    }

    loadUserData()
    loadProfileData()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'employerProfileData') {
        const savedData = localStorage.getItem('employerProfileData')
        if (savedData) {
          try { setProfileData(JSON.parse(savedData)) } catch {}
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)

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

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await apiFetch<{ unreadCount: number }>('/api/messages/unread-count')
        setUnreadCount(data.unreadCount)
      } catch (error) {}
    }
    fetchUnreadCount()
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

  const displayName = profileData?.companyName || userData?.displayName || userData?.email || 'C'
  const profileImageUrl = resolveImageUrl(profileData?.profileImage)

  const handleOpenCreateJobPost = () => {
    if (typeof window !== 'undefined' && isJobPostPage) {
      window.dispatchEvent(new CustomEvent('openCreateJobPostModal'))
      return
    }
    router.push('/employer/job-post?create=1')
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="layout-container">
        <div className="flex h-[76px] items-center justify-between">
          <div className="flex items-center gap-12 xl:gap-20">
            <ThemedCompanyHubLogo href="/employer/dashboard" />
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/employer/find-candidates"
                className={`font-semibold text-[15px] transition-colors ${
                  isFindCandidatesPage 
                  ? 'text-[#0273B1]' 
                  : 'text-[#94A3B8] dark:text-gray-400 hover:text-[#0273B1] dark:hover:text-[#0273B1]'
                }`}
              >
                Find Candidates
              </Link>
              <Link
                href="/employer/messages"
                className={`font-semibold text-[15px] transition-colors relative ${
                  isMessagesPage 
                  ? 'text-[#0273B1]' 
                  : 'text-[#94A3B8] dark:text-gray-400 hover:text-[#0273B1] dark:hover:text-[#0273B1]'
                }`}
              >
                Message
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-6 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setIsBugModalOpen(true)}
                className="font-semibold text-[15px] transition-colors text-[#A9B4CD] dark:text-gray-500 hover:text-[#0273B1] dark:hover:text-[#0273B1]"
              >
                Report bug
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleOpenCreateJobPost}
              className="flex items-center space-x-2 rounded-[10px] bg-[#E3F5FF] px-4 py-2.5 text-sm font-semibold text-[#0273B1] transition-colors hover:bg-[#0273B1] hover:text-white dark:bg-gray-800 dark:text-white dark:hover:bg-[#0273B1]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Job Post</span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <div className="relative cursor-pointer" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                  <Link
                    href="/employer/profile"
                    className="block h-full w-full bg-slate-100 dark:bg-slate-800"
                  >
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const parent = e.currentTarget.parentElement
                          if (parent) {
                            parent.classList.add('flex', 'items-center', 'justify-center')
                            parent.style.backgroundColor = '#0273B1'
                            parent.innerHTML = `<span class="text-white font-semibold text-sm">${getInitials(displayName)}</span>`
                          }
                        }}
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: '#0273B1' }}
                      >
                        <span className="text-white font-semibold text-sm">
                          {getInitials(displayName)}
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#E2E8F0] dark:bg-gray-700 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-2.5 h-2.5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <Link
                    href="/employer/profile"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    href="/employer/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Applicants
                  </Link>
                  <Link
                    href="/employer/job-post"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Job Post
                  </Link>
                  <Link
                    href="/employer/bookmark"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Bookmark
                  </Link>
                  <div className="my-1 border-t border-slate-200 dark:border-slate-700"></div>
                  <button
                    onClick={() => {
                      ;(async () => {
                        try {
                          await apiFetch(`/api/auth/logout`, { method: 'POST' })
                        } catch {
                        } finally {
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
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
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
      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />
    </nav>
  )
}