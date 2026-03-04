'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Certificate {
  id: string
  title: string
  issuedBy: string
  date: string
  description: string
  tags: string[]
}

export default function CertificateSection() {
  // ข้อมูลตัวอย่างตามรูปภาพ
  const certificates: Certificate[] = [
    {
      id: '1',
      title: 'UI/UX Design Fundamentals',
      issuedBy: 'Interaction Design Foundation',
      date: '18 January 2024',
      description: 'Completed foundational training in user interface and user experience design, covering design thinking, user research, wireframing, prototyping, usability testing, and Figma fundamentals. Developed practical skills in creating user-centered digital products.',
      tags: ['UI Design', 'UX Design', 'Wireframing', 'Prototyping']
    },
    // คุณสามารถเพิ่มข้อมูลเพิ่มที่นี่ หรือรับผ่าน Props
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="text-blue-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#1C2D4F' }}>Certificate</h2>
        </div>
        <button 
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          + Add Certificate
        </button>
      </div>

      {/* List of Certificates */}
      <div className="space-y-4">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-gray-50/50 border border-gray-100 rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{cert.title}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Issued by {cert.issuedBy} | {cert.date}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {cert.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {cert.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions: Delete, View, Edit */}
            <div className="flex justify-end items-center space-x-3 mt-2">
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button className="px-5 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
                View File
              </button>
              <button className="px-5 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
                Edit Certificate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-6">
        <Link 
          href="/all-certificates" 
          className="text-blue-600 text-sm font-medium flex items-center hover:underline"
        >
          → View all certificate
        </Link>
      </div>
    </div>
  )
}