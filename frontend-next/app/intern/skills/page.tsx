"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import InternNavbar from "@/components/InternNavbar";
import InternSidebar from "@/components/InternSidebar";
import SkillsModal, { SkillData } from "@/components/profile/SkillsModal";
import { apiFetch } from "@/lib/api";
import SkillTest from "@/components/skills/SkillTest";
import { Search, Plus, Filter, Trash2, Edit3, AlertCircle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

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
  hasCertEvidence?: boolean;
  hasProjectEvidence?: boolean;
}

// --- 1. Delete Confirmation Modal ---
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
      <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 size={32} className="text-rose-600 dark:text-rose-400" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Delete Skill?</h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
          Are you sure you want to delete <b className="text-slate-900 dark:text-slate-200">"{skillName}"</b>?
        </p>
        <div className="flex gap-4">
          <button disabled={isDeleting} onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50">Cancel</button>
          <button disabled={isDeleting} onClick={onConfirm} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center">
            {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 2. Evidence Badge ---
function EvidenceBadge({ skill }: { skill: Skill }) {
  let label = "Not Verified";
  let colorClass = "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700";
  let dotClass = "bg-slate-300 dark:bg-slate-600";
  
  if (skill.status === "VERIFIED") { 
    label = "Verified"; colorClass = "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"; dotClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"; 
  } else if (skill.hasCertEvidence || skill.hasProjectEvidence) { 
    label = "Has Evidence"; colorClass = "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"; dotClass = "bg-amber-500"; 
  }
  
  return (
    <span className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${colorClass}`}>
      <div className={`w-2 h-2 rounded-full ${dotClass} ${label === "Not Verified" ? "" : label === "Verified" ? "" : "animate-pulse"}`} />
      {label}
    </span>
  );
}

// --- Main ---
export default function SkillsPage() {
  const { profileData, refetch } = useProfile();
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

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkSelectedSkills, setBulkSelectedSkills] = useState<string[]>([]);
  const [bulkSkillLevels, setBulkSkillLevels] = useState<Record<string, string>>({});
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // --- Confirm Action State ---
  const [confirmBulkAction, setConfirmBulkAction] = useState<"add" | "discard" | null>(null);

  const [ignoredSkills, setIgnoredSkills] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("ignored_missing_skills");
    if (stored) {
      try { setIgnoredSkills(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const shouldHideScroll = isModalOpen || deleteModal.isOpen || isBulkModalOpen || !!confirmBulkAction;
    document.body.style.overflow = shouldHideScroll ? "hidden" : "auto";
  }, [isModalOpen, deleteModal.isOpen, isBulkModalOpen, confirmBulkAction]);

  const loadSkills = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const [skillsRes, profileRes] = await Promise.all([
        apiFetch<{ skills: any[] }>("/api/candidates/skills"),
        apiFetch<{ profile: any }>("/api/candidates/profile").catch(() => ({ profile: null })),
      ]);

      const profile = (profileRes as any).profile;
      const certificates = profile?.files?.certificates || profile?.certificates || [];
      const projects = profile?.projects || [];

      const certSkillNames = new Set<string>(certificates.flatMap((c: any) => c.relatedSkills || c.tags || []));
      const projectSkillNames = new Set<string>(projects.flatMap((p: any) => p.relatedSkills || p.skills || []));

      const mappedSkills = (skillsRes.skills || []).map((skill: any): Skill => {
        let levelStr: ProficiencyLevel = "Beginner";
        if (skill.level?.toLowerCase() === "intermediate" || skill.rating === 2) levelStr = "Intermediate";
        else if (skill.level?.toLowerCase() === "advanced" || skill.rating === 3) levelStr = "Advanced";

        const categoryMap: Record<string, string> = { TECHNICAL: "Technical Skill", BUSINESS: "Business Skills" };
        return {
          id: skill.id,
          name: skill.name || skill.skill?.name || "Unknown Skill",
          category: categoryMap[skill.category?.toUpperCase()] || skill.category || "Technical Skill",
          level: levelStr,
          status: skill.status?.toUpperCase() === "VERIFIED" ? "VERIFIED" : "NOT_VERIFIED",
          attemptsUsed: skill.attemptsUsed || 0,
          nextAvailableDate: skill.nextAvailableDate || null,
          hasCertEvidence: certSkillNames.has(skill.name),
          hasProjectEvidence: projectSkillNames.has(skill.name),
        };
      });

      setSkills(mappedSkills);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load skills");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadSkills(); }, [loadSkills]);

  const missingSkills = useMemo(() => {
    const userSkillNames = new Set(skills.map(s => s.name.toLowerCase().trim()));
    const evidenceSkills = new Map<string, string>(); 

    const certificates = profileData?.certificates || profileData?.certificates || [];
    const projects = profileData?.projects || [];

    certificates.forEach((c: any) => {
      (c.relatedSkills || c.tags || []).forEach((s: string) => evidenceSkills.set(s.toLowerCase().trim(), s));
    });
    projects.forEach((p: any) => {
      (p.relatedSkills || p.skills || []).forEach((s: string) => evidenceSkills.set(s.toLowerCase().trim(), s));
    });

    const missing: string[] = [];
    evidenceSkills.forEach((originalName, lowerName) => {
      if (!userSkillNames.has(lowerName) && !ignoredSkills.includes(lowerName)) {
        missing.push(originalName);
      }
    });

    return missing;
  }, [skills, profileData, ignoredSkills]);

  useEffect(() => {
    if (isBulkModalOpen) {
      setBulkSelectedSkills(missingSkills);
      const initialLevels: Record<string, string> = {};
      missingSkills.forEach(skill => initialLevels[skill] = "Beginner");
      setBulkSkillLevels(initialLevels);
    }
  }, [isBulkModalOpen, missingSkills]);

  const handleConfirmDelete = async () => {
    try {
      setIsDeletingLoading(true);
      await apiFetch(`/api/candidates/skills/${deleteModal.id}`, { method: "DELETE" });
      await loadSkills();
      await refetch();
      setDeleteModal({ isOpen: false, id: "", name: "" });
    } catch (error) {
      alert("Failed to delete skill.");
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const executeBulkSave = async () => {
    setIsBulkSaving(true);
    try {
      await Promise.all(
        bulkSelectedSkills.map(skillName => 
          apiFetch("/api/candidates/skills", {
            method: "POST",
            body: JSON.stringify({ name: skillName, category: "TECHNICAL", level: bulkSkillLevels[skillName] || "Beginner" })
          })
        )
      );
      await loadSkills();
      await refetch();
      setConfirmBulkAction(null);
      setIsBulkModalOpen(false);
    } catch (error) {
      alert("Failed to add selected skills.");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const executeDiscardAll = () => {
    const newIgnored = [
      ...ignoredSkills,
      ...missingSkills.map((s) => s.toLowerCase().trim()),
    ];
    setIgnoredSkills(newIgnored);
    localStorage.setItem("ignored_missing_skills", JSON.stringify(newIgnored));
    
    // Dispatch event เพื่อให้ Sidebar อัปเดตตัวเลขแจ้งเตือนแบบ Real-time
    window.dispatchEvent(new Event("ignored_skills_updated"));
    
    setConfirmBulkAction(null);
    setIsBulkModalOpen(false);
  };

  const toggleBulkSkill = (skill: string) => {
    setBulkSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setBulkSelectedSkills(missingSkills);
    else setBulkSelectedSkills([]);
  };

  const filteredSkills = skills.filter((skill) => {
    const matchSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchTab = true;
    if (filterTab === "Not Verified") matchTab = skill.status === "NOT_VERIFIED" && !skill.hasCertEvidence && !skill.hasProjectEvidence;
    else if (filterTab === "Verified") matchTab = skill.status === "VERIFIED";
    else if (filterTab === "Certificate") matchTab = !!skill.hasCertEvidence;
    else if (filterTab === "Project") matchTab = !!skill.hasProjectEvidence;

    const matchCategory = categoryFilter === "Select Category" || skill.category === categoryFilter;
    return matchSearch && matchTab && matchCategory;
  });

  const getLevelStyles = (level: ProficiencyLevel) => {
    switch (level) {
      case "Beginner": return { color: "#10B981", width: "33.33%", bg: "bg-emerald-500" };
      case "Intermediate": return { color: "#3B82F6", width: "66.66%", bg: "bg-blue-500" };
      case "Advanced": return { color: "#8B5CF6", width: "100%", bg: "bg-violet-500" };
      default: return { color: "#94A3B8", width: "0%", bg: "bg-slate-400" };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <InternNavbar />
      <div className="flex flex-1">
        <InternSidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin" /></div>
          ) : loadError ? (
            <div className="m-8 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 px-6 py-4 text-sm text-red-700 dark:text-red-400">{loadError}</div>
          ) : testingSkill ? (
            <div className="w-full">
              <SkillTest skillId={testingSkill.id} skillName={testingSkill.name} onBack={() => { setTestingSkill(null); loadSkills(); }} onRefresh={refetch} />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Skills</h1>
                  <p className="text-base font-bold text-slate-500 dark:text-slate-400 mt-2">Manage and verify your professional expertise.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="Search skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 dark:text-white transition-all shadow-sm" />
                  </div>
                  <button onClick={() => { setEditingSkill(null); setIsModalOpen(true); }} className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                    <Plus size={20} strokeWidth={3} /> Add Skill
                  </button>
                </div>
              </div>

              {/* Alert: Missing Skills */}
              {missingSkills.length > 0 && (
                <div className="mb-8 p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-full mt-1">
                      <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h4 className="text-rose-800 dark:text-rose-300 font-black text-[15px]">You have {missingSkills.length} skills in your evidence but not in your skills list!</h4>
                      <p className="text-rose-600/80 dark:text-rose-400/80 text-sm mt-1 font-medium">
                        You mentioned <b>{missingSkills.slice(0, 5).join(', ')}{missingSkills.length > 5 ? ` +${missingSkills.length - 5} more` : ''}</b> in your Projects or Certificates.
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsBulkModalOpen(true)} className="w-full sm:w-auto whitespace-nowrap px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95">
                    Review & Add Skills
                  </button>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4">
                <div className="flex flex-wrap p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl w-fit border border-slate-200 dark:border-slate-800">
                  {["All", "Not Verified", "Verified", "Certificate", "Project"].map((tab) => (
                    <button key={tab} onClick={() => setFilterTab(tab)} className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${filterTab === tab ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md" : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"}`}>{tab}</button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 focus:outline-none w-48 shadow-sm cursor-pointer">
                      <option value="Select Category">All Categories</option>
                      <option value="Technical Skill">Technical Skill</option>
                      <option value="Business Skills">Business Skills</option>
                    </select>
                    <Filter className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <button onClick={() => { setFilterTab("All"); setCategoryFilter("Select Category"); setSearchQuery(""); }} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm" title="Clear Filters"><AlertCircle size={20} /></button>
                </div>
              </div>

              {/* Grid */}
              <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-6">Showing {filteredSkills.length} Total Skills</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSkills.map((skill) => {
                  const style = getLevelStyles(skill.level);
                  return (
                    <div key={skill.id} className="group bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 p-8 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{skill.name}</h3>
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 block">{skill.category}</span>
                        </div>
                        <EvidenceBadge skill={skill} />
                      </div>

                      <div className="mb-2 flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: style.color }}>{skill.level} Proficiency</span>
                      </div>
                      <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
                        <div className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out ${style.bg}`} style={{ width: style.width }} />
                        <div className="absolute top-0 left-[33.33%] w-0.5 h-full bg-white dark:bg-slate-900 z-10 opacity-30" />
                        <div className="absolute top-0 left-[66.66%] w-0.5 h-full bg-white dark:bg-slate-900 z-10 opacity-30" />
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50 pt-6 mt-auto">
                        <div className="flex gap-2">
                          <button className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all" onClick={() => setDeleteModal({ isOpen: true, name: skill.name, id: skill.id })}><Trash2 size={20} /></button>
                          <button onClick={() => { setEditingSkill({ id: skill.id, name: skill.name, category: skill.category, level: skill.level }); setIsModalOpen(true); }} className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl transition-all"><Edit3 size={20} /></button>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button disabled={skill.attemptsUsed >= 3} onClick={() => setTestingSkill({ id: skill.id, name: skill.name })} className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border shadow-sm ${skill.attemptsUsed >= 3 ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed" : "border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-slate-950"}`}>
                            Skill Test {Math.min(skill.attemptsUsed || 0, 3)}/3
                          </button>
                          {skill.attemptsUsed >= 3 && skill.nextAvailableDate && (
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                              Available: {new Date(skill.nextAvailableDate).toLocaleDateString("en-EN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSkills.length === 0 && (
                <div className="text-center py-24">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="text-slate-300 dark:text-slate-700" size={32} /></div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">No skills found</h3>
                  <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <SkillsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={async (s) => { 
        const payload = { ...s, category: s.category === "Technical Skill" ? "TECHNICAL" : "BUSINESS" }; 
        const method = editingSkill?.id ? "PUT" : "POST"; 
        const url = editingSkill?.id ? `/api/candidates/skills/${editingSkill.id}` : `/api/candidates/skills`; 
        await apiFetch(url, { method, body: JSON.stringify(payload) }); 
        await loadSkills(); await refetch(); setIsModalOpen(false); 
      }} editingSkill={editingSkill} />
      
      <DeleteConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal((p) => ({ ...p, isOpen: false }))} onConfirm={handleConfirmDelete} skillName={deleteModal.name} isDeleting={isDeletingLoading} />

      {/* --- Bulk Add Missing Skills Modal --- */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Add Missing Skills</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Select the skills you want to add to your profile from your projects and certificates.</p>

            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={missingSkills.length > 0 && bulkSelectedSkills.length === missingSkills.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
                />
                <span className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">Select All</span>
              </label>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-8 pr-2">
              {missingSkills.map((skill) => {
                const isSelected = bulkSelectedSkills.includes(skill);
                return (
                  <div key={skill} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isSelected ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                    <label className="flex items-center gap-3 cursor-pointer flex-1 overflow-hidden">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleBulkSkill(skill)} className="w-4 h-4 shrink-0 text-blue-600 rounded border-slate-300 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 cursor-pointer" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{skill}</span>
                    </label>
                    <select value={bulkSkillLevels[skill] || "Beginner"} onChange={(e) => setBulkSkillLevels(prev => ({ ...prev, [skill]: e.target.value }))} disabled={!isSelected} className="ml-3 shrink-0 p-1.5 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 dark:text-slate-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4">
              <button disabled={isBulkSaving} onClick={() => setIsBulkModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all">
                Cancel
              </button>
              {bulkSelectedSkills.length > 0 ? (
                <button disabled={isBulkSaving} onClick={() => setConfirmBulkAction("add")} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:dark:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-lg flex justify-center items-center">
                  Add ({bulkSelectedSkills.length})
                </button>
              ) : (
                <button onClick={() => setConfirmBulkAction("discard")} className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all shadow-sm flex justify-center items-center">
                  Discard All
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Confirm Action Modal (Add/Discard) --- */}
      {confirmBulkAction && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
          <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmBulkAction === "discard" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500" : "bg-blue-50 dark:bg-blue-900/20 text-blue-500"}`}>
              {confirmBulkAction === "discard" ? (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              ) : (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              {confirmBulkAction === "discard" ? "Discard All?" : "Add Skills?"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
              {confirmBulkAction === "discard" 
                ? "You won't be reminded to add these skills again. Are you sure?" 
                : `You are about to add ${bulkSelectedSkills.length} skills to your profile. Proceed?`}
            </p>
            <div className="flex gap-4">
              <button disabled={isBulkSaving} onClick={() => setConfirmBulkAction(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50">Cancel</button>
              <button disabled={isBulkSaving} onClick={confirmBulkAction === "discard" ? executeDiscardAll : executeBulkSave} className={`flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center ${confirmBulkAction === "discard" ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"}`}>
                {isBulkSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}