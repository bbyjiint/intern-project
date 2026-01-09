import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              CompanyHub
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                to="/"
                className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
              >
                Find Candidates
              </Link>
              <Link
                to="/messages"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Messages
              </Link>
            </div>
          </div>
          <div>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}


