'use client'

import { InterestedCompany } from '@/hooks/useProfile'

interface InterestedCompaniesSectionProps {
  companies: InterestedCompany[]
}

export default function InterestedCompaniesSection({ companies }: InterestedCompaniesSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4" style={{ color: '#1C2D4F' }}>
        Interested Companies
      </h2>

      {companies.length === 0 ? (
        <p className="text-gray-400 italic py-4">No interested companies added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {companies.map((company) => (
            <span
              key={company.id}
              className="px-4 py-2 rounded-lg text-sm font-medium border-2"
              style={{ 
                borderColor: '#0273B1',
                color: '#0273B1',
                backgroundColor: 'white'
              }}
            >
              {company.companyName}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
