'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';

export default function Sidebar() {
  const pathname = usePathname();
  const { profileData } = useProfile();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(true);

  // --- Ignored Skills State ---
  const [ignoredSkills, setIgnoredSkills] = useState<string[]>([]);

  useEffect(() => {
    // ฟังก์ชันโหลดค่าจาก LocalStorage
    const loadIgnoredSkills = () => {
      const stored = localStorage.getItem("ignored_missing_skills");
      if (stored) {
        try { setIgnoredSkills(JSON.parse(stored)); } catch (e) {}
      }
    };
    
    loadIgnoredSkills(); // โหลดครั้งแรก

    // ดักฟัง Event จากหน้าอื่นแบบ Real-time
    window.addEventListener("ignored_skills_updated", loadIgnoredSkills);
    return () => window.removeEventListener("ignored_skills_updated", loadIgnoredSkills);
  }, []);

  const isProfilePage = pathname === '/intern/profile';
  const isCertificatesPage = pathname === '/intern/certificates';
  const isProjectPage = pathname === '/intern/project';
  const isSkillPage = pathname === '/intern/skills';
  const isAiMatchPage = pathname === '/intern/ai-job-match';
  const isAppliedPage = pathname === '/intern/applied';
  const isBookmarkPage = pathname === '/intern/bookmark';

  // --- คำนวณ Skills ที่หายไป (Missing Skills) ---
  const missingSkillsCount = useMemo(() => {
    if (!profileData) return 0;
    
    const userSkillNames = new Set((profileData.skills || []).map((s: any) => s.name.toLowerCase().trim()));
    const evidenceSkills = new Set<string>();
    
    (profileData.certificates || []).forEach((c: any) => {
      (c.relatedSkills || c.tags || []).forEach((s: string) => evidenceSkills.add(s.toLowerCase().trim()));
    });
    (profileData.projects || []).forEach((p: any) => {
      (p.relatedSkills || p.skills || []).forEach((s: string) => evidenceSkills.add(s.toLowerCase().trim()));
    });

    let count = 0;
    evidenceSkills.forEach((s) => {
      // เช็คว่าไม่อยู่ใน Profile และ ไม่ได้ถูกกดยกเลิก (Ignored) ไปแล้ว
      if (!userSkillNames.has(s) && !ignoredSkills.includes(s)) count++;
    });
    return count;
  }, [profileData, ignoredSkills]);

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 min-h-screen pt-8 border-r border-slate-200 dark:border-slate-800 shrink-0 transition-colors">
      <div className="px-4 space-y-1.5">
        
        {/* Profile Group */}
        <div className="space-y-1">
          <div className={`group w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-200 ${
              isProfilePage 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
            }`}>
            
            <Link href="/intern/profile" className="flex items-center space-x-3 flex-1 font-bold tracking-tight">
              <svg className={`w-5 h-5 ${isProfilePage ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </Link>
            
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className={`p-1 rounded-lg transition-colors ${
                isProfilePage ? 'hover:bg-white/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="ml-4 pl-2 border-l-2 border-slate-100 dark:border-slate-800 space-y-1 mt-1">
              {/* Project */}
              <Link
                href="/intern/project"
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isProjectPage
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  <span>Project</span>
                </div>
              </Link>

              {/* Skills */}
              <Link
                href="/intern/skills"
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isSkillPage
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span>Skills</span>
                </div>
                {/* แจ้งเตือน Badge จำนวน Skill ที่ไม่ได้ Add */}
                {missingSkillsCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                    {missingSkillsCount}
                  </span>
                )}
              </Link>

              {/* Certificates */}
              <Link
                href="/intern/certificates"
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isCertificatesPage
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span>Certificates</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        <div className="pt-4 pb-2">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-600 mb-2">
            Discovery
          </p>
          
          <Link
            href="/intern/ai-job-match"
            className={`group px-4 py-3 rounded-xl flex items-center space-x-3 transition-all ${
              isAiMatchPage 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <svg className={`w-5 h-5 ${isAiMatchPage ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="font-bold tracking-tight">AI Job Match</span>
          </Link>

          <Link
            href="/intern/applied"
            className={`group px-4 py-3 rounded-xl flex items-center space-x-3 transition-all mt-1 ${
              isAppliedPage 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <svg className={`w-5 h-5 ${isAppliedPage ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-bold tracking-tight">Applied</span>
          </Link>

          <Link
            href="/intern/bookmark"
            className={`group px-4 py-3 rounded-xl flex items-center space-x-3 transition-all mt-1 ${
              isBookmarkPage 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <svg className={`w-5 h-5 ${isBookmarkPage ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="font-bold tracking-tight">Bookmark</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}