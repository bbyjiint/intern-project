'use client'

import { useState } from 'react'
import Link from 'next/link'
import CertificatesModal from './CertificatesModal' // ตรวจสอบ path ให้ถูกต้อง

export interface Certificate {
  id: string
  name: string // เปลี่ยนจาก title เป็น name ตาม interface ใหม่ที่คุณให้มา
  issuedBy: string
  date: string
  description: string
  tags: string[]
  url?: string
}

export default function CertificateSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentCert, setCurrentCert] = useState<Certificate | null>(null)
  
  // ข้อมูลเริ่มต้น (ตัวอย่าง)
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      name: 'UI/UX Design Fundamentals',
      issuedBy: 'Interaction Design Foundation',
      date: '18 January 2024',
      description: 'Completed foundational training in user interface and user experience design, covering design thinking, user research, wireframing, prototyping, usability testing, and Figma fundamentals.',
      tags: ['UI Design', 'UX Design', 'Wireframing', 'Prototyping']
    }
  ]);

  // เปิด Modal สำหรับเพิ่มใหม่
  const handleAddNew = () => {
    setCurrentCert(null)
    setIsModalOpen(true)
  }

  // เปิด Modal สำหรับแก้ไข
  const handleEdit = (cert: Certificate) => {
    setCurrentCert(cert)
    setIsModalOpen(true)
  }

  // ลบ Certificate
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this certificate?')) {
      setCertificates(certificates.filter(c => c.id !== id))
    }
  }

  // บันทึกข้อมูลจาก Modal
  const handleSave = (data: any) => {
    if (currentCert) {
      // กรณีแก้ไข
      setCertificates(certificates.map(c => c.id === currentCert.id ? { ...data, id: c.id } : c))
    } else {
      // กรณีเพิ่มใหม่
      const newCert = { ...data, id: Date.now().toString() }
      setCertificates([newCert, ...certificates])
    }
    setIsModalOpen(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <div className="text-blue-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1C2D4F]">Certificates</h2>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
        >
          + Add Certificate
        </button>
      </div>

      {/* List of Certificates */}
      <div className="space-y-6">
        {certificates.length === 0 ? (
          <p className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-xl border-2 border-dashed">
            No certificates added yet.
          </p>
        ) : (
          certificates.map((cert) => (
            <div key={cert.id} className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {cert.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                    <span className="font-medium text-gray-700">{cert.issuedBy}</span>
                    <span className="text-gray-300">|</span>
                    <span>{cert.date}</span>
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5 max-w-3xl">
                    {cert.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {cert.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold border border-blue-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end items-center space-x-3 mt-4 pt-4 border-t border-gray-50">
                <button 
                  onClick={() => handleDelete(cert.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button className="px-5 py-1.5 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                  View File
                </button>
                <button 
                  onClick={() => handleEdit(cert)}
                  className="px-5 py-1.5 bg-white border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
                >
                  Edit Certificate
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All Link */}
      {certificates.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-50">
          <Link 
            href="/intern/certificates" 
            className="text-blue-600 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all"
          >
            <span>View all certificates</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}

      {/* Modal */}
      <CertificatesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingCertificate={currentCert}
      />
    </div>
  )
}