import { useState } from 'react'
import EmployerNavbar from '../components/EmployerNavbar'
import CandidateCard from '../components/CandidateCard'
import CandidateProfileModal from '../components/CandidateProfileModal'

const mockCandidates = [
  {
    name: 'Alex Patel',
    role: 'Data Science Intern',
    university: 'Georgia Tech',
    major: 'Data Science',
    graduationDate: 'Aug 2024',
    skills: ['Python', 'TensorFlow', 'Deep Learning', 'SQL'],
    initials: 'AP',
    email: 'alex.patel@company.com',
    about:
      'Passionate data science intern with expertise in machine learning and deep learning. Experienced in building predictive models and analyzing large datasets.',
  },
  {
    name: 'Amanda Wong',
    role: 'UX Design Intern',
    university: 'Stanford University',
    major: 'Design',
    graduationDate: 'Apr 2024',
    skills: ['Adobe XD', 'UI Design', 'Wireframing', 'Figma'],
    initials: 'AW',
    email: 'amanda.wong@company.com',
    about:
      'Creative UX design intern focused on creating intuitive and user-friendly interfaces. Passionate about design thinking and user research.',
  },
  {
    name: 'David Kim',
    role: 'Software Engineering Intern',
    university: 'UCLA',
    major: 'Engineering',
    graduationDate: 'Jan 2025',
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
    initials: 'DK',
    email: 'david.kim@company.com',
    about:
      'Software engineering intern specializing in backend development and cloud infrastructure. Experienced with microservices architecture.',
  },
  {
    name: 'Emily Chen',
    role: 'Data Science Intern',
    university: 'Stanford University',
    major: 'Data Science',
    graduationDate: 'Jun 2024',
    skills: ['Python', 'R', 'Machine Learning', 'Pandas'],
    initials: 'EC',
    email: 'emily.chen@company.com',
    about:
      'Data science intern with strong analytical skills and experience in statistical modeling. Passionate about turning data into actionable insights.',
  },
  {
    name: 'Jessica Martinez',
    role: 'Marketing Intern',
    university: 'University of Washington',
    major: 'Marketing',
    graduationDate: 'May 2024',
    skills: ['Content Marketing', 'SEO', 'Social Media', 'Analytics'],
    initials: 'JM',
    email: 'jessica.martinez@company.com',
    about:
      'Marketing intern with expertise in digital marketing and content strategy. Experienced in SEO optimization and social media management.',
  },
  {
    name: 'John Smith',
    role: 'Software Engineering Intern',
    university: 'UC Berkeley',
    major: 'Engineering',
    graduationDate: 'Jan 2024',
    skills: ['Python', 'JavaScript', 'React', 'Node.js'],
    initials: 'JS',
    email: 'john.smith@company.com',
    about:
      'Passionate software engineering intern focused on full-stack development. Eager to learn modern web technologies and contribute to impactful projects.',
  },
]

export default function EmployerDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [position, setPosition] = useState('All Positions')
  const [university, setUniversity] = useState('All Universities')
  const [department, setDepartment] = useState('All Departments')
  const [bookmarkedCandidates, setBookmarkedCandidates] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState('Name')
  const [viewMode, setViewMode] = useState<'all' | 'shortlist'>('all')
  const [selectedCandidate, setSelectedCandidate] = useState<typeof mockCandidates[0] | null>(null)

  const handleBookmark = (e: React.MouseEvent, name: string) => {
    e.stopPropagation() // Prevent card click when clicking bookmark
    const newBookmarks = new Set(bookmarkedCandidates)
    if (newBookmarks.has(name)) {
      newBookmarks.delete(name)
    } else {
      newBookmarks.add(name)
    }
    setBookmarkedCandidates(newBookmarks)
  }

  const handleCardClick = (candidate: typeof mockCandidates[0]) => {
    setSelectedCandidate(candidate)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setPosition('All Positions')
    setUniversity('All Universities')
    setDepartment('All Departments')
  }

  const filteredCandidates = mockCandidates.filter((candidate) => {
    // Filter by shortlist if in shortlist mode
    if (viewMode === 'shortlist' && !bookmarkedCandidates.has(candidate.name)) {
      return false
    }

    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      )
    const matchesPosition = position === 'All Positions' || candidate.role.includes(position)
    const matchesUniversity =
      university === 'All Universities' || candidate.university === university
    const matchesDepartment =
      department === 'All Departments' || candidate.major.includes(department)

    return matchesSearch && matchesPosition && matchesUniversity && matchesDepartment
  })

  // Sort candidates
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'Name') {
      return a.name.localeCompare(b.name)
    } else if (sortBy === 'University') {
      return a.university.localeCompare(b.university)
    } else if (sortBy === 'Position') {
      return a.role.localeCompare(b.role)
    }
    return 0
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployerNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Candidates</h1>

          {/* Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skills, or keywords..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-10"
              >
                <option>All Positions</option>
                <option>Data Science Intern</option>
                <option>UX Design Intern</option>
                <option>Software Engineering Intern</option>
                <option>Marketing Intern</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-10"
              >
                <option>All Universities</option>
                <option>Georgia Tech</option>
                <option>Stanford University</option>
                <option>UCLA</option>
                <option>UC Berkeley</option>
                <option>University of Washington</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white pr-10"
              >
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>Data Science</option>
                <option>Marketing</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="border-t border-blue-200 pt-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg font-medium text-gray-700">
              {filteredCandidates.length} candidates found
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  viewMode === 'all'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Show All
              </button>
              <button
                onClick={() => setViewMode('shortlist')}
                className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center space-x-2 ${
                  viewMode === 'shortlist'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill={viewMode === 'shortlist' ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <span>Shortlist</span>
              </button>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm appearance-none pr-8"
                >
                  <option>Sort by Name</option>
                  <option>Sort by University</option>
                  <option>Sort by Position</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Cards Grid */}
          {sortedCandidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.name}
                  {...candidate}
                  isBookmarked={bookmarkedCandidates.has(candidate.name)}
                  onBookmark={(e) => handleBookmark(e, candidate.name)}
                  onClick={() => handleCardClick(candidate)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {viewMode === 'shortlist'
                  ? 'No candidates in your shortlist yet. Bookmark candidates to add them to your shortlist.'
                  : 'No candidates found matching your criteria.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}

