"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export interface ModalCertificate {
  id?: string;
  name: string;
  description?: string;
  issuedBy?: string;
  date?: string;
  tags?: string[];
  file?: File | null;
  url?: string;
}

interface CertificatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (certificate: ModalCertificate) => void;
  editingCertificate?: ModalCertificate | null;
}

export default function CertificatesModal({
  isOpen,
  onClose,
  onSave,
  editingCertificate,
}: CertificatesModalProps) {
  const [formData, setFormData] = useState<ModalCertificate>({
    name: "",
    description: "",
    issuedBy: "",
    date: "",
    tags: [],
    file: null,
  });
  const [selectedSkill, setSelectedSkill] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);

  useEffect(() => {
    if (editingCertificate) {
      setFormData({
        ...editingCertificate,
        file: null,
        url: editingCertificate.url || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        issuedBy: "",
        date: "",
        tags: [],
        file: null,
      });
    }
    setErrorMsg("");
  }, [editingCertificate, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchSkills = async () => {
        setIsLoadingSkills(true);
        try {
          const res = await apiFetch<{ skills: any[] }>(
            "/api/candidates/skills",
          );

          const skillNames = res.skills
            .map((s: any) => s.name || s.skill?.name)
            .filter(Boolean);

          setAvailableSkills(Array.from(new Set(skillNames)));
        } catch (error) {
          console.error("Failed to fetch skills:", error);
        } finally {
          setIsLoadingSkills(false);
        }
      };

      fetchSkills();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (selectedSkill && !formData.tags?.includes(selectedSkill)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), selectedSkill],
      });
      setSelectedSkill("");
      setErrorMsg("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, file: e.target.files[0] });
      setErrorMsg("");
    }
  };

  const handleSubmit = () => {
    if (
      !formData.name?.trim() ||
      !formData.description?.trim() ||
      !formData.issuedBy?.trim() ||
      !formData.date?.trim()
    ) {
      setErrorMsg("Please fill in all required text fields.");
      return;
    }
    if (!formData.tags || formData.tags.length === 0) {
      setErrorMsg("Please add at least one related skill.");
      return;
    }
    if (!formData.file && !editingCertificate?.id && !formData.url) {
      setErrorMsg("Please upload a certificate file.");
      return;
    }

    setErrorMsg("");
    onSave(formData);
  };

  const hasFile = !!formData.file || !!formData.url;
  const displayFileName = formData.file
    ? formData.file.name
    : formData.url
      ? "Existing File Uploaded"
      : "Drop certificate here";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between p-7 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {editingCertificate ? "Edit Certificate" : "Add New Certificate"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all p-2 rounded-xl"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-7">
          {errorMsg && (
            <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errorMsg}
            </div>
          )}

          {/* Certificate Name */}
          <div className="space-y-2">
            <label className="text-[13px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1">
              Certificate Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Advanced React Patterns"
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all text-slate-900 dark:text-white font-bold"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrorMsg("");
              }}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[13px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Tell us what you achieved..."
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all text-slate-900 dark:text-white font-medium resize-none"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setErrorMsg("");
              }}
            />
          </div>

          {/* Issued By & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Issued By <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Google, Coursera, etc."
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white font-bold"
                value={formData.issuedBy}
                onChange={(e) => {
                  setFormData({ ...formData, issuedBy: e.target.value });
                  setErrorMsg("");
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Completion Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white font-bold [color-scheme:light] dark:[color-scheme:dark]"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  setErrorMsg("");
                }}
              />
            </div>
          </div>

          {/* Related Skills */}
          <div className="space-y-3">
            <label className="text-[13px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Related Skills <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-3">
              <select
                className="flex-1 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white font-bold appearance-none cursor-pointer disabled:opacity-50"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                disabled={isLoadingSkills}
              >
                <option value="">
                  {isLoadingSkills ? "Loading skills..." : "Select a skill"}
                </option>
                {availableSkills.map((skillName, idx) => (
                  <option key={idx} value={skillName}>
                    {skillName}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddSkill}
                disabled={!selectedSkill}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black uppercase tracking-wider border border-blue-100 dark:border-blue-500/20 transition-all hover:scale-105"
                >
                  {tag}
                  <button
                    onClick={() => removeSkill(tag)}
                    className="hover:text-rose-500 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* ── Upload File Section (Matched to Image 2) ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Upload Proof {(!editingCertificate?.id && !formData.url) && <span className="text-rose-500">*</span>}
              </label>
              {(formData.url && !formData.file) && (
                <a href={formData.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:underline">
                  View Current File
                </a>
              )}
            </div>

            <div className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all group flex flex-col items-center justify-center min-h-[180px]
              ${hasFile 
                ? "border-emerald-500 bg-slate-50 dark:bg-[#0B1120]" 
                : "border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-blue-50/30"} `}>
              
              <input 
                type="file" 
                className="hidden" 
                id="cert-upload" 
                onChange={handleFileChange} 
                accept=".pdf,.docx,.jpg,.jpeg,.png" 
              />

              {hasFile ? (
                <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center w-full">
                  <div className="w-14 h-14 rounded-[1.25rem] bg-[#10b981] text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                    {/* Checkmark Circle Icon */}
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-900 dark:text-white font-black mb-1 text-[17px] truncate max-w-[250px]">
                    {formData.file ? formData.file.name : (formData.url ? formData.url.split('/').pop() || "Certificate_Document.pdf" : "File Uploaded")}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-[0.1em] mt-1">
                    Click to change file
                  </p>
                </label>
              ) : (
                <label htmlFor="cert-upload" className="cursor-pointer flex flex-col items-center w-full">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 text-blue-600 mb-4 shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-slate-900 dark:text-white font-black mb-1 text-lg">
                    Drop certificate here
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                    PDF, JPG, PNG (Max 5MB)
                  </p>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-end gap-4 p-7 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            {editingCertificate ? "Save Changes" : "Create Certificate"}
          </button>
        </div>
      </div>
    </div>
  );
}
