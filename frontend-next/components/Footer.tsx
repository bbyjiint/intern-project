import Link from 'next/link'
import CompanyHubLogo from './CompanyHubLogo'

export default function Footer() {
  return (
    <footer className="text-white mt-auto border-t" style={{ backgroundColor: '#121212', borderColor: 'rgba(239, 243, 250, 0.2)' }}>
      <div className="layout-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4">
              <CompanyHubLogo href="/" />
            </div>
            <p style={{ color: '#8CA2C0' }}>
              Recruiting platform for connecting employers and interns
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2" style={{ color: '#8CA2C0' }}>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p style={{ color: '#8CA2C0' }}>Email: contact@companyhub.com</p>
            <p style={{ color: '#8CA2C0' }}>Tel: 02-123-4567</p>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center" style={{ borderColor: 'rgba(239, 243, 250, 0.2)', color: '#8CA2C0' }}>
          <p>&copy; 2024 CompanyHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

