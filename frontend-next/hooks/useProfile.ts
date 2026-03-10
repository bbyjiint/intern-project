'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'

export interface ProfileData {
  id?: string
  fullName?: string
  contactEmail?: string
  phoneNumber?: string
  bio?: string
  profileImage?: string
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
  relevantCoursework?: string[]
  achievements?: string[]
  extracurriculars?: string[]
}

export interface Experience {
  id: string
  position: string
  companyName: string
  department?: string
  startDate?: string
  endDate?: string
  isCurrent?: boolean
  manager?: string
  description?: string
  responsibilities?: string[]
  linkedProjects?: number
}

export interface Project {
  id: string
  name: string
  role?: string
  description?: string
  startDate?: string
  endDate?: string
  linkedToExperience?: string
  skills?: string[]
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
  category: 'technical' | 'business'
  rating?: number
  level?: string;
  linkedToExperience?: string
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
      
      // Transform API data to match our interface
      // API returns data in format: { profile: { fullName, email, phoneNumber, aboutYou, education, experience, skills, ... } }
      // Transform API data to match our interface
      // API returns: { profile: { fullName, email, phoneNumber, aboutYou, education, experience, skills, ... } }
      const profile = data.profile
      
      // Map education from API format (university, degree) to our format
      const education: Education[] = (profile.education || []).map((edu: any, index: number) => ({
        id: edu.id || `edu-${index}`,
        university: edu.university,
        universityName: edu.university,
        degree: edu.degree,
        degreeName: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        educationLevel: edu.educationLevel || 'BACHELOR',
        gpa: edu.gpa ? parseFloat(edu.gpa) : undefined,
        startYear: edu.startYear,
        endYear: edu.endYear,
        yearOfStudy: edu.yearOfStudy,
        startDate: edu.startDate || (edu.startYear ? `${edu.startYear}-01-01` : undefined),
        endDate: edu.endDate || (edu.endYear ? `${edu.endYear}-12-31` : undefined),
        isCurrent: edu.isCurrent ?? !edu.endDate,
        relevantCoursework: edu.coursework || [],
        achievements: edu.achievements || [],
        extracurriculars: edu.extracurriculars || [],
      }))
      
      // Map experience from API format
      const experience: Experience[] = (profile.experience || []).map((exp: any, index: number) => ({
        id: exp.id || `exp-${index}`,
        position: exp.position || exp.title,
        companyName: exp.companyName || exp.company,
        department: exp.department || null,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: !exp.endDate,
        manager: exp.manager || null,
        description: exp.description || '',
        responsibilities: exp.responsibilities || (exp.description ? exp.description.split('\n').filter((l: string) => l.trim()) : []),
        linkedProjects: exp.linkedProjects,
      }))
      
      // Map skills from API format (name, level) to our format (name, rating)
      const skills: Skill[] = (profile.skills || []).map((skill: any, index: number) => {
        // Convert level string to rating number (1-10 scale)
        let rating = 0
        if (skill.level === 'beginner') rating = 3
        else if (skill.level === 'intermediate') rating = 6
        else if (skill.level === 'advanced') rating = 9
        
        return {
          id: skill.id || `skill-${index}`,
          name: skill.name,
          category: skill.category || 'technical',
          rating: skill.rating || rating,
          linkedToExperience: skill.linkedToExperience,
        }
      })

      const rawCerts = profile.CertificateFile || profile.certificates || [];
      const mappedCertificates: Certificate[] = rawCerts.map((cert: any) => ({
        id: cert.id,
        name: cert.name,
        url: cert.url || '',
        type: cert.type,
        description: cert.description,
        issuedBy: cert.issuedBy,
        issueDate: cert.issueDate,
        relatedSkills: cert.relatedSkills || []
      }))
      
      const certificates: Certificate[] = ((profile.files?.certificates || profile.certificates) || []).map((cert: any) => {
        let parsedDescription: any = {}
        if (typeof cert.description === 'string' && cert.description.trim().startsWith('{')) {
          try {
            parsedDescription = JSON.parse(cert.description)
          } catch {
            parsedDescription = {}
          }
        }

        return {
          id: cert.id,
          name: cert.name,
          url: cert.url,
          type: cert.type,
          description: parsedDescription.descriptionText || cert.description || '',
          issuedBy: parsedDescription.issuedBy || '',
          date: parsedDescription.issueDate || '',
          tags: parsedDescription.tags || [],
          createdAt: cert.createdAt,
        }
      })

      const transformed: ProfileData = {
        id: profile.id,
        fullName: profile.fullName,
        contactEmail: profile.email || profile.contactEmail,
        phoneNumber: profile.phoneNumber,
        bio: profile.aboutYou || profile.professionalSummary || profile.bio,
        profileImage: profile.profileImage,
        desiredPosition: profile.desiredPosition,
        introductionVideo: profile.introductionVideo,
        education: education,
        experience: experience,
        projects: profile.projects || [],
        certificates,
        resume: profile.resume || (profile.resumeFile || profile.resumeUrl ? {
          name: profile.resumeFile,
          url: profile.resumeUrl,
        } : undefined),
        skills: skills,
        internshipDetails: {
          desiredPosition: profile.desiredPosition,
          availableStartDate: profile.availableStartDate,
          availableEndDate: profile.availableEndDate,
          motivation: profile.motivation,
        },
        interestedCompanies: profile.interestedCompanies || [],
      }
      
      setProfileData(transformed)
      localStorage.setItem('internProfileData', JSON.stringify(transformed))
    } catch (err: any) {
      console.error('Failed to fetch profile:', err)
      if (err.status === 404) {
        setProfileData(null)
      } else {
        setError(err.message || 'Failed to load profile')
        // Try to load from localStorage as fallback
        const saved = localStorage.getItem('internProfileData')
        if (saved) {
          try {
            setProfileData(JSON.parse(saved))
          } catch (e) {
            console.error('Failed to parse saved profile:', e)
          }
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
      !!profile.bio && profile.bio.trim().length > 0,
      !!profile.resume,
      !!profile.introductionVideo,
      profile.education && profile.education.length > 0,
      profile.experience && profile.experience.length > 0,
      profile.projects && profile.projects.length > 0,
      profile.skills && profile.skills.length > 0,
      !!profile.internshipDetails?.desiredPosition,
      profile.certificates && profile.certificates.length > 0,
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
    refetch: fetchProfile,
  }
}
