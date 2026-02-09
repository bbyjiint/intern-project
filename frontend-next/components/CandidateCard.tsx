interface CandidateCardProps {
  name: string
  role: string
  university: string
  major: string
  graduationDate: string
  skills: string[]
  initials: string
  variant?: string
  isBookmarked?: boolean
  onBookmark?: (e: React.MouseEvent) => void
  onClick?: () => void
}

export default function CandidateCard({
  name,
  role,
  university,
  major,
  graduationDate,
  skills,
  initials,
  isBookmarked = false,
  onBookmark,
  onClick,
}: CandidateCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative cursor-pointer"
      onClick={onClick}
    >
      {/* Bookmark Icon */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onBookmark?.(e)
        }}
        className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors z-10"
        type="button"
      >
        <svg
          className={`w-5 h-5 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`}
          fill="none"
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
      </button>

      {/* Avatar */}
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
          {initials}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            {name}
          </h3>
          <p className="text-gray-600">{role}</p>
        </div>
      </div>

      {/* Education */}
      <div className="mb-4 space-y-1">
        <div className="flex items-center text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l9-5-9-5-9 5 9 5z"
            />
          </svg>
          <span className="text-sm">{university}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm">{major}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">{graduationDate}</span>
        </div>
      </div>

      {/* Skills */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              +{skills.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

