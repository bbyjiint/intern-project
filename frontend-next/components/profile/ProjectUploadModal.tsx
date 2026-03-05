'use client'

import { useState, useEffect, useRef } from 'react'
import { Project } from '@/hooks/useProfile'

interface ProjectUploadModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  onUpdate: (id: string, data: any) => Promise<void>
}

export default function ProjectUploadModal({ isOpen, onClose, project, onUpdate }: ProjectUploadModalProps) {
  const [githubUrl, setGithubUrl] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  
  // สร้าง Ref สำหรับคลิกเลือกไฟล์
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (project) {
      setGithubUrl(project.githubUrl || '')
      setProjectUrl(project.projectUrl || '')
      setFile(null) // Reset file เมื่อเปลี่ยน project
    }
  }, [project, isOpen])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!project?.id) return
    setLoading(true)
    try {
      // Logic การจัดการไฟล์ (Mockup)
      let finalFileUrl = project.fileUrl || ''
      
      if (file) {
        // ในสถานการณ์จริง: อัปโหลด file ไปยัง Cloud Storage และรับ URL กลับมา
        // ตัวอย่าง: finalFileUrl = await uploadToS3(file)
        finalFileUrl = URL.createObjectURL(file) // ตัวอย่างเพื่อใช้แสดงผลชั่วคราว
      }

      await onUpdate(project.id, {
        ...project,
        githubUrl,
        projectUrl,
        fileUrl: finalFileUrl,
      })
      
      onClose()
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Upload Project Files</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          <p className="text-sm text-gray-500 -mt-2 italic">Add at least one project link or file (GitHub, project link, or file upload).</p>

          {/* GitHub Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">GitHub Repository URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="https://github.com/yourusername/project-name"
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">Verify</button>
            </div>
          </div>

          {/* Project Link Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Project Link</label>
            <input 
              type="text" 
              placeholder="Paste your project link (portfolio, case study, demo, etc.)"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
            />
          </div>

          {/* File Upload Zone */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Upload Project File</label>
            
            {/* ซ่อน Input จริง */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="hidden"
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group 
                ${file ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200 bg-gray-50 hover:bg-blue-50/50 hover:border-blue-200'}`}
            >
              <div className={`w-12 h-12 rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform 
                ${file ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}>
                {file ? (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                )}
              </div>
              
              <p className="font-bold text-gray-700">
                {file ? file.name : 'Drag and drop your file here'}
              </p>
              
              <button 
                type="button"
                className={`mt-2 px-6 py-2 rounded-lg font-bold text-sm transition-colors 
                  ${file ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white'}`}
              >
                {file ? 'Change File' : 'Select File'}
              </button>
              
              <p className="mt-3 text-xs text-gray-400">PDF or DOCX format. Max size: 5 MB</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t">
          <button 
            onClick={onClose} 
            className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={loading || (!githubUrl && !projectUrl && !file)}
            className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </div>
            ) : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}