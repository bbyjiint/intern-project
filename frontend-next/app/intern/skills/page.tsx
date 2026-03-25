"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import InternNavbar from "@/components/InternNavbar";
import InternSidebar from "@/components/InternSidebar";
import SkillsModal, { SkillData } from "@/components/profile/SkillsModal";
import { apiFetch } from "@/lib/api";
import SkillTest from "@/components/skills/SkillTest";
import { Search, Plus, Filter, Trash2, Edit3, AlertCircle, Menu, X } from "lucide-react";
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trash2 size={28} className="text-rose-600 dark:text-rose-400" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">Delete Skill?</h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-sm sm:text-base">
          Are you sure you want to delete <b className="text-slate-900 dark:text-slate-200">"{skillName}"</b>?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button disabled={isDeleting} onClick={onClose} className="order-2 sm:order-1 flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
          <button disabled={isDeleting} onClick={onConfirm} className="order-1 sm:order-2 flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center">
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
    <span className={`flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${colorClass}`}>
      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${dotClass} ${label === "Not Verified" ? "" : label === "Verified" ? "" : "animate-pulse"}`} />
      {label}
    </span>
  );
}

export default function SkillsPage() {
  const { profileData, refetch } = useProfile();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Responsive State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const [confirmBulkAction, setConfirmBulkAction] = useState<"add" | "discard" | null>(null);
  const [ignoredSkills, setIgnoredSkills] = useState<string[]>([]);

  // Logic เดิม
  useEffect(() => {
    const stored = localStorage.getItem("ignored_missing_skills");
    if (stored) { try { setIgnoredSkills(JSON.parse(stored)); } catch (e) {} }
  }, []);

  useEffect(() => {
    const shouldHideScroll = isModalOpen || deleteModal.isOpen || isBulkModalOpen || !!confirmBulkAction || isSidebarOpen;
    document.body.style.overflow = shouldHideScroll ? "hidden" : "auto";
  }, [isModalOpen, deleteModal.isOpen, isBulkModalOpen, confirmBulkAction, isSidebarOpen]);

  const loadSkills = useCallback(async () => {
    try {
      setIsLoading(true);
      const [skillsRes, profileRes] = await Promise.all([
        apiFetch<{ skills: any[] }>("/api/candidates/skills"),
        apiFetch<{ profile: any }>("/api/candidates/profile").catch(() => ({ profile: null })),
      ]);

      const profile = (profileRes as any).profile;
      const certSkillNames = new Set<string>((profile?.certificates || []).flatMap((c: any) => c.relatedSkills || c.tags || []));
      const projectSkillNames = new Set<string>((profile?.projects || []).flatMap((p: any) => p.relatedSkills || p.skills || []));

      const mappedSkills = (skillsRes.skills || []).map((skill: any): Skill => {
        let levelStr: ProficiencyLevel = "Beginner";
        if (skill.level?.toLowerCase() === "intermediate" || skill.rating === 2) levelStr = "Intermediate";
        else if (skill.level?.toLowerCase() === "advanced" || skill.rating === 3) levelStr = "Advanced";

        return {
          id: skill.id,
          name: skill.name || skill.skill?.name || "Unknown Skill",
          category: skill.category === "TECHNICAL" ? "Technical Skill" : "Business Skills",
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
      setLoadError("Failed to load skills");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadSkills(); }, [loadSkills]);

  const missingSkills = useMemo(() => {
    const userSkillNames = new Set(skills.map(s => s.name.toLowerCase().trim()));
    const evidenceSkills = new Map<string, string>(); 
    (profileData?.certificates || []).forEach((c: any) => (c.relatedSkills || []).forEach((s: string) => evidenceSkills.set(s.toLowerCase().trim(), s)));
    (profileData?.projects || []).forEach((p: any) => (p.relatedSkills || []).forEach((s: string) => evidenceSkills.set(s.toLowerCase().trim(), s)));

    const missing: string[] = [];
    evidenceSkills.forEach((originalName, lowerName) => {
      if (!userSkillNames.has(lowerName) && !ignoredSkills.includes(lowerName)) missing.push(originalName);
    });
    return missing;
  }, [skills, profileData, ignoredSkills]);

  const handleConfirmDelete = async () => {
    try {
      setIsDeletingLoading(true);
      await apiFetch(`/api/candidates/skills/${deleteModal.id}`, { method: "DELETE" });
      await loadSkills();
      await refetch();
      setDeleteModal({ isOpen: false, id: "", name: "" });
    } catch (error) { alert("Failed to delete skill."); } 
    finally { setIsDeletingLoading(false); }
  };

  const executeBulkSave = async () => {
    setIsBulkSaving(true);
    try {
      await Promise.all(bulkSelectedSkills.map(name => apiFetch("/api/candidates/skills", { method: "POST", body: JSON.stringify({ name, category: "TECHNICAL", level: bulkSkillLevels[name] || "Beginner" }) })));
      await loadSkills(); await refetch(); setConfirmBulkAction(null); setIsBulkModalOpen(false);
    } catch (error) { alert("Failed to add skills."); } 
    finally { setIsBulkSaving(false); }
  };

  const executeDiscardAll = () => {
    const newIgnored = [...ignoredSkills, ...missingSkills.map(s => s.toLowerCase().trim())];
    setIgnoredSkills(newIgnored);
    localStorage.setItem("ignored_missing_skills", JSON.stringify(newIgnored));
    window.dispatchEvent(new Event("ignored_skills_updated"));
    setConfirmBulkAction(null); setIsBulkModalOpen(false);
  };

  const filteredSkills = skills.filter((skill) => {
    const matchSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchTab = true;
    if (filterTab === "Not Verified") matchTab = skill.status === "NOT_VERIFIED" && !skill.hasCertEvidence && !skill.hasProjectEvidence;
    else if (filterTab === "Verified") matchTab = skill.status === "VERIFIED";
    else if (filterTab === "Certificate") matchTab = !!skill.hasCertEvidence;
    else if (filterTab === "Project") matchTab = !!skill.hasProjectEvidence;
    return matchSearch && matchTab && (categoryFilter === "Select Category" || skill.category === categoryFilter);
  });

  const getLevelStyles = (level: ProficiencyLevel) => {
    switch (level) {
      case "Beginner": return { color: "#10B981", width: "33%", bg: "bg-emerald-500" };
      case "Intermediate": return { color: "#3B82F6", width: "66%", bg: "bg-blue-500" };
      case "Advanced": return { color: "#8B5CF6", width: "100%", bg: "bg-violet-500" };
      default: return { color: "#94A3B8", width: "0%", bg: "bg-slate-400" };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col">
      <InternNavbar />
      
      <div className="flex flex-1 relative">
        <InternSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-x-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>
          ) : testingSkill ? (
            <SkillTest skillId={testingSkill.id} skillName={testingSkill.name} onBack={() => { setTestingSkill(null); loadSkills(); }} onRefresh={refetch} />
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="flex flex-col gap-6 mb-8 sm:mb-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Skills</h1>
                    <p className="text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400 mt-1">Manage your expertise.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="Search skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" />
                  </div>
                  <button onClick={() => { setEditingSkill(null); setIsModalOpen(true); }} className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                    <Plus size={20} strokeWidth={3} /> Add Skill
                  </button>
                </div>
              </div>

              {/* Alert: Missing Skills */}
              {missingSkills.length > 0 && (
                <div className="mb-8 p-4 sm:p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-xl shrink-0">
                      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <h4 className="text-rose-800 dark:text-rose-300 font-black text-sm sm:text-[15px]">You have {missingSkills.length} unlisted skills!</h4>
                      <p className="text-rose-600/80 dark:text-rose-400/80 text-xs sm:text-sm font-medium">Found in your projects/certificates.</p>
                    </div>
                  </div>
                  <button onClick={() => setIsBulkModalOpen(true)} className="w-full md:w-auto px-6 py-2.5 bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-rose-600/20">
                    Review & Add
                  </button>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-col xl:flex-row gap-4 mb-8">
                <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 w-max sm:w-fit">
                    {["All", "Not Verified", "Verified", "Certificate", "Project"].map((tab) => (
                      <button key={tab} onClick={() => setFilterTab(tab)} className={`px-4 sm:px-6 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${filterTab === tab ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>{tab}</button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="flex-1 sm:flex-none pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-600 cursor-pointer outline-none">
                    <option value="Select Category">All Categories</option>
                    <option value="Technical Skill">Technical Skill</option>
                    <option value="Business Skills">Business Skills</option>
                  </select>
                  <button onClick={() => { setFilterTab("All"); setCategoryFilter("Select Category"); setSearchQuery(""); }} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 rounded-2xl"><AlertCircle size={20} /></button>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredSkills.map((skill) => {
                  const style = getLevelStyles(skill.level);
                  return (
                    <div key={skill.id} className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 p-5 sm:p-8 flex flex-col transition-all hover:shadow-xl hover:shadow-blue-500/5">
                      <div className="flex justify-between items-start mb-6 gap-2">
                        <div className="min-w-0">
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">{skill.name}</h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">{skill.category}</span>
                        </div>
                        <EvidenceBadge skill={skill} />
                      </div>

                      <div className="mt-auto">
                        <div className="mb-2 flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: style.color }}>{skill.level}</span>
                        </div>
                        <div className="relative w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
                          <div className={`absolute h-full transition-all duration-700 ${style.bg}`} style={{ width: style.width }} />
                        </div>

                        <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800/50">
                          <div className="flex gap-1">
                            <button onClick={() => setDeleteModal({ isOpen: true, name: skill.name, id: skill.id })} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={18} /></button>
                            <button onClick={() => { setEditingSkill({ id: skill.id, name: skill.name, category: skill.category, level: skill.level }); setIsModalOpen(true); }} className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit3 size={18} /></button>
                          </div>
                          <button disabled={skill.attemptsUsed >= 3} onClick={() => setTestingSkill({ id: skill.id, name: skill.name })} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${skill.attemptsUsed >= 3 ? "opacity-50 grayscale cursor-not-allowed" : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"}`}>
                            Test {Math.min(skill.attemptsUsed, 3)}/3
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSkills.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Search size={32} /></div>
                  <p className="text-slate-500 font-bold">No skills found.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* --- Floating Action Button (Sidebar Toggle) --- */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-90 transition-all group"
        aria-label="Toggle Sidebar"
      >
        <div className="relative w-6 h-6">
          {isSidebarOpen ? (
            <X size={24} className="animate-in fade-in zoom-in duration-300" />
          ) : (
            <Menu size={24} className="animate-in fade-in zoom-in duration-300" />
          )}
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
      </button>

      {/* Modals เดิม */}
      <SkillsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={async (s) => { 
        const payload = { ...s, category: s.category === "Technical Skill" ? "TECHNICAL" : "BUSINESS" }; 
        const method = editingSkill?.id ? "PUT" : "POST"; 
        const url = editingSkill?.id ? `/api/candidates/skills/${editingSkill.id}` : `/api/candidates/skills`; 
        await apiFetch(url, { method, body: JSON.stringify(payload) }); 
        await loadSkills(); await refetch(); setIsModalOpen(false); 
      }} editingSkill={editingSkill} />
      
      <DeleteConfirmationModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal(p => ({ ...p, isOpen: false }))} onConfirm={handleConfirmDelete} skillName={deleteModal.name} isDeleting={isDeletingLoading} />

      {/* Bulk Add Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom sm:zoom-in duration-300">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">Add Missing Skills</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">Import skills found in your evidence.</p>
            <div className="max-h-[50vh] overflow-y-auto space-y-2 mb-8 pr-1">
              {missingSkills.map((skill) => {
                const isSelected = bulkSelectedSkills.includes(skill);
                return (
                  <div key={skill} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? "border-blue-200 bg-blue-50/50" : "border-slate-100 hover:bg-slate-50"}`}>
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                      <input type="checkbox" checked={isSelected} onChange={() => setBulkSelectedSkills(prev => isSelected ? prev.filter(s => s !== skill) : [...prev, skill])} className="w-4 h-4 rounded text-blue-600" />
                      <span className="text-sm font-bold text-slate-700 truncate">{skill}</span>
                    </label>
                    <select value={bulkSkillLevels[skill] || "Beginner"} onChange={(e) => setBulkSkillLevels(prev => ({ ...prev, [skill]: e.target.value }))} disabled={!isSelected} className="p-1.5 text-[10px] font-bold bg-white border border-slate-200 rounded-lg outline-none">
                      <option value="Beginner">Beg</option>
                      <option value="Intermediate">Int</option>
                      <option value="Advanced">Adv</option>
                    </select>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsBulkModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-widest">Cancel</button>
              <button disabled={bulkSelectedSkills.length === 0} onClick={() => setConfirmBulkAction("add")} className="flex-[2] py-3.5 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 disabled:opacity-50">
                Add Selected ({bulkSelectedSkills.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirm Modal */}
      {confirmBulkAction && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center border border-slate-100 animate-in zoom-in duration-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmBulkAction === "discard" ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"}`}>
              {confirmBulkAction === "discard" ? <AlertCircle size={32} /> : <Plus size={32} />}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{confirmBulkAction === "discard" ? "Discard All?" : "Add Skills?"}</h3>
            <p className="text-sm text-slate-500 mb-8">{confirmBulkAction === "discard" ? "You won't see these suggestions again." : `Add ${bulkSelectedSkills.length} skills to your profile?`}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmBulkAction(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest">No</button>
              <button onClick={confirmBulkAction === "discard" ? executeDiscardAll : executeBulkSave} className={`flex-1 py-3.5 text-white rounded-xl font-black text-[10px] uppercase tracking-widest ${confirmBulkAction === "discard" ? "bg-amber-500" : "bg-blue-600"}`}>
                {isBulkSaving ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}