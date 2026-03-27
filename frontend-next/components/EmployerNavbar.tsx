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
  const [userData, setUserData] = useState<{ displayName?: string; email?: string } | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isBugModalOpen, setIsBugModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const resolveImageUrl = (image?: string) => {
    if (!image) return null
    if (image.startsWith('http')) return image
    return `http://localhost:5000${image}`
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

  useEffect(() => {
    setShowDropdown(false)
  }, [pathname])

  const handleLogout = async () => {
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
  }

  const getInitials = (name: string) => {
    if (!name) return 'C'
    return name.charAt(0).toUpperCase()
  }

  const displayName = profileData?.companyName || userData?.displayName || userData?.email || 'C'
  const profileImageUrl = resolveImageUrl(profileData?.profileImage)

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
        <div className="layout-container px-4 sm:px-6">
          <div className="flex h-[76px] items-center justify-between">
            <div className="ml-2 flex items-center gap-4 lg:gap-12 xl:gap-20">
              <ThemedCompanyHubLogo href="/employer/find-candidates" />

              <div className="hidden items-center gap-8 md:flex">
                <Link
                  href="/employer/find-candidates"
                  className={`text-[15px] font-semibold transition-colors ${
                    isFindCandidatesPage
                      ? 'text-[#0273B1]'
                      : 'text-[#94A3B8] hover:text-[#0273B1] dark:text-gray-400 dark:hover:text-[#0273B1]'
                  }`}
                >
                  Find Candidates
                </Link>
                <Link
                  href="/employer/messages"
                  className={`relative text-[15px] font-semibold transition-colors ${
                    isMessagesPage
                      ? 'text-[#0273B1]'
                      : 'text-[#94A3B8] hover:text-[#0273B1] dark:text-gray-400 dark:hover:text-[#0273B1]'
                  }`}
                >
                  Message
                  {unreadCount > 0 && (
                    <span className="absolute -right-5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => setIsBugModalOpen(true)}
                  className="text-[15px] font-semibold text-[#A9B4CD] transition-colors hover:text-[#0273B1] dark:text-gray-500 dark:hover:text-[#0273B1]"
                >
                  Report bug
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              {process.env.NODE_ENV === 'development' && (
                <Link
                  href="/employer/profile-setup"
                  className="hidden shrink-0 items-center rounded-[10px] border border-dashed border-[#0273B1]/50 bg-[#E3F5FF]/80 px-2 py-1.5 text-[11px] font-semibold text-[#0273B1] transition-colors hover:bg-[#0273B1] hover:text-white dark:border-[#0273B1]/40 dark:bg-slate-800/80 dark:text-[#7dd3fc] dark:hover:bg-[#0273B1] dark:hover:text-white sm:inline-flex sm:px-3 sm:text-xs"
                  title="Dev only: return to company profile setup"
                >
                  Company setup
                </Link>
              )}
              <ThemeToggle />

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="relative border-0 bg-transparent p-0"
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700 sm:h-11 sm:w-11">
                    <div className="block h-full w-full bg-slate-100 dark:bg-slate-800">
                      {profileImageUrl ? (
                        <img
                          src={profileImageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const parent = e.currentTarget.parentElement
                            if (parent) {
                              parent.classList.add('flex', 'items-center', 'justify-center')
                              parent.style.backgroundColor = '#0273B1'
                              parent.innerHTML = `<span class="text-white font-semibold text-xs sm:text-sm">${getInitials(displayName)}</span>`
                            }
                          }}
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center rounded-full"
                          style={{ backgroundColor: '#0273B1' }}
                        >
                          <span className="text-xs font-semibold text-white sm:text-sm">{getInitials(displayName)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pointer-events-none absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-[#E2E8F0] shadow-sm dark:border-gray-900 dark:bg-gray-700">
                    <svg className="h-2 w-2 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 z-50 mt-3 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <Link
                      href="/employer/profile"
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/employer/dashboard"
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      Applicants
                    </Link>
                    <Link
                      href="/employer/job-post"
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      Job Post
                    </Link>
                    <Link
                      href="/employer/bookmark"
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      Bookmark
                    </Link>
                    <div className="my-1 h-px bg-gray-100 dark:bg-gray-700" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <ReportBugModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
    </>
  )
}
