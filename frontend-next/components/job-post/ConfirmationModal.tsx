'use client'

interface ConfirmationModalProps {
  onKeepEditing: () => void
  onPost: () => void
}

export default function ConfirmationModal({ onKeepEditing, onPost }: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <p className="text-gray-700 mb-2 text-center">Once this post is published, it can no longer be edited.</p>
        <p className="text-gray-700 mb-6 font-medium text-center">Do you want to publish it?</p>
        
        <div className="flex gap-4">
          <button
            onClick={onKeepEditing}
            className="flex-1 flex items-center justify-center px-6 py-3 border-2 rounded-lg font-semibold text-sm transition-colors"
            style={{ borderColor: '#0273B1', color: '#0273B1' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F0F4F8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Keep Editing
          </button>
          <button
            onClick={onPost}
            className="flex-1 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
            style={{ backgroundColor: '#0273B1' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#025a8f'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0273B1'
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
