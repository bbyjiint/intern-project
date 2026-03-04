'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  // ตั้งค่าเริ่มต้นให้เปิด Dropdown ไว้
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(true);

  // เช็ค Active Route
  const isProfilePage = pathname === '/intern/profile';
  const isCertificatesPage = pathname === '/intern/certificates';
  const isProjectPage = pathname === '/intern/project';
  const isSkillPage = pathname === '/intern/skills';

  return (
    <aside className="w-64 bg-white min-h-screen pt-8 border-r border-gray-200 shrink-0">
      <div className="px-6 space-y-2">
        
        {/* Profile with Dropdown */}
        <div className="profile-dropdown-container">
          <div className={`w-full px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
              isProfilePage 
                ? 'bg-[#0273B1] text-white' 
                : 'bg-transparent text-[#1C2D4F] hover:bg-[#F0F4F8] hover:text-[#0273B1]'
            }`}>
            
            {/* คลิกที่ข้อความ/ไอคอนซ้ายเพื่อไปหน้า Profile */}
            <Link href="/intern/profile" className="flex items-center space-x-3 flex-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profile</span>
            </Link>
            
            {/* Toggle Dropdown Button */}
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className={`p-1 rounded transition-colors ${
                isProfilePage ? 'hover:bg-[#025c8d]' : 'hover:bg-gray-200'
              }`}
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="ml-4 mt-2 space-y-1">
              <Link
                href="/intern/certificates"
                className={`block px-4 py-3 rounded-lg text-sm transition-colors flex items-center space-x-3 ${
                  isCertificatesPage
                    ? 'bg-[#0273B1] text-white'
                    : 'bg-transparent text-[#1C2D4F] hover:bg-[#F0F4F8] hover:text-[#0273B1]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Certificates</span>
              </Link>
              
              <Link
                href="/intern/project"
                className={`block px-4 py-3 rounded-lg text-sm transition-colors flex items-center space-x-3 ${
                  isProjectPage
                    ? 'bg-[#0273B1] text-white'
                    : 'bg-transparent text-[#1C2D4F] hover:bg-[#F0F4F8] hover:text-[#0273B1]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Project</span>
              </Link>

              <Link
                href="/intern/skills"
                className={`block px-4 py-3 rounded-lg text-sm transition-colors flex items-center space-x-3 ${
                  isSkillPage
                    ? 'bg-[#0273B1] text-white'
                    : 'bg-transparent text-[#1C2D4F] hover:bg-[#F0F4F8] hover:text-[#0273B1]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Skills</span>
              </Link>
            </div>
          )}
        </div>

        {/* AI Job Match */}
        <Link
          href="/intern/ai-job-match"
          className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors text-[#1C2D4F] hover:text-[#0273B1] hover:bg-[#F0F4F8]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {/* เปลี่ยน path ตรงนี้เป็นรูปแว่นขยาย */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="font-medium">AI Job Match</span>
        </Link>

        {/* Applied Link */}
        <Link
          href="/intern/applied"
          className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors text-[#1C2D4F] hover:text-[#0273B1] hover:bg-[#F0F4F8]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="font-medium">Applied</span>
        </Link>

        {/* Bookmark Link */}
        <Link
          href="/intern/bookmark"
          className="px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors text-[#1C2D4F] hover:text-[#0273B1] hover:bg-[#F0F4F8]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="font-medium">Bookmark</span>
        </Link>

      </div>
    </aside>
  );
}