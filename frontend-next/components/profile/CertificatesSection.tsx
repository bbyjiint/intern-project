'use client'

import { Certificate } from '@/hooks/useProfile'

interface CertificatesSectionProps {
  certificates: Certificate[]
  onAdd: () => void
  onEdit: (id: string) => void
}

export default function CertificatesSection({ certificates, onAdd, onEdit }: CertificatesSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>
          Certificates / Awards
        </h2>
        <button
          onClick={onAdd}
          className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
          style={{ backgroundColor: '#0273B1' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#025a8f'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0273B1'
          }}
        >
          + Add Certificate
        </button>
      </div>

      {certificates.length === 0 ? (
        <p className="text-gray-400 italic py-4">No certificates or awards provided.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="border border-gray-200 rounded-lg p-4 relative group">
              {cert.url ? (
                <img
                  src={cert.url}
                  alt={cert.name}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
              <h4 className="font-semibold text-gray-900 mb-1">{cert.name}</h4>
              {cert.description && (
                <p className="text-sm text-gray-600">{cert.description}</p>
              )}
              <button
                onClick={() => onEdit(cert.id)}
                className="absolute top-2 right-2 px-3 py-1 rounded-lg font-semibold text-xs border-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ 
                  borderColor: '#0273B1',
                  color: '#0273B1',
                  backgroundColor: 'white'
                }}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
