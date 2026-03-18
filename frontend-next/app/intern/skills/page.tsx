"use client";

import { useCallback, useEffect, useState } from "react";
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

// --- Main ---
export default function SkillsPage() {
  const { profileData, refetch } = useProfile();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filterTab, setFilterTab] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] =
    useState<string>("Select Category");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [testingSkill, setTestingSkill] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({
    isOpen: false,
    id: "",
    name: "",
  });

  // --- Lock Scroll ---
  useEffect(() => {
    const shouldHideScroll = isModalOpen || deleteModal.isOpen;
    document.body.style.overflow = shouldHideScroll ? "hidden" : "auto";
  }, [isModalOpen, deleteModal.isOpen]);

  const loadSkills = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const [skillsRes, profileRes] = await Promise.all([
        apiFetch<{ skills: any[] }>("/api/candidates/skills"),
        apiFetch<{ profile: any }>("/api/candidates/profile").catch(() => ({
          profile: null,
        })),
      ]);

      const profile = (profileRes as any).profile;
      const certificates =
        profile?.files?.certificates || profile?.certificates || [];
      const projects = profile?.projects || [];

      const certSkillNames = new Set<string>(
        certificates.flatMap((c: any) => c.relatedSkills || c.tags || []),
      );
      const projectSkillNames = new Set<string>(
        projects.flatMap((p: any) => p.relatedSkills || p.skills || []),
      );

      const mappedSkills = (skillsRes.skills || []).map((skill: any): Skill => {
        let levelStr: ProficiencyLevel = "Beginner";
        if (skill.level?.toLowerCase() === "intermediate" || skill.rating === 2)
          levelStr = "Intermediate";
        else if (
          skill.level?.toLowerCase() === "advanced" ||
          skill.rating === 3
        )
          levelStr = "Advanced";

        const categoryMap: Record<string, string> = {
          TECHNICAL: "Technical Skill",
          BUSINESS: "Business Skills",
        };
        return {
          id: skill.id,
          name: skill.name || skill.skill?.name || "Unknown Skill",
          category:
            categoryMap[skill.category?.toUpperCase()] ||
            skill.category ||
            "Technical Skill",
          level: levelStr,
          status:
            skill.status?.toUpperCase() === "VERIFIED"
              ? "VERIFIED"
              : "NOT_VERIFIED",
          attemptsUsed: skill.attemptsUsed || 0,
          nextAvailableDate: skill.nextAvailableDate || null,
          hasCertEvidence: certSkillNames.has(skill.name),
          hasProjectEvidence: projectSkillNames.has(skill.name),
        };
      });

      setSkills(mappedSkills);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load skills",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSkills();
  }, [loadSkills]);

  // --- Handlers ---
  const handleConfirmDelete = async () => {
    try {
      setIsDeletingLoading(true);
      await apiFetch(`/api/candidates/skills/${deleteModal.id}`, {
        method: "DELETE",
      });
      await loadSkills();
      setDeleteModal({ isOpen: false, id: "", name: "" });
    } catch (error) {
      alert("Failed to delete skill.");
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const filteredSkills = skills.filter((skill) => {
    const matchSearch = skill.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    let matchTab = true;
    if (filterTab === "Not Verified")
      matchTab =
        skill.status === "NOT_VERIFIED" &&
        !skill.hasCertEvidence &&
        !skill.hasProjectEvidence;
    else if (filterTab === "Verified") matchTab = skill.status === "VERIFIED";
    else if (filterTab === "Certificate") matchTab = !!skill.hasCertEvidence;
    else if (filterTab === "Project") matchTab = !!skill.hasProjectEvidence;

    const matchCategory =
      categoryFilter === "Select Category" || skill.category === categoryFilter;
    return matchSearch && matchTab && matchCategory;
  });

  const getLevelStyles = (level: ProficiencyLevel) => {
    switch (level) {
      case "Beginner":
        return { color: "#10B981", width: "33.33%", bg: "bg-emerald-500" };
      case "Intermediate":
        return { color: "#3B82F6", width: "66.66%", bg: "bg-blue-500" };
      case "Advanced":
        return { color: "#8B5CF6", width: "100%", bg: "bg-violet-500" };
      default:
        return { color: "#94A3B8", width: "0%", bg: "bg-slate-400" };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <InternNavbar />
      <div className="flex flex-1">
        <InternSidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : loadError ? (
            <div className="m-8 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 px-6 py-4 text-sm text-red-700 dark:text-red-400">
              {loadError}
            </div>
          ) : testingSkill ? (
            <div className="w-full">
              <SkillTest
                skillId={testingSkill.id}
                skillName={testingSkill.name}
                onBack={() => {
                  setTestingSkill(null);
                  loadSkills();
                }}
                onRefresh={refetch}
              />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    Skills
                  </h1>
                  <p className="text-base font-bold text-slate-500 dark:text-slate-400 mt-2">
                    Manage and verify your professional expertise.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 dark:text-white transition-all shadow-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingSkill(null);
                      setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    <Plus size={20} strokeWidth={3} />
                    Add Skill
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4">
                <div className="flex flex-wrap p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl w-fit border border-slate-200 dark:border-slate-800">
                  {[
                    "All",
                    "Not Verified",
                    "Verified",
                    "Certificate",
                    "Project",
                  ].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilterTab(tab)}
                      className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                        filterTab === tab
                          ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md"
                          : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
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
                      className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 focus:outline-none w-48 shadow-sm cursor-pointer"
                    >
                      <option value="Select Category">All Categories</option>
                      <option value="Technical Skill">Technical Skill</option>
                      <option value="Business Skills">Business Skills</option>
                    </select>
                    <Filter className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => {
                      setFilterTab("All");
                      setCategoryFilter("Select Category");
                      setSearchQuery("");
                    }}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                    title="Clear Filters"
                  >
                    <AlertCircle size={20} />
                  </button>
                </div>
              </div>

              {/* Grid */}
              <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-6">
                Showing {filteredSkills.length} Total Skills
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSkills.map((skill) => {
                  const style = getLevelStyles(skill.level);
                  return (
                    <div
                      key={skill.id}
                      className="group bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 p-8 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {skill.name}
                          </h3>
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 block">
                            {skill.category}
                          </span>
                        </div>
                        <EvidenceBadge skill={skill} />
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2 flex justify-between items-end">
                        <span
                          className="text-[10px] font-black uppercase tracking-widest"
                          style={{ color: style.color }}
                        >
                          {skill.level} Proficiency
                        </span>
                      </div>
                      <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out ${style.bg}`}
                          style={{ width: style.width }}
                        />
                        <div className="absolute top-0 left-[33.33%] w-0.5 h-full bg-white dark:bg-slate-900 z-10 opacity-30" />
                        <div className="absolute top-0 left-[66.66%] w-0.5 h-full bg-white dark:bg-slate-900 z-10 opacity-30" />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50 pt-6 mt-auto">
                        <div className="flex gap-2">
                          <button
                            className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all"
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                name: skill.name,
                                id: skill.id,
                              })
                            }
                          >
                            <Trash2 size={20} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSkill({
                                id: skill.id,
                                name: skill.name,
                                category: skill.category,
                                level: skill.level,
                              });
                              setIsModalOpen(true);
                            }}
                            className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl transition-all"
                          >
                            <Edit3 size={20} />
                          </button>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            disabled={skill.attemptsUsed >= 3}
                            onClick={() =>
                              setTestingSkill({
                                id: skill.id,
                                name: skill.name,
                              })
                            }
                            title={
                              skill.attemptsUsed >= 3 && skill.nextAvailableDate
                                ? `Next test available: ${new Date(skill.nextAvailableDate).toLocaleDateString("en-EN", { day: "numeric", month: "short", year: "numeric" })}`
                                : "Take a skill test"
                            }
                            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border shadow-sm ${
                              skill.attemptsUsed >= 3
                                ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed"
                                : "border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-slate-950"
                            }`}
                          >
                            Skill Test {Math.min(skill.attemptsUsed || 0, 3)}/3
                          </button>

                          {skill.attemptsUsed >= 3 &&
                            skill.nextAvailableDate && (
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                                Available:{" "}
                                {new Date(
                                  skill.nextAvailableDate,
                                ).toLocaleDateString("en-EN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {filteredSkills.length === 0 && (
                <div className="text-center py-24">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search
                      className="text-slate-300 dark:text-slate-700"
                      size={32}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    No skills found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Try adjusting your filters or search terms.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <SkillsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (s) => {
          const payload = {
            ...s,
            category:
              s.category === "Technical Skill" ? "TECHNICAL" : "BUSINESS",
          };
          const method = editingSkill?.id ? "PUT" : "POST";
          const url = editingSkill?.id
            ? `/api/candidates/skills/${editingSkill.id}`
            : `/api/candidates/skills`;
          await apiFetch(url, { method, body: JSON.stringify(payload) });
          await loadSkills();
          setIsModalOpen(false);
        }}
        editingSkill={editingSkill}
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center border border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} className="text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Delete Skill?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
              Are you sure you want to delete{" "}
              <b className="text-slate-900 dark:text-slate-200">
                "{deleteModal.name}"
              </b>
              ?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal((p) => ({ ...p, isOpen: false }))}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
              >
                {isDeletingLoading ? "..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---
function EvidenceBadge({ skill }: { skill: Skill }) {
  let label = "Not Verified";
  let colorClass =
    "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700";
  let dotClass = "bg-slate-300 dark:bg-slate-600";

  if (skill.status === "VERIFIED") {
    label = "Verified";
    colorClass =
      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20";
    dotClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
  } else if (skill.hasCertEvidence || skill.hasProjectEvidence) {
    label = "Has Evidence";
    colorClass =
      "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20";
    dotClass = "bg-amber-500";
  }

  return (
    <span
      className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${colorClass}`}
    >
      <div
        className={`w-2 h-2 rounded-full ${dotClass} ${label === "Not Verified" ? "" : label === "Verified" ? "" : "animate-pulse"}`}
      />
      {label}
    </span>
  );
}
