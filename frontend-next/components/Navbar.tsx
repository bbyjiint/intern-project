'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import ThemedCompanyHubLogo from './ThemedCompanyHubLogo'
import { Menu, X } from 'lucide-react'

interface NavbarProps {
  onLoginClick?: () => void
  onRegisterClick?: () => void 
}

export default function Navbar({ onLoginClick, onRegisterClick }: NavbarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname?.startsWith(path)
  }

  const navLinks = [
    { name: 'Home', href: '/', disabled: false },
    { name: 'About', href: '/about', disabled: true },
    { name: 'Contact', href: '/contact', disabled: true },
  ]

  return (
    <nav className="border-b border-gray-100 bg-white transition-colors dark:border-[#223A57] dark:bg-[#0B1C2C] sticky top-0 z-50">
      <div className="layout-container">
        <div className="flex h-20 items-center justify-between">
          <ThemedCompanyHubLogo href="/" className="max-w-[170px] sm:max-w-none" />

          {/* Desktop Menu */}
          <div className="hidden items-center space-x-6 md:flex">
            {navLinks.map((link) => (
              link.disabled ? (
                <span key={link.href} className="nav-link cursor-default" aria-disabled="true">
                  {link.name === 'About' ? 'About Us' : link.name}
                </span>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive(link.href) ? 'nav-link-active' : ''}`}
                >
                  {link.name}
                </Link>
              )
            ))}
            <ThemeToggle />
            <button
              onClick={onLoginClick}
              className="nav-button px-5 py-2.5 text-xs font-semibold tracking-wide"
            >
              LOG IN
            </button>
          </div>

          {/* Mobile Right Icons */}
          <div className="flex shrink-0 items-center space-x-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-[#1C2D4F] dark:text-white outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Expandable Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[500px] opacity-100 border-t border-gray-100 dark:border-[#223A57]' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col space-y-5 px-6 py-8 bg-white dark:bg-[#0B1C2C]">
            {navLinks.map((link) => (
              link.disabled ? (
                <span
                  key={link.href}
                  className="text-lg font-medium text-[#4A5568] dark:text-[#A9B4CD] cursor-default"
                  aria-disabled="true"
                >
                  {link.name === 'About' ? 'About Us' : link.name}
                </span>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium transition-colors ${
                    isActive(link.href) 
                      ? 'text-[#2F80ED]' 
                      : 'text-[#4A5568] dark:text-[#A9B4CD] hover:text-[#2F80ED]'
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}

            <div className="h-[1px] w-full bg-gray-100 dark:bg-[#223A57] my-2" />

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  onLoginClick?.();
                  setIsOpen(false);
                }}
                className="w-full py-3.5 rounded-lg font-semibold text-white transition-all active:scale-[0.98]"
                style={{ backgroundColor: '#2F80ED' }}
              >
                Login
              </button>
              
              <button
                onClick={() => {
                  onRegisterClick?.(); // เรียกฟังก์ชันเปิด Register Modal โดยตรง
                  setIsOpen(false);
                }}
                className="w-full py-3.5 rounded-lg font-semibold border-2 transition-all active:scale-[0.98] border-[#2F80ED] text-[#2F80ED]"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}