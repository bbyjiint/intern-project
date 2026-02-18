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
  matchScore?: number
  matchLabel?: string
  // New props for the design
  internshipPeriod?: string
  workType?: string
  year?: string | number
  province?: string
  onResumeAnalysis?: () => void
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
  matchScore,
  matchLabel = 'AI Matching Score',
  internshipPeriod = '2 March 2026 - 26 Feb 2027 (12 เดือน)',
  workType = 'สหกิจ',
  year = '4',
  province = 'กรุงเทพ',
  onResumeAnalysis,
}: CandidateCardProps) {
  const showMatch = typeof matchScore === 'number' && !Number.isNaN(matchScore)
  const isHighMatch = showMatch && matchScore >= 80
  
  const matchColorClasses = isHighMatch
      ? 'bg-green-500 text-white' // Solid green for high match based on image style (looks like filled pill)
      : 'bg-yellow-500 text-white' // Solid yellow/orange

  // If the image uses outlined/light style, let's adjust. 
  // Image shows: Green background with white text for 84%. Orange background for 64%.
  // So 'bg-green-500 text-white' is correct.

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative cursor-pointer"
      onClick={onClick}
    >
      {/* Header with Avatar and Resume Analysis Button */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
            ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'][name.length % 4]
          }`}>
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{name}</h3>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onResumeAnalysis?.()
          }}
          className="flex items-center space-x-1 px-2 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Resume Analysis</span>
        </button>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 mb-6 text-sm">
        <span className="text-gray-500 font-normal">ช่วงฝึกงาน</span>
        <span className="text-gray-900 font-medium">{internshipPeriod}</span>

        <span className="text-gray-500 font-normal">รูปแบบฝึกงาน</span>
        <span className="text-gray-900 font-medium">{workType}</span>

        <span className="text-gray-500 font-normal">ชั้นปี</span>
        <span className="text-gray-900 font-medium">{year}</span>

        <span className="text-gray-500 font-normal">สาขาวิชา</span>
        <span className="text-gray-900 font-medium">{major}</span>

        <span className="text-gray-500 font-normal">จังหวัดที่สนใจ</span>
        <span className="text-gray-900 font-medium">{province}</span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {skills.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
          >
            {skill}
          </span>
        ))}
        {skills.length > 3 && (
          <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-md text-xs font-medium border border-gray-200">
            +{skills.length - 3} more
          </span>
        )}
      </div>

      {/* Footer / Match Score */}
      {showMatch && (
        <div className="flex justify-end">
          <span
            className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold shadow-sm ${matchColorClasses}`}
          >
            <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            {matchLabel} {Math.round(matchScore!)}%
          </span>
        </div>
      )}
    </div>
  )
}

