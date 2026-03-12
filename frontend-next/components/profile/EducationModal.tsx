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
  // 💡 1. เปลี่ยน studyStatus เป็น isCurrent เพื่อให้สอดคล้องกับ API
  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    major: "",
    educationLevel: "BACHELOR",
    yearOfStudy: "",
    gpa: "",
    isCurrent: true,
  });

  const [universities, setUniversities] = useState<
    Array<{
      id: string;
      name: string;
      thname: string | null;
      code: string | null;
    }>
  >([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize data when editing
  useEffect(() => {
    if (isOpen && education) {
      const isCurrent =
        education.isCurrent ??
        !(education.endDate || (education as any).endYear);

      // ดึงค่า yearOfStudy เดิมมา ถ้าเรียนจบแล้วให้บังคับแสดงเป็น Graduated
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
        isCurrent: isCurrent, // 💡 ใช้ isCurrent แทน
      });
    } else if (isOpen) {
      // Reset form for new entry
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
  }, [isOpen, education]); // 💡 เอา education?.id ออก ใช้แค่ education ก็พอ

  // Load universities
  useEffect(() => {
    if (isOpen) {
      (async () => {
        setUniversitiesLoading(true);
        try {
          const data = await apiFetch<{
            universities: Array<{
              id: string;
              name: string;
              thname: string | null;
              code: string | null;
            }>;
          }>(`/api/universities`);
          setUniversities(data.universities || []);
        } catch (err) {
          console.error("Failed to load universities:", err);
        } finally {
          setUniversitiesLoading(false);
        }
      })();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!formData.school || !formData.degree || !formData.major) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (สถาบัน, ปริญญา, สาขาวิชา)");
      return;
    }

    setIsSaving(true);
    try {
      // 💡 2. อัปเดต payload ให้ใช้ formData.isCurrent ที่คำนวณมาแล้ว
      const payload = {
        universityName: formData.school,
        degreeName: formData.degree,
        fieldOfStudy: formData.major,
        educationLevel: formData.educationLevel,
        yearOfStudy: formData.isCurrent
          ? `${formData.yearOfStudy}th Year`
          : "Graduated",
        gpa: parseFloat(formData.gpa) || 0,
        isCurrent: formData.isCurrent,
        endDate: formData.isCurrent
          ? null
          : (education as any)?.endDate || null,
      };

      await apiFetch(
        education
          ? `/api/candidates/education/${education.id}`
          : "/api/candidates/education",
        {
          method: education ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {education ? "Edit Education" : "Add Education"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-5">
          {/* Education Level & Institution */}
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Education Level <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.educationLevel}
                onChange={(e) =>
                  setFormData({ ...formData, educationLevel: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="BELOW_HIGH_SCHOOL">Below High School</option>
                <option value="HIGH_SCHOOL">
                  High School / Vocational Certificate
                </option>
                <option value="HIGHER_VOCATIONAL">
                  Higher Vocational Diploma
                </option>
                <option value="BACHELOR">Bachelor's Degree</option>
                <option value="MASTERS">Master's Degree</option>
                <option value="PHD">Doctoral Degree (PhD)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Institution Name <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={universities.map((uni) => ({
                  value: uni.name,
                  label: uni.thname ? `${uni.name} (${uni.thname})` : uni.name,
                }))}
                value={formData.school}
                onChange={(val) => setFormData({ ...formData, school: val })}
                placeholder="Select Institution"
              />
            </div>
          </div>

          {/* Degree & Field of Study */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Degree <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Bachelor of Engineering"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.degree}
                onChange={(e) =>
                  setFormData({ ...formData, degree: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Field of Study <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Computer Engineering"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.major}
                onChange={(e) =>
                  setFormData({ ...formData, major: e.target.value })
                }
              />
            </div>
          </div>

          {/* Year & GPA */}
          <div className="grid grid-cols-2 gap-4">
            {/* Year of Study Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Year of Study <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.yearOfStudy}
                onChange={(e) => {
                  const selectedVal = e.target.value;
                  setFormData({
                    ...formData,
                    yearOfStudy: selectedVal,
                    isCurrent:
                      selectedVal !== "Graduated" && selectedVal !== "",
                  });
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="" disabled>
                  Select year
                </option>
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y.toString()}>
                    Year {y}
                  </option>
                ))}
                <option value="Graduated">Graduated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                GPA <span className="text-gray-400 font-normal">(Current)</span>{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 3.50"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.gpa}
                onChange={(e) => {
                  const val = e.target.value;
                  // ตรวจสอบ: ว่างเปล่า หรือ ตัวเลขที่มีทศนิยมสูงสุด 2 ตำแหน่ง
                  if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                    // หากต้องการจำกัดเกรดสูงสุดไม่เกิน 4.00 เปิดใช้โค้ดบรรทัดด้านล่าง
                    if (Number(val) > 4.0) return;
                    setFormData({ ...formData, gpa: val });
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons - อยู่ข้างนอก p-8 และถูกต้องตามลำดับ */}
        <div className="flex justify-center gap-3 p-8 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-full border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-200"
          >
            {isSaving ? "Saving..." : education ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
