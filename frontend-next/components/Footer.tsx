import Link from 'next/link'
import ThemedCompanyHubLogo from './ThemedCompanyHubLogo'

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-800 text-white dark:bg-[#121212]">
      <div className="layout-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4">
              <ThemedCompanyHubLogo href="/" />
            </div>
            <p className="text-gray-400 dark:text-[#8ca2c0]">
              Recruiting platform for connecting employers and interns
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-gray-400 dark:text-[#a9b4cd]">
              <li>
                <Link href="/" className="transition-colors hover:text-white dark:hover:text-[#0273b1]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-white dark:hover:text-[#0273b1]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-white dark:hover:text-[#0273b1]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400 dark:text-[#8ca2c0]">Email: contact@companyhub.com</p>
            <p className="text-gray-400 dark:text-[#8ca2c0]">Tel: 02-123-4567</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400 dark:border-[#eff3fa]/20 dark:text-[#8ca2c0]">
          <p>&copy; 2024 CompanyHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

