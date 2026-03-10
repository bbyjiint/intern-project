'use client'

import { useEffect, useState } from 'react'
import { ProfileData, Education, Experience, Project, Skill } from '@/hooks/useProfile'
import { apiFetch } from '@/lib/api'
import SearchableDropdown from '@/components/SearchableDropdown'

type EditSection = 
  | 'personal'
  | 'education'
  | 'experience'
  | 'project'
  | 'skill'

interface EditProfileDrawerProps {
  isOpen: boolean
  section: EditSection | null
  editingId: string | null
  profileData: ProfileData | null
  onClose: () => void
  onSave: () => void
}

export default function EditProfileDrawer({
  isOpen,
  section,
  editingId,
  profileData,
  onClose,
  onSave,
}: EditProfileDrawerProps) {
  const [formData, setFormData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)
  const [universities, setUniversities] = useState<Array<{ id: string; name: string; thname: string | null; code: string | null }>>([])
  const [universitiesLoading, setUniversitiesLoading] = useState(false)
  const [skills, setSkills] = useState<Array<{ id: string; name: string }>>([])
  const [skillsLoading, setSkillsLoading] = useState(false)

  // Load universities and skills when drawer opens
  useEffect(() => {
    if (isOpen) {
      // Load universities
      if (section === 'education') {
        setUniversitiesLoading(true)
        apiFetch<{ universities: Array<{ id: string; name: string; thname: string | null; code: string | null }> }>('/api/universities')
          .then((data) => {
            setUniversities(data.universities || [])
          })
          .catch((err) => {
            console.error('Failed to load universities:', err)
            setUniversities([])
          })
          .finally(() => {
            setUniversitiesLoading(false)
          })
      }
      
      // Load skills
      if (section === 'project' || section === 'skill') {
        setSkillsLoading(true)
        apiFetch<{ skills: Array<{ id: string; name: string }> }>('/api/skills')
          .then((data) => {
            setSkills(data.skills || [])
          })
          .catch((err) => {
            console.error('Failed to load skills:', err)
            setSkills([])
          })
          .finally(() => {
            setSkillsLoading(false)
          })
      }
    }
  }, [isOpen, section])

  useEffect(() => {
    if (isOpen && section && profileData) {
      // Initialize form data based on section
      if (section === 'personal') {
        setFormData({
          fullName: profileData.fullName || '',
          contactEmail: profileData.contactEmail || '',
          phoneNumber: profileData.phoneNumber || '',
          bio: profileData.bio || '',
          introductionVideo: profileData.introductionVideo || '',
        })
      } else if (section === 'education') {
        // For new education, start with empty form
        if (editingId) {
          const edu = profileData.education?.find(e => e.id === editingId)
          // Extract year from date if needed - backend returns both formats
          const startYear = edu?.startYear || (edu?.startDate ? new Date(edu.startDate).getFullYear().toString() : '')
          const endYear = edu?.endYear || (edu?.endDate ? new Date(edu.endDate).getFullYear().toString() : '')
          setFormData({
            universityName: edu?.universityName || edu?.university || '',
            degreeName: edu?.degreeName || edu?.degree || '',
            educationLevel: edu?.educationLevel || 'BACHELOR',
            gpa: edu?.gpa || '',
            startYear: startYear,
            endYear: endYear,
            isCurrent: edu?.isCurrent || (!endYear && !edu?.endDate),
          })
        } else {
          setFormData({
            universityName: '',
            degreeName: '',
            educationLevel: 'BACHELOR',
            gpa: '',
            startYear: '',
            endYear: '',
            isCurrent: false,
          })
        }
      } else if (section === 'experience') {
        if (editingId) {
          const exp = profileData.experience?.find(e => e.id === editingId)
          setFormData({
            position: exp?.position || '',
            companyName: exp?.companyName || '',
            department: exp?.department || '',
            startDate: exp?.startDate || '',
            endDate: exp?.endDate || '',
            manager: exp?.manager || '',
            description: exp?.description || '',
          })
        } else {
          setFormData({
            position: '',
            companyName: '',
            department: '',
            startDate: '',
            endDate: '',
            manager: '',
            description: '',
          })
        }
      } else if (section === 'project') {
        if (editingId) {
          const proj = profileData.projects?.find(p => p.id === editingId)
          setFormData({
            name: proj?.name || '',
            role: proj?.role || '',
            description: proj?.description || '',
            startDate: proj?.startDate || '',
            endDate: proj?.endDate || '',
            skills: proj?.skills?.join(', ') || '',
          })
        } else {
          setFormData({
            name: '',
            role: '',
            description: '',
            startDate: '',
            endDate: '',
            skills: '',
          })
        }
      } else if (section === 'skill') {
        if (editingId) {
          const skill = profileData.skills?.find(s => s.id === editingId)
          setFormData({
            name: skill?.name || '',
            category: skill?.category || 'technical',
            rating: skill?.rating || 0,
            level: skill?.level || 'beginner',
          })
        } else {
          setFormData({
            name: '',
            category: 'technical',
            rating: 0,
            level: 'beginner',
          })
        }
      }
    }
  }, [isOpen, section, editingId, profileData])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Get current profile data to merge with updates
      const currentProfile = profileData
      
      if (section === 'personal') {
        await apiFetch('/api/candidates/profile', {
          method: 'PUT',
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.contactEmail,
            phoneNumber: formData.phoneNumber,
            aboutYou: formData.bio,
            professionalSummary: formData.bio,
            introductionVideo: formData.introductionVideo,
            // Keep existing data
            education: currentProfile?.education || [],
            experience: currentProfile?.experience || [],
            skills: currentProfile?.skills || [],
          }),
        })
      } else if (section === 'education') {
        // Get current education list
        const currentEducation = currentProfile?.education || []
        let updatedEducation = [...currentEducation]
        
        if (editingId) {
          // Update existing education
          updatedEducation = updatedEducation.map(edu => 
            edu.id === editingId ? {
              ...edu,
              university: formData.universityName,
              universityName: formData.universityName,
              degree: formData.degreeName,
              degreeName: formData.degreeName,
              educationLevel: formData.educationLevel,
              gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
              startYear: formData.startYear,
              endYear: formData.isCurrent ? null : formData.endYear,
              isCurrent: formData.isCurrent,
            } : edu
          )
        } else {
          // Add new education
          updatedEducation.push({
            id: `new-${Date.now()}`,
            university: formData.universityName,
            universityName: formData.universityName,
            degree: formData.degreeName,
            degreeName: formData.degreeName,
            educationLevel: formData.educationLevel,
            gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
            startYear: formData.startYear,
            endYear: formData.isCurrent ? null : formData.endYear,
            isCurrent: formData.isCurrent,
          })
        }
        
        // Transform to API format
        const educationForAPI = updatedEducation.map(edu => ({
          university: edu.universityName || edu.university,
          degree: edu.degreeName || edu.degree,
          gpa: edu.gpa ? edu.gpa.toString() : null,
          startYear: edu.startYear || (edu.startDate ? new Date(edu.startDate).getFullYear().toString() : ''),
          endYear: edu.isCurrent ? null : (edu.endYear || (edu.endDate ? new Date(edu.endDate).getFullYear().toString() : '')),
        }))
        
        await apiFetch('/api/candidates/profile', {
          method: 'PUT',
          body: JSON.stringify({
            ...(currentProfile?.fullName && { fullName: currentProfile.fullName }),
            education: educationForAPI,
            experience: currentProfile?.experience || [],
            skills: currentProfile?.skills || [],
          }),
        })
      } else if (section === 'experience') {
        const currentExperience = currentProfile?.experience || []
        let updatedExperience = [...currentExperience]
        
        if (editingId) {
          updatedExperience = updatedExperience.map(exp => 
            exp.id === editingId ? {
              ...exp,
              position: formData.position,
              companyName: formData.companyName,
              department: formData.department,
              startDate: formData.startDate,
              endDate: formData.endDate,
              manager: formData.manager,
              description: formData.description,
            } : exp
          )
        } else {
          updatedExperience.push({
            id: `new-${Date.now()}`,
            position: formData.position,
            companyName: formData.companyName,
            department: formData.department,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isCurrent: !formData.endDate,
            manager: formData.manager,
            description: formData.description,
          })
        }
        
        const experienceForAPI = updatedExperience.map(exp => ({
          position: exp.position,
          companyName: exp.companyName,
          company: exp.companyName,
          title: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
        }))
        
        await apiFetch('/api/candidates/profile', {
          method: 'PUT',
          body: JSON.stringify({
            ...(currentProfile?.fullName && { fullName: currentProfile.fullName }),
            education: currentProfile?.education || [],
            experience: experienceForAPI,
            skills: currentProfile?.skills || [],
          }),
        })
      } else if (section === 'skill') {
        const currentSkills = currentProfile?.skills || []
        let updatedSkills = [...currentSkills]
        
        if (editingId) {
          updatedSkills = updatedSkills.map(skill => 
            skill.id === editingId ? {
              ...skill,
              name: formData.name,
              category: formData.category,
              rating: formData.rating,
            } : skill
          )
        } else {
          updatedSkills.push({
            id: `new-${Date.now()}`,
            name: formData.name,
            category: formData.category,
            rating: formData.rating,
          })
        }
        
        const skillsForAPI = updatedSkills.map(skill => ({
          name: skill.name,
          level: (skill.rating || 0) >= 7 ? 'advanced' : (skill.rating || 0) >= 4 ? 'intermediate' : 'beginner',
          category: skill.category,
        }))
        
        await apiFetch('/api/candidates/profile', {
          method: 'PUT',
          body: JSON.stringify({
            ...(currentProfile?.fullName && { fullName: currentProfile.fullName }),
            education: currentProfile?.education || [],
            experience: currentProfile?.experience || [],
            skills: skillsForAPI,
          }),
        })
      } else if (section === 'project') {
        const currentProjects = currentProfile?.projects || []
        let updatedProjects = [...currentProjects]
        
        if (editingId) {
          updatedProjects = updatedProjects.map(proj => 
            proj.id === editingId ? {
              ...proj,
              name: formData.name,
              role: formData.role,
              description: formData.description,
              startDate: formData.startDate,
              endDate: formData.endDate,
            } : proj
          )
        } else {
          updatedProjects.push({
            id: `new-${Date.now()}`,
            name: formData.name,
            role: formData.role,
            description: formData.description || '',
            startDate: formData.startDate,
            endDate: formData.endDate,
          })
        }
        
        const projectsForAPI = updatedProjects.map(proj => ({
          name: proj.name,
          role: proj.role,
          description: proj.description || '',
        }))
        
        await apiFetch('/api/candidates/profile', {
          method: 'PUT',
          body: JSON.stringify({
            ...(currentProfile?.fullName && { fullName: currentProfile.fullName }),
            education: currentProfile?.education || [],
            experience: currentProfile?.experience || [],
            skills: currentProfile?.skills || [],
            projects: projectsForAPI,
          }),
        })
      }
      
      onSave()
      onClose()
    } catch (error: any) {
      console.error('Failed to save:', error)
      const errorMessage = error?.message || 'Failed to save changes. Please try again.'
      alert(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#1C2D4F' }}>
              Edit {section === 'personal' ? 'Personal Information' :
                    section === 'education' ? 'Education' :
                    section === 'experience' ? 'Experience' :
                    section === 'project' ? 'Project' :
                    section === 'skill' ? 'Skill' : 'Profile'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            {section === 'personal' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Professional Summary</label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Introduction Video URL</label>
                  <input
                    type="url"
                    value={formData.introductionVideo || ''}
                    onChange={(e) => setFormData({ ...formData, introductionVideo: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </>
            )}

            {section === 'education' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">University Name</label>
                  {universitiesLoading ? (
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Loading universities...</span>
                    </div>
                  ) : (
                    <SearchableDropdown
                      options={universities.map((uni) => ({
                        value: uni.name,
                        label: uni.thname ? `${uni.name} (${uni.thname})` : uni.name,
                        code: uni.code,
                      }))}
                      value={formData.universityName || ''}
                      onChange={(value) => setFormData({ ...formData, universityName: value })}
                      placeholder="Search by name or code..."
                      className="w-full"
                      allOptionLabel="Select University"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Degree</label>
                  <input
                    type="text"
                    value={formData.degreeName || ''}
                    onChange={(e) => setFormData({ ...formData, degreeName: e.target.value })}
                    placeholder="e.g. Computer Science, Business Administration"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">GPA (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={formData.gpa || ''}
                      onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                      placeholder="e.g. 3.5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Level</label>
                    <select
                      value={formData.educationLevel || 'BACHELOR'}
                      onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="BACHELOR">Bachelor</option>
                      <option value="MASTERS">Master</option>
                      <option value="PHD">PhD</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Year</label>
                    <select
                      value={formData.startYear || ''}
                      onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Year</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.endYear || ''}
                        onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                        disabled={formData.isCurrent}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Year</option>
                        {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                          <option key={year} value={year.toString()}>{year}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2 px-3">
                        <input
                          type="checkbox"
                          checked={formData.isCurrent || false}
                          onChange={(e) => {
                            setFormData({ ...formData, isCurrent: e.target.checked, endYear: e.target.checked ? '' : formData.endYear })
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm whitespace-nowrap">Current</span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {section === 'experience' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Position</label>
                  <input
                    type="text"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Manager</label>
                  <input
                    type="text"
                    value={formData.manager || ''}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter key responsibilities and achievements..."
                  />
                </div>
              </>
            )}

            {section === 'project' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your Role</label>
                  <input
                    type="text"
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.skills || ''}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="SQL, Python, Tableau"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Skills are stored as comma-separated text. For full skill management, use the Skills section.
                  </p>
                </div>
              </>
            )}

            {section === 'skill' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Skill Name</label>
                  {skillsLoading ? (
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Loading skills...</span>
                    </div>
                  ) : (
                    <SearchableDropdown
                      options={skills.map((skill) => ({
                        value: skill.name,
                        label: skill.name,
                      }))}
                      value={formData.name || ''}
                      onChange={(value) => setFormData({ ...formData, name: value })}
                      placeholder="Search by skill name..."
                      className="w-full"
                      allOptionLabel="Select Skill"
                    />
                  )}
                  {formData.name && !skills.find((s: { name: string }) => s.name === formData.name) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Skill not found in list. It will be created when you save.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category || 'technical'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="technical">Technical</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rating: {formData.rating || 0}/10
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={formData.rating || 0}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </>
            )}

          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#0273B1' }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
