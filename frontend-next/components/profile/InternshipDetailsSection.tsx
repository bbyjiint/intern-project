'use client'

import { InternshipDetails } from '@/hooks/useProfile'

interface InternshipDetailsSectionProps {
  details: InternshipDetails | undefined
  onEdit: () => void
}

export default function InternshipDetailsSection({ details, onEdit }: InternshipDetailsSectionProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Internship Details
        </h2>
        <button
          onClick={onEdit}
          className="px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-colors"
          style={{ 
            borderColor: '#0273B1',
            color: '#0273B1',
            backgroundColor: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F0F4F8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
          }}
        >
          Edit
        </button>
      </div>

      {!details || (!details.desiredPosition && !details.availableStartDate && !details.motivation) ? (
        <p className="text-gray-400 italic py-4">No internship details provided.</p>
      ) : (
        <div className="space-y-3 text-gray-700">
          {details.desiredPosition && (
            <div>
              <span className="font-medium">Desired Position:</span> {details.desiredPosition}
            </div>
          )}
          {(details.availableStartDate || details.availableEndDate) && (
            <div>
              <span className="font-medium">Available Period:</span>{' '}
              {formatDate(details.availableStartDate)} - {formatDate(details.availableEndDate)}
            </div>
          )}
          {details.motivation && (
            <div>
              <span className="font-medium">Motivation:</span>
              <p className="mt-1">{details.motivation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
