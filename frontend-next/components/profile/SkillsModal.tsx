"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

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

interface MasterSkill {
  id: string;
  name: string;
  category: string;
}

const getMappedCategory = (rawCategory: string) => {
  const cat = (rawCategory || "").toUpperCase();
  if (cat.includes("TECH")) return "Technical Skill";
  if (cat.includes("BUSI") || cat.includes("SOFT")) return "Business Skills";
  return "Other Skills";
};

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
  const [errorMsg, setErrorMsg] = useState("");
  const [availableSkills, setAvailableSkills] = useState<MasterSkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);

  useEffect(() => {
    if (isOpen && availableSkills.length === 0) {
      const fetchMasterSkills = async () => {
        try {
          setIsLoadingSkills(true);
          const data = await apiFetch<{ skills: MasterSkill[] }>("/api/skills");
          setAvailableSkills(data.skills || []);
        } catch (error) {
          console.error("Failed to fetch master skills:", error);
        } finally {
          setIsLoadingSkills(false);
        }
      };
      fetchMasterSkills();
    }
  }, [isOpen, availableSkills.length]);

  useEffect(() => {
    if (editingSkill) setFormData(editingSkill);
    else setFormData({ name: "", category: "", level: "" });
    setErrorMsg("");
  }, [editingSkill, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.level) {
      setErrorMsg("Please fill in all required fields and select a proficiency level.");
      return;
    }
    setErrorMsg("");
    onSave(formData);
  };

  const filteredSkills = availableSkills.filter((skill) => {
    return getMappedCategory(skill.category) === formData.category;
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-[700px] flex flex-col border border-slate-100 dark:border-slate-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-50 dark:border-slate-800">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {editingSkill ? "Edit Skill" : "Add New Skill"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
          {errorMsg && (
            <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-xl text-sm font-bold flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category */}
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">
                1. Select Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value, name: "" });
                    setErrorMsg("");
                  }}
                  className="w-full appearance-none px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[15px] text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="" disabled>Choose Category</option>
                  <option value="Technical Skill">Technical Skill</option>
                  <option value="Business Skills">Business Skills</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Skill Name */}
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">
                2. Skill Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrorMsg("");
                  }}
                  className="w-full appearance-none px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[15px] text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  disabled={isLoadingSkills || !formData.category}
                >
                  <option value="" disabled>
                    {!formData.category ? "Waiting for category..." : isLoadingSkills ? "Loading..." : "Select Skill"}
                  </option>
                  {filteredSkills.map((skill) => (
                    <option key={skill.id} value={skill.name}>{skill.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Proficiency Level */}
          <div>
            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4">
              3. Proficiency Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Beginner */}
              <div
                onClick={() => setFormData({ ...formData, level: "Beginner" })}
                className={`group border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                  formData.level === "Beginner"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/5"
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm transition-colors ${formData.level === "Beginner" ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300"}`}>1</div>
                  <span className={`font-black text-[15px] ${formData.level === "Beginner" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>Beginner</span>
                </div>
                <div className="flex gap-1.5 mb-4">
                  <div className={`h-1.5 flex-1 rounded-full ${formData.level === "Beginner" ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800" />
                </div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase leading-relaxed">Basic knowledge & guidance needed</p>
              </div>

              {/* Intermediate */}
              <div
                onClick={() => setFormData({ ...formData, level: "Intermediate" })}
                className={`group border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                  formData.level === "Intermediate"
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-lg shadow-blue-500/5"
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm transition-colors ${formData.level === "Intermediate" ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300"}`}>2</div>
                  <span className={`font-black text-[15px] ${formData.level === "Intermediate" ? "text-blue-700 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>Intermediate</span>
                </div>
                <div className="flex gap-1.5 mb-4">
                  <div className={`h-1.5 flex-1 rounded-full ${formData.level === "Intermediate" ? "bg-blue-500" : "bg-blue-500/40"}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${formData.level === "Intermediate" ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                  <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800" />
                </div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase leading-relaxed">Can work independently on tasks</p>
              </div>

              {/* Advanced */}
              <div
                onClick={() => setFormData({ ...formData, level: "Advanced" })}
                className={`group border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                  formData.level === "Advanced"
                    ? "border-violet-500 bg-violet-50/50 dark:bg-violet-500/10 shadow-lg shadow-violet-500/5"
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm transition-colors ${formData.level === "Advanced" ? "bg-violet-500" : "bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300"}`}>3</div>
                  <span className={`font-black text-[15px] ${formData.level === "Advanced" ? "text-violet-700 dark:text-violet-400" : "text-slate-500 dark:text-slate-400"}`}>Advanced</span>
                </div>
                <div className="flex gap-1.5 mb-4">
                  <div className={`h-1.5 flex-1 rounded-full ${formData.level === "Advanced" ? "bg-violet-500" : "bg-violet-500/40"}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${formData.level === "Advanced" ? "bg-violet-500" : "bg-violet-500/40"}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${formData.level === "Advanced" ? "bg-violet-500" : "bg-slate-200 dark:bg-slate-700"}`} />
                </div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase leading-relaxed">Expert knowledge & can mentor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            {editingSkill ? "Save Changes" : "Confirm Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
