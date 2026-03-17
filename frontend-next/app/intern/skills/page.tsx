"use client";

import { useCallback, useEffect, useState } from "react";
import InternNavbar from "@/components/InternNavbar";
import InternSidebar from "@/components/InternSidebar";
import SkillsModal, { SkillData } from "@/components/profile/SkillsModal";
import { apiFetch } from "@/lib/api";
import SkillTest from "@/components/skills/SkillTest";

// --- Types ---
type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced";
type VerificationStatus = "NOT_VERIFIED" | "VERIFIED";

interface Skill {
  id: string;
  name: string;
  status: VerificationStatus;
  level: ProficiencyLevel;
  category: string;
  attemptsUsed: number;
  nextAvailableDate: string | null;
  // Evidence
  hasCertEvidence?: boolean;
  hasProjectEvidence?: boolean;
}

// --- Delete Confirmation Modal ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  skillName: string;
  isDeleting: boolean;
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, skillName, isDeleting }: DeleteModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isDeleting && onClose()} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Skill?</h3>
        <p className="text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-700">"{skillName}"</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button disabled={isDeleting} onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50">Cancel</button>
          <button disabled={isDeleting} onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center">
            {isDeleting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Helpers ---
const categoryToDB: Record<string, string> = {
  "Technical Skill": "TECHNICAL",
  "Business Skills": "BUSINESS",
};

// --- Evidence Badge ---
const YellowCheck = () => (
  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#FFC456] flex-shrink-0">
    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  </span>
);

const GreenCheck = () => (
  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#B2CD6D] flex-shrink-0">
    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  </span>
);

// --- Main ---
export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filterTab, setFilterTab] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("Select Category");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [testingSkill, setTestingSkill] = useState<{ id: string; name: string } | null>(null);

  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: "", name: "" });

  useEffect(() => {
    const shouldHideScroll = isModalOpen || deleteModal.isOpen;
    document.body.style.overflow = shouldHideScroll ? "hidden" : "auto";
  }, [isModalOpen, deleteModal.isOpen]);

  const loadSkills = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      // โหลด skills + profile (เพื่อดึง certificates และ projects สำหรับ evidence)
      const [skillsRes, profileRes] = await Promise.all([
        apiFetch<{ skills: any[] }>("/api/candidates/skills"),
        apiFetch<{ profile: any }>("/api/candidates/profile").catch(() => ({ profile: null })),
      ]);

      const profile = (profileRes as any).profile;

      // สร้าง Set ชื่อ skill ที่มี evidence
      const certificates = profile?.files?.certificates || profile?.certificates || profile?.CertificateFile || [];
      const projects = profile?.projects || [];

      const certSkillNames = new Set<string>(
        certificates.flatMap((c: any) => c.relatedSkills || c.tags || [])
      );
      const projectSkillNames = new Set<string>(
        projects.flatMap((p: any) => p.relatedSkills || p.skills || [])
      );

      const mappedSkills = (skillsRes.skills || []).map((skill: any): Skill => {
        let levelStr: ProficiencyLevel = "Beginner";
        if (skill.level === "intermediate" || skill.level === "Intermediate" || skill.rating === 2) {
          levelStr = "Intermediate";
        } else if (skill.level === "advanced" || skill.level === "Advanced" || skill.rating === 3) {
          levelStr = "Advanced";
        }

        const categoryMap: Record<string, string> = {
          TECHNICAL: "Technical Skill",
          BUSINESS: "Business Skills",
        };
        const categoryLabel = categoryMap[skill.category?.toUpperCase()] || skill.category || "Technical Skill";

        return {
          id: skill.id,
          name: skill.name || skill.skill?.name || "Unknown Skill",
          category: categoryLabel,
          level: levelStr,
          status: skill.status ? skill.status.toUpperCase() : "NOT_VERIFIED",
          attemptsUsed: skill.attemptsUsed || 0,
          nextAvailableDate: skill.nextAvailableDate || null,
          hasCertEvidence: certSkillNames.has(skill.name),
          hasProjectEvidence: projectSkillNames.has(skill.name),
        };
      });

      setSkills(mappedSkills);
    } catch (error) {
      console.error("Failed to load skills:", error);
      setLoadError(error instanceof Error ? error.message : "Failed to load skills");
      setSkills([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadSkills(); }, [loadSkills]);

  const handleAddClick = () => { setEditingSkill(null); setIsModalOpen(true); };
  const handleEditClick = (skill: Skill) => {
    setEditingSkill({ id: skill.id, name: skill.name, category: skill.category, level: skill.level });
    setIsModalOpen(true);
  };

  const handleSaveSkill = async (savedSkill: SkillData) => {
    try {
      const payload = { ...savedSkill, category: categoryToDB[savedSkill.category] || savedSkill.category };
      const method = editingSkill?.id ? "PUT" : "POST";
      const url = editingSkill?.id ? `/api/candidates/skills/${editingSkill.id}` : `/api/candidates/skills`;
      await apiFetch(url, { method, body: JSON.stringify(payload) });
      await loadSkills();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save skill:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeletingLoading(true);
      await apiFetch(`/api/candidates/skills/${deleteModal.id}`, { method: "DELETE" });
      await loadSkills();
      setDeleteModal({ isOpen: false, id: "", name: "" });
    } catch (error) {
      console.error("Failed to delete skill:", error);
      alert("Failed to delete skill.");
    } finally {
      setIsDeletingLoading(false);
    }
  };

  // ── Filter logic ──
  const filteredSkills = skills.filter((skill) => {
    const matchSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());

    let matchTab = true;
    if (filterTab === "Not Verified") {
      matchTab = skill.status === "NOT_VERIFIED" && !skill.hasCertEvidence && !skill.hasProjectEvidence;
    } else if (filterTab === "Verified") {
      matchTab = skill.status === "VERIFIED";
    } else if (filterTab === "Certificate") {
      matchTab = !!skill.hasCertEvidence;
    } else if (filterTab === "Project") {
      matchTab = !!skill.hasProjectEvidence;
    }

    const matchCategory = categoryFilter === "Select Category" || skill.category === categoryFilter;
    return matchSearch && matchTab && matchCategory;
  });

  const getLevelStyles = (level: ProficiencyLevel) => {
    switch (level) {
      case "Beginner": return { color: "#68B383", width: "33.33%" };
      case "Intermediate": return { color: "#3B82F6", width: "66.66%" };
      case "Advanced": return { color: "#8B5CF6", width: "100%" };
      default: return { color: "#E5E7EB", width: "0%" };
    }
  };

  // ── Evidence badge ──
  const EvidenceBadge = ({ skill }: { skill: Skill }) => {
    if (skill.status === "VERIFIED") {
      return (
        <span className="flex items-center gap-1 text-xs text-[#6B7280] font-medium">
          <GreenCheck /> Verified By Skill Test
        </span>
      );
    }
    if (skill.hasCertEvidence && skill.hasProjectEvidence) {
      return (
        <span className="flex items-center gap-1 text-xs text-[#6B7280] font-medium">
          <YellowCheck /> Evidence By Certificate & Project
        </span>
      );
    }
    if (skill.hasCertEvidence) {
      return (
        <span className="flex items-center gap-1 text-xs text-[#6B7280] font-medium">
          <YellowCheck /> Evidence By Certificate
        </span>
      );
    }
    if (skill.hasProjectEvidence) {
      return (
        <span className="flex items-center gap-1 text-xs text-[#6B7280] font-medium">
          <YellowCheck /> Evidence By Project
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs text-[#6B7280] font-medium">
        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        Not Verified
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#E6EBF4] flex flex-col">
      <InternNavbar />
      <div className="flex flex-1">
        <InternSidebar />
        <div className="layout-container layout-page flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0273B1] rounded-full animate-spin" />
            </div>
          ) : loadError ? (
            <div className="m-8 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">{loadError}</div>
          ) : testingSkill ? (
            <div className="w-full">
              <SkillTest skillId={testingSkill.id} skillName={testingSkill.name} onBack={() => { setTestingSkill(null); loadSkills(); }} />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-[36px] font-extrabold text-black mb-1 tracking-tight">Skills</h1>
                  <p className="text-gray-500 text-sm">A collection of skills you have created and added to your profile.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative w-full lg:w-80">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                    />
                  </div>
                  <button className="px-6 py-2.5 bg-white border border-[#3B82F6] text-[#3B82F6] text-sm font-bold rounded-full hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap" onClick={handleAddClick}>
                    + Add Skill
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4">
                <div className="flex flex-wrap gap-3">
                  {["All", "Not Verified", "Verified", "Certificate", "Project"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilterTab(tab)}
                      className={`px-6 py-2.5 text-sm font-bold rounded-lg border transition-colors ${
                        filterTab === tab
                          ? "border-[#3B82F6] text-[#3B82F6] bg-white shadow-sm"
                          : "border-gray-200 text-black bg-white hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none w-48 shadow-sm cursor-pointer"
                    >
                      <option value="Select Category">Select Category</option>
                      <option value="Technical Skill">Technical Skill</option>
                      <option value="Business Skills">Business Skills</option>
                    </select>
                    <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <button
                    onClick={() => { setFilterTab("All"); setCategoryFilter("Select Category"); setSearchQuery(""); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-black font-bold text-sm rounded-lg hover:bg-gray-50 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Clear Filter
                  </button>
                </div>
              </div>

              {/* Grid */}
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">{filteredSkills.length} Total Skills</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSkills.map((skill) => {
                  const style = getLevelStyles(skill.level);
                  return (
                    <div key={skill.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                      {/* Top: Name & Evidence Badge */}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-[19px] font-bold text-gray-900">{skill.name}</h3>
                        <EvidenceBadge skill={skill} />
                      </div>

                      {/* Progress Bar */}
                      <div className="relative w-full h-[10px] bg-[#E2E8F0] rounded-full mb-3 overflow-hidden">
                        <div className="absolute top-0 left-0 h-full transition-all duration-500" style={{ width: style.width, backgroundColor: style.color }} />
                        <div className="absolute top-0 left-[33.33%] w-0.5 h-full bg-white z-10" />
                        <div className="absolute top-0 left-[66.66%] w-0.5 h-full bg-white z-10" />
                      </div>

                      {/* Level Badge */}
                      <div className="mb-6">
                        <span className="inline-block px-3 py-1 rounded text-[11px] font-bold text-white shadow-sm" style={{ backgroundColor: style.color }}>
                          {skill.level}
                        </span>
                      </div>

                      {/* Bottom: Category & Actions */}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="text-sm text-gray-500 font-medium">{skill.category}</span>
                        <div className="flex gap-3">
                          {/* Delete */}
                          <button className="text-gray-400 hover:text-red-500 transition-colors mr-1" onClick={() => setDeleteModal({ isOpen: true, name: skill.name, id: skill.id })}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          {/* Skill Test */}
                          <button
                            disabled={skill.attemptsUsed >= 3}
                            onClick={() => setTestingSkill({ id: skill.id, name: skill.name })}
                            title={skill.attemptsUsed >= 3 && skill.nextAvailableDate ? `You can test again on: ${new Date(skill.nextAvailableDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : `Attempts used: ${skill.attemptsUsed || 0}/3`}
                            className={`px-5 py-1.5 border text-sm font-bold rounded-lg transition-colors shadow-sm ${skill.attemptsUsed >= 3 ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed" : "border-[#3B82F6] text-[#3B82F6] hover:bg-blue-50"}`}
                          >
                            Skill Test {skill.attemptsUsed || 0}/3
                          </button>
                          {/* Edit */}
                          <button onClick={() => handleEditClick(skill)} className="px-5 py-1.5 border border-[#3B82F6] text-[#3B82F6] text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {filteredSkills.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="font-medium">No skills found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <SkillsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveSkill} editingSkill={editingSkill} />
      <DeleteConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))} onConfirm={handleConfirmDelete} skillName={deleteModal.name} isDeleting={isDeletingLoading} />
    </div>
  );
}