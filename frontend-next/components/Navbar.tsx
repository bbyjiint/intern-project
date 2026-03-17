'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import CompanyHubLogo from './CompanyHubLogo'

interface NavbarProps {
  onLoginClick?: () => void
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(path)
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="layout-container">
        <div className="flex justify-between items-center h-20">
          <CompanyHubLogo href="/" />
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`nav-link ${isActive('/about') ? 'nav-link-active' : ''}`}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className={`nav-link ${isActive('/contact') ? 'nav-link-active' : ''}`}
            >
              Contact
            </Link>
            <ThemeToggle />
            <button
              onClick={onLoginClick}
              className="nav-button"
            >
              LOG IN
            </button>
          </div>
          {/* Mobile menu with theme toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={onLoginClick}
              className="nav-button text-sm px-4 py-2"
            >
              LOG IN
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

