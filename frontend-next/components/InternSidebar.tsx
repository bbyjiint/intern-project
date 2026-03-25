'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profileData } = useProfile();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(true);
  const [ignoredSkills, setIgnoredSkills] = useState<string[]>([]);

  useEffect(() => {
    const loadIgnoredSkills = () => {
      const stored = localStorage.getItem("ignored_missing_skills");
      if (stored) {
        try { setIgnoredSkills(JSON.parse(stored)); } catch (e) {}
      }
    };
    loadIgnoredSkills();
    window.addEventListener("ignored_skills_updated", loadIgnoredSkills);
    return () => window.removeEventListener("ignored_skills_updated", loadIgnoredSkills);
  }, []);

  // ปิด Sidebar อัตโนมัติเมื่อเปลี่ยนหน้า (สำหรับ Mobile)
  useEffect(() => {
    if (onClose && typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  }, [pathname]);

  const isProfilePage = pathname === '/intern/profile';
  const isCertificatesPage = pathname === '/intern/certificates';
  const isProjectPage = pathname === '/intern/project';
  const isSkillPage = pathname === '/intern/skills';
  const isAiMatchPage = pathname === '/intern/ai-job-match';
  const isAppliedPage = pathname === '/intern/applied';
  const isBookmarkPage = pathname === '/intern/bookmark';

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
      if (!userSkillNames.has(s) && !ignoredSkills.includes(s)) count++;
    });
    return count;
  }, [profileData, ignoredSkills]);

  return (
    <>
      {/* Overlay: พื้นหลังดำจางๆ เมื่อเปิด Sidebar บนมือถือ */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside className={`
        fixed inset-y-0 left-0 z-[120] w-[280px] bg-white dark:bg-slate-900 
        border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-30 lg:shadow-none
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        <div className="h-full flex flex-col">
          {/* Header สำหรับ Mobile */}
          <div className="lg:hidden flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800/50">
            <span className="font-bold text-slate-800 dark:text-slate-200">Navigation</span>
            <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {/* Profile Group */}
            <div className="space-y-1">
              <div className={`group w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all ${
                  isProfilePage 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}>
                <Link href="/intern/profile" className="flex items-center space-x-3 flex-1 font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); setIsProfileDropdownOpen(!isProfileDropdownOpen); }}
                  className="p-1 hover:bg-black/10 rounded"
                >
                  <svg className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {isProfileDropdownOpen && (
                <div className="ml-4 pl-2 border-l-2 border-slate-100 dark:border-slate-800 space-y-1 mt-1">
                  {[
                    { href: '/intern/project', label: 'Project', active: isProjectPage, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                    { href: '/intern/skills', label: 'Skills', active: isSkillPage, icon: 'M13 10V3L4 14h7v7l9-11h-7z', count: missingSkillsCount },
                    { href: '/intern/certificates', label: 'Certificates', active: isCertificatesPage, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
                  ].map((item) => (
                    <Link key={item.href} href={item.href} className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${item.active ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                        <span>{item.label}</span>
                      </div>
                      {item.count ? <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">{item.count}</span> : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6">
              <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Discovery</p>
              {[
                { href: '/intern/ai-job-match', label: 'AI Job Match', active: isAiMatchPage, icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                { href: '/intern/applied', label: 'Applied', active: isAppliedPage, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                { href: '/intern/bookmark', label: 'Bookmark', active: isBookmarkPage, icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' }
              ].map((item) => (
                <Link key={item.href} href={item.href} className={`group px-4 py-3 rounded-xl flex items-center space-x-3 transition-all mt-1 ${item.active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                  <span className="font-bold">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}