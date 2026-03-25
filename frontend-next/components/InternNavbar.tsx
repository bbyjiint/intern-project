'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import ThemedCompanyHubLogo from '@/components/ThemedCompanyHubLogo'
import ReportBugModal from './ReportBugModal'
import ThemeToggle from './ThemeToggle'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // State สำหรับ Mobile Menu
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
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

  // ปิด Mobile Menu เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const getInitials = (name: string) => {
    if (!name) return 'I'
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const handleLogout = async () => {
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
  }

  const displayName = profileData?.fullName || userData?.displayName || userData?.email || 'I'
  const profileImageUrl = resolveImageUrl(profileData?.profileImage)

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="layout-container px-4 sm:px-6">
        <div className="flex justify-between items-center h-[76px]">
          
          {/* LEFT SECTION */}
          <div className="flex items-center gap-4 lg:gap-12 xl:gap-20">
            {/* Hamburger Menu (Mobile Only) */}
            <button 
              className="md:hidden p-2 text-gray-600 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>

            <ThemedCompanyHubLogo href="/intern/profile" />

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/intern/find-companies"
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
          <div className="flex items-center gap-3 sm:gap-6">
            <ThemeToggle />

            <div className="relative" ref={dropdownRef}>
              <div
                className="relative cursor-pointer"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
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
                          parent.innerHTML = `<span class="text-white font-semibold text-xs sm:text-sm">${getInitials(displayName)}</span>`
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0273B1]">
                      <span className="text-white font-semibold text-xs sm:text-sm">
                        {getInitials(displayName)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#E2E8F0] dark:bg-gray-700 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-2 h-2 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Desktop Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">
                  <Link href="/intern/profile" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setShowDropdown(false)}>
                    Profile
                  </Link>
                  <Link href="/intern/applied" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setShowDropdown(false)}>
                    Applied
                  </Link>
                  <Link href="/intern/bookmark" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setShowDropdown(false)}>
                    Bookmark
                  </Link>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                  <button onClick={handleLogout} className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MENU PANEL */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-3 shadow-inner">
          <Link href="/intern/find-companies" className={`block px-4 py-2 rounded-lg font-semibold ${isFindCompaniesPage ? 'bg-blue-50 dark:bg-blue-900/20 text-[#0273B1]' : 'text-gray-600 dark:text-gray-400'}`}>
            Find Companies
          </Link>
          <Link href="/intern/messages" className={`flex justify-between items-center px-4 py-2 rounded-lg font-semibold ${isMessagesPage ? 'bg-blue-50 dark:bg-blue-900/20 text-[#0273B1]' : 'text-gray-600 dark:text-gray-400'}`}>
            Message
            {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>}
          </Link>
          <button onClick={() => { setIsBugModalOpen(true); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-400 font-semibold">
            Report bug
          </button>
        </div>
      )}

      <ReportBugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />
    </nav>
  )
}