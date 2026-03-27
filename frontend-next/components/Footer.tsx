import Link from 'next/link'
import ThemedCompanyHubLogo from './ThemedCompanyHubLogo'

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-800 text-white dark:bg-[#1A2E44]">
      <div className="layout-container py-7">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
           <div className="mb-4 dark">
            <ThemedCompanyHubLogo href="/" />
           </div>
            <p className="max-w-[280px] text-sm leading-6 text-gray-400 dark:text-[#B0B8C1]">
              Recruiting platform for connecting employers and interns
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Links</h3>
            <ul className="space-y-2 text-sm text-gray-400 dark:text-[#B0B8C1]">
              <li>
                <Link href="/" className="transition-colors hover:text-white dark:hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-white dark:hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-white dark:hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact</h3>
            <p className="text-sm text-gray-400 dark:text-[#B0B8C1]">Email: contact@companyhub.com</p>
            <p className="text-sm text-gray-400 dark:text-[#B0B8C1]">Tel: 02-123-4567</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400 dark:border-[#223A57] dark:text-[#B0B8C1]">
          <p>&copy; 2024 CompanyHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

