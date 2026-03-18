"use client";

import { useState, useEffect } from "react";
import { Education } from "@/hooks/useProfile";
import { apiFetch } from "@/lib/api";
import SearchableDropdown from "@/components/SearchableDropdown";

interface EducationModalProps {
  isOpen: boolean;
  education: Education | null;
  onClose: () => void;
  onSave: () => void;
}

export default function EducationModal({
  isOpen,
  education,
  onClose,
  onSave,
}: EducationModalProps) {
  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    major: "",
    educationLevel: "BACHELOR",
    yearOfStudy: "",
    gpa: "",
    isCurrent: true,
  });

  const [universities, setUniversities] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && education) {
      const isCurrent = education.isCurrent ?? !(education.endDate || (education as any).endYear);
      const rawYear = (education as any).yearOfStudy || "";
      let initialYear = rawYear.match(/\d+/)?.[0] || rawYear;
      if (!isCurrent) initialYear = "Graduated";

      setFormData({
        school: education.universityName || education.university || "",
        degree: education.degreeName || education.degree || "",
        major: (education as any).fieldOfStudy || "",
        educationLevel: (education as any).educationLevel || "BACHELOR",
        yearOfStudy: initialYear,
        gpa: education.gpa?.toString() || "",
        isCurrent: isCurrent,
      });
    } else if (isOpen) {
      setFormData({
        school: "",
        degree: "",
        major: "",
        educationLevel: "BACHELOR",
        yearOfStudy: "",
        gpa: "",
        isCurrent: true,
      });
    }
  }, [isOpen, education]);

  useEffect(() => {
    if (isOpen) {
      (async () => {
        try {
          const data = await apiFetch<{ universities: any[] }>(`/api/universities`);
          setUniversities(data.universities || []);
        } catch (err) {
          console.error("Failed to load universities:", err);
        }
      })();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!formData.school || !formData.degree || !formData.major) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        universityName: formData.school,
        degreeName: formData.degree,
        fieldOfStudy: formData.major,
        educationLevel: formData.educationLevel,
        yearOfStudy: formData.isCurrent ? `${formData.yearOfStudy}th Year` : "Graduated",
        gpa: parseFloat(formData.gpa) || 0,
        isCurrent: formData.isCurrent,
        endDate: formData.isCurrent ? null : (education as any)?.endDate || null,
      };

      await apiFetch(
        education ? `/api/candidates/education/${education.id}` : "/api/candidates/education",
        {
          method: education ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );
      onSave();
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Reusable label component for clarity
  const Label = ({ children, required = false }: { children: React.ReactNode; required?: boolean }) => (
    <label className="block text-sm font-extrabold text-gray-700 dark:text-gray-200 mb-2">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  // Reusable Input/Select style
  const inputClassName = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {education ? "Edit Education" : "Add Education"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 space-y-6 overflow-y-auto">
          
          {/* Institution Selection */}
          <div className="space-y-6">
            <div>
              <Label required>Institution Name</Label>
              <SearchableDropdown
                options={universities.map((uni) => ({
                  value: uni.name,
                  label: uni.thname ? `${uni.name} (${uni.thname})` : uni.name,
                }))}
                value={formData.school}
                onChange={(val) => setFormData({ ...formData, school: val })}
                placeholder="Search or Select Institution"
                // 💡 หมายเหตุ: ตรวจสอบให้มั่นใจว่า SearchableDropdown รองรับ Dark Mode ด้วยนะครับ
              />
            </div>

            <div>
              <Label required>Education Level</Label>
              <select
                value={formData.educationLevel}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                className={inputClassName}
              >
                <option value="BELOW_HIGH_SCHOOL">Below High School</option>
                <option value="HIGH_SCHOOL">High School / Vocational Certificate</option>
                <option value="HIGHER_VOCATIONAL">Higher Vocational Diploma</option>
                <option value="BACHELOR">Bachelor's Degree</option>
                <option value="MASTERS">Master's Degree</option>
                <option value="PHD">Doctoral Degree (PhD)</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Degree & Major */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label required>Degree</Label>
              <input
                type="text"
                placeholder="e.g. Bachelor of Engineering"
                className={inputClassName}
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              />
            </div>
            <div>
              <Label required>Field of Study (Major)</Label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                className={inputClassName}
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              />
            </div>
          </div>

          {/* Year & GPA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label required>Year of Study</Label>
              <select
                value={formData.yearOfStudy}
                onChange={(e) => {
                  const selectedVal = e.target.value;
                  setFormData({
                    ...formData,
                    yearOfStudy: selectedVal,
                    isCurrent: selectedVal !== "Graduated" && selectedVal !== "",
                  });
                }}
                className={inputClassName}
              >
                <option value="" disabled>Select year</option>
                {[1, 2, 3, 4, 5, 6].map((y) => (
                  <option key={y} value={y.toString()}>Year {y}</option>
                ))}
                <option value="Graduated">Graduated</option>
              </select>
            </div>
            <div>
              <Label required>GPA (Current/Final)</Label>
              <input
                type="text"
                placeholder="e.g. 3.50"
                className={inputClassName}
                value={formData.gpa}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                    if (Number(val) > 4.0) return;
                    setFormData({ ...formData, gpa: val });
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <button
            onClick={onClose}
            className="order-2 sm:order-1 px-8 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="order-1 sm:order-2 px-12 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-blue-500/20"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : education ? "Update Education" : "Add Education"}
          </button>
        </div>
      </div>
    </div>
  );
}