'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import ThemedCompanyHubLogo from '@/components/ThemedCompanyHubLogo'
import ReportBugModal from './ReportBugModal'
import ThemeToggle from './ThemeToggle' // 1. Import ThemeToggle

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
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

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

    const loadProfileData = async () => {
      try {
        const data = await apiFetch<{ profile: any }>('/api/candidates/profile')
        if (data?.profile) {
          const profile = data.profile
          const minimal = {
            fullName: profile.fullName,
            profileImage: profile.profileImage,
          }
          setProfileData(minimal)
          localStorage.setItem('internProfileData', JSON.stringify(minimal))
        }
      } catch (error) {
        const savedData = localStorage.getItem('internProfileData')
        if (savedData) {
          try { setProfileData(JSON.parse(savedData)) } catch (e) {}
        }
      }
    }

    loadUserData()
    loadProfileData()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'internProfileData') {
        const savedData = localStorage.getItem('internProfileData')
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
    if (!name) return 'I'
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const displayName = profileData?.fullName || userData?.displayName || userData?.email || 'I'
  const profileImageUrl = resolveImageUrl(profileData?.profileImage)

  return (
    // 2. ปรับแต่ง Nav Background & Border
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="layout-container">
        <div className="flex justify-between items-center h-[76px]">

          {/* LEFT SECTION */}
          <div className="flex items-center gap-12 xl:gap-20">
            <ThemedCompanyHubLogo href="/intern/profile" />
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/intern/find-companies"
                // 3. ปรับสี Text Link
                className={`font-semibold text-[15px] transition-colors ${
                  isFindCompaniesPage 
                  ? 'text-[#0273B1]' 
                  : 'text-[#94A3B8] dark:text-gray-400 hover:text-[#0273B1] dark:hover:text-[#0273B1]'
                }`}
              >
                Find Companies
              </Link>
              <Link
                href="/intern/messages"
                className={`font-semibold text-[15px] transition-colors relative ${
                  isMessagesPage 
                  ? 'text-[#0273B1]' 
                  : 'text-[#94A3B8] dark:text-gray-400 hover:text-[#0273B1] dark:hover:text-[#0273B1]'
                }`}
              >
                Message
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-5 bg-red-500 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsBugModalOpen(true)}
                className="font-semibold text-[15px] transition-colors text-[#A9B4CD] dark:text-gray-500 hover:text-[#0273B1] dark:hover:text-[#0273B1]"
              >
                Report bug
              </button>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-6">
            {/* 4. เพิ่ม ThemeToggle ตรงนี้ */}
            <ThemeToggle />

            <div className="relative" ref={dropdownRef}>
              <div
                className="relative cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          parent.classList.add('bg-[#0273B1]', 'flex', 'items-center', 'justify-center')
                          parent.innerHTML = `<span class="text-white font-semibold text-sm">${getInitials(displayName)}</span>`
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0273B1]">
                      <span className="text-white font-semibold text-sm">
                        {getInitials(displayName)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#E2E8F0] dark:bg-gray-700 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-2.5 h-2.5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Dropdown Menu - 5. ปรับสี Dropdown ให้รองรับ Dark Mode */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">
                  <Link
                    href="/intern/profile"
                    className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    href="/intern/applied"
                    className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Applied
                  </Link>
                  <Link
                    href="/intern/bookmark"
                    className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Bookmark
                  </Link>

                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>

                  <button
                    onClick={() => {
                      ;(async () => {
                        try {
                          await apiFetch(`/api/auth/logout`, { method: 'POST' })
                        } catch {
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
                    className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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