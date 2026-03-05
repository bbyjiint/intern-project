'use client'

import { Skill } from '@/hooks/useProfile'
import Link from 'next/link' // เพิ่มตัวนี้
import { useRouter } from 'next/navigation' // เพิ่มตัวนี้

interface SkillsSectionProps {
  skills: Skill[]
  onAdd?: () => void // ปรับเป็น optional เผื่อกรณีใช้ router แทน
  onEdit?: (id: string) => void
}

export default function SkillsSection({ skills, onAdd, onEdit }: SkillsSectionProps) {
  const router = useRouter() // เรียกใช้งาน router
  const technicalSkills = skills.filter(s => s.category === 'technical')
  const businessSkills = skills.filter(s => s.category === 'business')

  const SkillItem = ({ skill }: { skill: Skill }) => {
    const percentage = skill.rating ? (skill.rating / 10) * 100 : 33
    const isVerified = skill.rating && skill.rating > 5

    return (
      <div className="mb-6 last:mb-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-gray-900">{skill.name}</span>
          <div className="flex items-center gap-2 text-xs">
            {!isVerified ? (
              <>
                <Link href="/intern/skills" className="text-blue-600 hover:underline font-medium">
                  &gt;&gt; Click here to Verified Skill
                </Link>
                <span className="flex items-center gap-1 text-red-500 font-bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Not Verified
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1 text-green-600 font-bold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified By Skill Test
              </span>
            )}
          </div>
        </div>

        <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-1 flex">
            <div className="absolute inset-0 flex">
                <div className="h-full w-1/3 border-r border-white/30"></div>
                <div className="h-full w-1/3 border-r border-white/30"></div>
                <div className="h-full w-1/3"></div>
            </div>
            <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500 relative z-10"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
        
        <p className="text-[11px] text-gray-400">
            Level: {percentage <= 33 ? 'Beginner' : percentage <= 66 ? 'Intermediate' : 'Advanced'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-blue-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900">Skills</h2>
        </div>
        
        {/* แก้ไขปุ่ม Add/Edit Skill */}
        <button
          onClick={() => router.push('/intern/skills')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors shadow-md shadow-blue-100 active:scale-95"
        >
          + Add/Edit Skills
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Technical Skills</h3>
          {technicalSkills.length > 0 ? (
            technicalSkills.map(s => <SkillItem key={s.id} skill={s} />)
          ) : (
            <p className="text-gray-400 italic text-sm text-center">No technical skills added</p>
          )}
        </div>

        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Business Skills</h3>
          {businessSkills.length > 0 ? (
            businessSkills.map(s => <SkillItem key={s.id} skill={s} />)
          ) : (
            <p className="text-gray-400 italic text-sm text-center">No business skills added</p>
          )}
        </div>
      </div>

      {/* แก้ไข Footer Link ด้วย Link component */}
      <div className="mt-6 border-t border-gray-50 pt-4">
        <Link 
          href="/intern/skills" 
          className="text-blue-600 font-bold text-sm inline-flex items-center gap-2 hover:underline group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          Go to Skills Page
        </Link>
      </div>
    </div>
  )
}