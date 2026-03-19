'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import ThemedCompanyHubLogo from './ThemedCompanyHubLogo'

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
    <nav className="border-b border-gray-100 bg-white transition-colors dark:border-[#223A57] dark:bg-[#0B1C2C]">
      <div className="layout-container">
        <div className="flex justify-between items-center h-20">
          <ThemedCompanyHubLogo href="/" />
          <div className="hidden items-center space-x-6 md:flex">
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
              className="nav-button px-5 py-2.5 text-xs font-semibold tracking-wide"
            >
              LOG IN
            </button>
          </div>
          {/* Mobile menu with theme toggle */}
          <div className="flex items-center space-x-4 md:hidden">
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

