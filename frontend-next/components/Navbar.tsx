import Link from 'next/link'

interface NavbarProps {
  onLoginClick?: () => void
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 xl:px-16">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-semibold tracking-tight" style={{ color: '#0273B1' }}>
              CompanyHub
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="nav-link"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="nav-link"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="nav-link"
            >
              Contact
            </Link>
            <button
              onClick={onLoginClick}
              className="nav-button"
            >
              LOG IN
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

