"use client";

import { useState, useEffect } from "react";

// Types
export type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced" | "";

export interface SkillData {
  id?: string;
  name: string;
  category: string;
  level: ProficiencyLevel;
}

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skill: SkillData) => void;
  editingSkill?: SkillData | null;
}

export default function SkillsModal({
  isOpen,
  onClose,
  onSave,
  editingSkill,
}: SkillsModalProps) {
  const [formData, setFormData] = useState<SkillData>({
    name: "",
    category: "",
    level: "",
  });
  
  // State สำหรับเก็บข้อความแจ้งเตือน Error
  const [errorMsg, setErrorMsg] = useState("");

  // อัปเดตข้อมูลเมื่อมีการแก้ไข (Edit Mode) หรือรีเซ็ตเมื่อเปิดใหม่ (Add Mode)
  useEffect(() => {
    if (editingSkill) {
      setFormData(editingSkill);
    } else {
      setFormData({ name: "", category: "", level: "" });
    }
    setErrorMsg(""); // ล้าง Error ทุกครั้งที่เปิด Modal ใหม่
  }, [editingSkill, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Validation: ตรวจสอบว่ากรอกข้อมูลครบทุกช่องหรือไม่
    if (!formData.name || !formData.category || !formData.level) {
      setErrorMsg("Please fill in all required fields and select a proficiency level.");
      return;
    }
    
    setErrorMsg(""); // ล้าง Error
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
      {/* Modal Container */}
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-[22px] font-bold text-[#1C2D4F]">
            {editingSkill ? "Edit Skill" : "Add Skills"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* แสดงข้อความ Error สีแดง ถ้ามี */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01"></path>
              </svg>
              {errorMsg}
            </div>
          )}

          {/* Skill Name */}
          <div>
            <label className="block text-[15px] font-bold text-[#1C2D4F] mb-2">
              Skill Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrorMsg(""); // ล้าง Error เมื่อเริ่มกรอก
                }}
                className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-lg text-[15px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer"
              >
                <option value="" disabled>Select skill</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="HTML">HTML</option>
                <option value="React">React</option>
                <option value="Figma">Figma</option>
                <option value="Excel">Excel</option>
              </select>
              <svg className="w-5 h-5 text-gray-300 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[15px] font-bold text-[#1C2D4F] mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  setErrorMsg("");
                }}
                className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-lg text-[15px] text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer"
              >
                <option value="" disabled>Select category</option>
                <option value="Technical Skill">Technical Skill</option>
                <option value="Business Skills">Business Skills</option>
                <option value="Soft Skill">Soft Skill</option>
              </select>
              <svg className="w-5 h-5 text-gray-300 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Proficiency Level */}
          <div>
            <label className="block text-[15px] font-bold text-[#1C2D4F] mb-3">
              Proficiency Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Beginner Card */}
              <div
                onClick={() => {
                  setFormData({ ...formData, level: "Beginner" });
                  setErrorMsg("");
                }}
                className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                  formData.level === "Beginner"
                    ? "border-[#68B383] border-[2px] shadow-sm bg-[#F0FDF4]/30"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#68B383] flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <span className="font-bold text-gray-900 text-[15px]">Beginner</span>
                </div>
                <div className="flex gap-1.5 mb-3">
                  <div className={`h-1.5 flex-1 rounded-full ${formData.level === "Beginner" ? "bg-[#68B383]" : "bg-[#68B383]"}`}></div>
                  <div className="h-1.5 flex-1 rounded-full bg-[#E2E8F0]"></div>
                  <div className="h-1.5 flex-1 rounded-full bg-[#E2E8F0]"></div>
                </div>
                <p className="text-[13px] text-gray-500 font-medium mt-3">Learning basics, needs guidance</p>
              </div>

              {/* Intermediate Card */}
              <div
                onClick={() => {
                  setFormData({ ...formData, level: "Intermediate" });
                  setErrorMsg("");
                }}
                className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                  formData.level === "Intermediate"
                    ? "border-[#3B82F6] border-[2px] shadow-sm bg-[#EFF6FF]/30"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <span className="font-bold text-gray-900 text-[15px]">Intermediate</span>
                </div>
                <div className="flex gap-1.5 mb-3">
                  <div className={`h-1.5 flex-1 rounded-full ${formData.level === "Intermediate" ? "bg-[#3B82F6]" : "bg-[#3B82F6]"}`}></div>
                  <div className={`h-1.5 flex-1 rounded-full ${formData.level === "Intermediate" ? "bg-[#3B82F6]" : "bg-[#3B82F6]"}`}></div>
                  <div className="h-1.5 flex-1 rounded-full bg-[#E2E8F0]"></div>
                </div>
                <p className="text-[13px] text-gray-500 font-medium mt-3">Can work independently</p>
              </div>

              {/* Advanced Card */}
              <div
                onClick={() => {
                  setFormData({ ...formData, level: "Advanced" });
                  setErrorMsg("");
                }}
                className={`border rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                  formData.level === "Advanced"
                    ? "border-[#8B5CF6] border-[2px] shadow-sm bg-[#F5F3FF]/30"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <span className="font-bold text-gray-900 text-[15px]">Advanced</span>
                </div>
                <div className="flex gap-1.5 mb-3">
                  <div className={`h-1.5 flex-1 rounded-full ${formData.level === "Advanced" ? "bg-[#8B5CF6]" : "bg-[#8B5CF6]"}`}></div>
                  <div className={`h-1.5 flex-1 rounded-full ${formData.level === "Advanced" ? "bg-[#8B5CF6]" : "bg-[#8B5CF6]"}`}></div>
                  <div className={`h-1.5 flex-1 rounded-full ${formData.level === "Advanced" ? "bg-[#8B5CF6]" : "bg-[#8B5CF6]"}`}></div>
                </div>
                <p className="text-[13px] text-gray-500 font-medium mt-3">Can mentor others</p>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 p-6 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-[15px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-[#2563EB] text-white rounded-lg text-[15px] font-bold hover:bg-blue-600 transition-colors shadow-sm"
          >
            {editingSkill ? "Save Changes" : "Add Skill"}
          </button>
        </div>

      </div>
    </div>
  );
}