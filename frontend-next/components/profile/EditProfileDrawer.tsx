'use client'

import { useEffect, useState } from 'react'
import { ProfileData, Education, Experience, Project, Skill } from '@/hooks/useProfile'
import { apiFetch } from '@/lib/api'

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
      } else if (section === 'education' && editingId) {
        const edu = profileData.education?.find(e => e.id === editingId)
        setFormData({
          universityName: edu?.universityName || '',
          degreeName: edu?.degreeName || '',
          educationLevel: edu?.educationLevel || 'BACHELOR',
          gpa: edu?.gpa || '',
          startDate: edu?.startDate || '',
          endDate: edu?.endDate || '',
          isCurrent: edu?.isCurrent || false,
        })
      } else if (section === 'experience' && editingId) {
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
      } else if (section === 'project' && editingId) {
        const proj = profileData.projects?.find(p => p.id === editingId)
        setFormData({
          name: proj?.name || '',
          role: proj?.role || '',
          description: proj?.description || '',
          startDate: proj?.startDate || '',
          endDate: proj?.endDate || '',
          skills: proj?.skills?.join(', ') || '',
        })
      } else if (section === 'skill' && editingId) {
        const skill = profileData.skills?.find(s => s.id === editingId)
        setFormData({
          name: skill?.name || '',
          category: skill?.category || 'technical',
          rating: skill?.rating || 0,
        })
      } else {
        // New item - empty form
        setFormData({})
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
              universityName: formData.universityName,
              degreeName: formData.degreeName,
              educationLevel: formData.educationLevel,
              gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
              startDate: formData.startDate,
              endDate: formData.endDate,
              isCurrent: formData.isCurrent,
            } : edu
          )
        } else {
          // Add new education
          updatedEducation.push({
            id: `new-${Date.now()}`,
            universityName: formData.universityName,
            degreeName: formData.degreeName,
            educationLevel: formData.educationLevel,
            gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isCurrent: formData.isCurrent,
          })
        }
        
        // Transform to API format
        const educationForAPI = updatedEducation.map(edu => ({
          university: edu.universityName,
          degree: edu.degreeName,
          educationLevel: edu.educationLevel,
          gpa: edu.gpa?.toString(),
          startYear: edu.startDate ? new Date(edu.startDate).getFullYear().toString() : '',
          endYear: edu.endDate ? new Date(edu.endDate).getFullYear().toString() : '',
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
          level: skill.rating >= 7 ? 'advanced' : skill.rating >= 4 ? 'intermediate' : 'beginner',
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
        alert('This feature will be implemented soon. Please use the profile setup page.')
        setIsSaving(false)
        return
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
                  <input
                    type="text"
                    value={formData.universityName || ''}
                    onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Degree</label>
                  <input
                    type="text"
                    value={formData.degreeName || ''}
                    onChange={(e) => setFormData({ ...formData, degreeName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.gpa || ''}
                      onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) || 0 })}
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
                      disabled={formData.isCurrent}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isCurrent || false}
                      onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                    />
                    <span className="text-sm">Currently studying</span>
                  </label>
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
                </div>
              </>
            )}

            {section === 'skill' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Skill Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
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
