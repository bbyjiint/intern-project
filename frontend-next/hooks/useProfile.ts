'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

export interface ProfileData {
  id?: string
  fullName?: string
  contactEmail?: string
  phoneNumber?: string
  bio?: string
  professionalSummary?: string
  profileImage?: string

  gender?: string
  nationality?: string
  dateOfBirth?: string

  preferredPositions?: string[]
  preferredLocations?: string[]

  internshipPeriod?: string

  desiredPosition?: string
  introductionVideo?: string

  education?: Education[]
  experience?: Experience[]
  projects?: Project[]
  certificates?: Certificate[]
  resume?: ResumeFile
  skills?: Skill[]

  internshipDetails?: InternshipDetails
  interestedCompanies?: InterestedCompany[]
}

export interface Education {
  id: string
  university?: string
  universityName?: string
  degree?: string
  degreeName?: string
  fieldOfStudy?: string
  educationLevel?: string
  gpa?: number
  startYear?: string
  endYear?: string
  yearOfStudy?: string
  startDate?: string
  endDate?: string
  isCurrent?: boolean
  isVerified?: boolean      
  transcriptUrl?: string | null  
}

export interface Experience {
  id: string
  position: string
  companyName: string
  department?: string
  startDate?: string
  endDate?: string
  isCurrent?: boolean
  description?: string
  responsibilities?: string[]
}

export interface Project {
  id: string
  name: string
  role?: string
  description?: string
  startDate?: string
  endDate?: string
  skills?: string[]
  relatedSkills?: string[]   // ✅ เพิ่ม
  githubUrl?: string
  projectUrl?: string
  fileUrl?: string
  fileName?: string          // ✅ เพิ่ม
}

export interface Certificate {
  id: string
  name: string
  url: string
  type?: string
  description?: string
  issuedBy?: string
  date?: string
  tags?: string[]
  createdAt?: string
}

export interface ResumeFile {
  id?: string
  name?: string
  url?: string
  createdAt?: string
}

export interface Skill {
  id: string
  name: string
  category: string
  rating?: number
  level?: string
  status?: string
}

export interface InternshipDetails {
  desiredPosition?: string
  availableStartDate?: string
  availableEndDate?: string
  motivation?: string
}

export interface InterestedCompany {
  id: string
  companyName: string
  companyId?: string
}

export function useProfile() {

  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {

    try {

      setIsLoading(true)
      setError(null)

      const data = await apiFetch<{ profile: any }>('/api/candidates/profile')
      const profile = data.profile

      // ---------- Education ----------
      const education: Education[] = (profile.education || []).map((edu: any, i: number) => ({
        id: edu.id || `edu-${i}`,
        university: edu.universityName || edu.university,       
        universityName: edu.universityName || edu.university,   
        degree: edu.degreeName || edu.degree,                   
        degreeName: edu.degreeName || edu.degree,              
        fieldOfStudy: edu.fieldOfStudy,
        educationLevel: edu.educationLevel || 'BACHELOR',
        gpa: edu.gpa ? parseFloat(edu.gpa) : undefined,
        startYear: edu.startYear,
        endYear: edu.endYear,
        yearOfStudy: edu.yearOfStudy,
        startDate: edu.startDate,
        endDate: edu.endDate,
        isCurrent: edu.isCurrent ?? !edu.endDate,
        isVerified: edu.isVerified ?? false,      
        transcriptUrl: edu.transcriptUrl ?? null, 
      }))

      // ---------- Experience ----------
      const experience: Experience[] = (profile.experience || []).map((exp: any, i: number) => ({
        id: exp.id || `exp-${i}`,
        position: exp.position || exp.title,
        companyName: exp.companyName || exp.company,
        department: exp.department,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: !exp.endDate,
        description: exp.description,
        responsibilities: exp.responsibilities || []
      }))

      // ---------- Skills ----------
      const skills: Skill[] = (profile.skills || []).map((s: any, i: number) => {
        let rating = s.rating
        if (!rating && s.level) {
          if (s.level === 'beginner') rating = 1
          if (s.level === 'intermediate') rating = 2
          if (s.level === 'advanced') rating = 3
        }

        return {
          id: s.id || `skill-${i}`,
          name: s.name,
          category: s.category,
          rating,
          level: s.level,
          status: s.status
        }
      })

      // ---------- Certificates ----------
      const certificates: Certificate[] = (profile.files?.certificates || profile.certificates || profile.CertificateFile || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        url: c.url,
        type: c.type,
        description: c.description,
        issuedBy: c.issuedBy,
        date: c.issueDate,
        tags: c.relatedSkills || [],
        createdAt: c.createdAt
      }))

      // ---------- Transform ----------
      const transformed: ProfileData = {
        id: profile.id,
        fullName: profile.fullName,
        contactEmail: profile.email || profile.contactEmail,
        phoneNumber: profile.phoneNumber,

        bio: profile.aboutYou || profile.professionalSummary || profile.bio,
        profileImage: profile.profileImage,

        gender: profile.gender,
        nationality: profile.nationality,
        dateOfBirth: profile.dateOfBirth,

        preferredPositions:
          profile.preferredPositions ||
          profile.positionsOfInterest ||
          [],

        preferredLocations:
          profile.preferredLocations ||
          profile.CandidatePreferredProvince?.map((p: any) => p.provinceId) ||
          [],

        internshipPeriod:
          profile.internshipPeriod ||
          (profile.availableStartDate && profile.availableEndDate
            ? `${profile.availableStartDate} - ${profile.availableEndDate}`
            : ""),

        desiredPosition: profile.desiredPosition,
        introductionVideo: profile.introductionVideo,

        education,
        experience,
        projects: (profile.projects || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          role: p.role,
          description: p.description,
          startDate: p.startDate,
          endDate: p.endDate,
          skills: p.relatedSkills || p.skills || [],
          relatedSkills: p.relatedSkills || p.skills || [],
          githubUrl: p.githubUrl,
          projectUrl: p.projectUrl,
          fileUrl: p.fileUrl,
          fileName: p.fileName,       // ✅ map มาด้วย
        })),
        certificates,

        resume:
          profile.resume ||
          (profile.resumeFile || profile.resumeUrl
            ? {
              name: profile.resumeFile,
              url: profile.resumeUrl
            }
            : undefined),

        skills,

        internshipDetails: {
          desiredPosition: profile.desiredPosition,
          availableStartDate: profile.availableStartDate,
          availableEndDate: profile.availableEndDate,
          motivation: profile.motivation
        },

        interestedCompanies: profile.interestedCompanies || []
      }

      setProfileData(transformed)
      localStorage.setItem('internProfileData', JSON.stringify(transformed))

    } catch (err: any) {

      console.error('Failed to fetch profile:', err)

      if (err.status === 404 || err.status === 403) {

        setProfileData(null)

      } else {

        setError(err.message || 'Failed to load profile')

        const saved = localStorage.getItem('internProfileData')

        if (saved) {
          try {
            setProfileData(JSON.parse(saved))
          } catch { }
        }
      }

    } finally {

      setIsLoading(false)

    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const calculateCompletion = (profile: ProfileData | null): number => {

    if (!profile) return 0

    const checks = [

      !!profile.profileImage,
      !!profile.bio,
      !!profile.resume,
      !!profile.introductionVideo,
      profile.education && profile.education.length > 0,
      profile.experience && profile.experience.length > 0,
      profile.projects && profile.projects.length > 0,
      profile.skills && profile.skills.length > 0,
      !!profile.internshipDetails?.desiredPosition,
      profile.certificates && profile.certificates.length > 0

    ]

    const completed = checks.filter(Boolean).length
    return Math.round((completed / checks.length) * 100)
  }

  const completionPercentage = calculateCompletion(profileData)

  return {

    profileData,
    isLoading,
    error,
    completionPercentage,
    refetch: fetchProfile

  }
}