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
}

// --- Delete Confirmation Modal Component ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  skillName: string;
  isDeleting: boolean;
}

function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  skillName,
  isDeleting,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !isDeleting && onClose()}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Skill?</h3>
        <p className="text-gray-500 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-700">"{skillName}"</span>?
          This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isDeleting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Delete"
            )}
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

// --- Main SkillsPage Component ---
export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filterTab, setFilterTab] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("Select Category");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [testingSkill, setTestingSkill] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // State สำหรับ Delete Modal
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

  // Lock scroll เมื่อเปิด Modal
  useEffect(() => {
    const shouldHideScroll = isModalOpen || deleteModal.isOpen;
    document.body.style.overflow = shouldHideScroll ? "hidden" : "auto";
  }, [isModalOpen, deleteModal.isOpen]);

  const loadSkills = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const response = await apiFetch<{ skills: any[] }>("/api/candidates/skills");
      console.log(response)

      const mappedSkills = (response.skills || []).map((skill): Skill => {
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
        };
      });
      console.log(mappedSkills)

      setSkills(mappedSkills);
    } catch (error) {
      console.error("Failed to load candidate skills:", error);
      setLoadError(error instanceof Error ? error.message : "Failed to load skills");
      setSkills([]);
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    void loadSkills();
  }, [loadSkills]);

  const handleAddClick = () => {
    setEditingSkill(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (skill: Skill) => {
    setEditingSkill({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      level: skill.level,
    });
    setIsModalOpen(true);
  };

  const handleSaveSkill = async (savedSkill: SkillData) => {
    try {
      const payload = {
        ...savedSkill,
        category: categoryToDB[savedSkill.category] || savedSkill.category,
      };

      const method = editingSkill?.id ? "PUT" : "POST";
      const url = editingSkill?.id
        ? `/api/candidates/skills/${editingSkill.id}`
        : `/api/candidates/skills`;

      await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

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

  const filteredSkills = skills.filter((skill) => {
    const matchSearch = skill.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchTab = filterTab === "All" || skill.status === filterTab;
    const matchCategory =
      categoryFilter === "Select Category" || skill.category === categoryFilter;
    return matchSearch && matchTab && matchCategory;
  });

  const getLevelStyles = (level: ProficiencyLevel) => {
    switch (level) {
      case "Beginner":
        return { color: "#68B383", width: "33.33%" };
      case "Intermediate":
        return { color: "#3B82F6", width: "66.66%" };
      case "Advanced":
        return { color: "#8B5CF6", width: "100%" };
      default:
        return { color: "#E5E7EB", width: "0%" };
    }
  };

  return (
    <div className="min-h-screen bg-[#E6EBF4] flex flex-col">
      <InternNavbar />
      <div className="flex flex-1">
        <InternSidebar />

        {/* Main Content Area */}
        <div className="layout-container layout-page flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0273B1] rounded-full animate-spin"></div>
            </div>
          ) : loadError ? (
            <div className="m-8 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
              {loadError}
            </div>
          ) : testingSkill ? ( 
            <div className="w-full">
              <SkillTest
                skillId={testingSkill.id}    
                skillName={testingSkill.name}  
                onBack={() => {
                  setTestingSkill(null);
                  loadSkills(); // โหลดข้อมูลใหม่หลังจากสอบเสร็จ
                }} 
              />
            </div>
          ) : (
            /* ถ้า testingSkill เป็น null ให้แสดงหน้าปกติตามเดิม */
            <>
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-[36px] font-extrabold text-black mb-1 tracking-tight">
                    Skills
                  </h1>
                  <p className="text-gray-500 text-sm">
                    A collection of skills you have created and added to your
                    profile.
                  </p>
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
                  <button
                    className="px-6 py-2.5 bg-white border border-[#3B82F6] text-[#3B82F6] text-sm font-bold rounded-full hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
                    onClick={handleAddClick}
                  >
                    + Add Skill
                  </button>
                </div>
              </div>

              {/* 💡 แถบ Filter */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4">
                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-3">
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

                {/* Right Filters */}
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
                    <svg
                      className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  <button
                    onClick={() => {
                      setFilterTab("All");
                      setCategoryFilter("Select Category");
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-black font-bold text-sm rounded-lg hover:bg-gray-50 shadow-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Clear Filter
                  </button>
                </div>
              </div>

              {/* Grid */}
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">
                {filteredSkills.length} Total Skills
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSkills.map((skill) => {
                  const style = getLevelStyles(skill.level);
                  return (
                    <div
                      key={skill.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
                    >
                      {/* Top: Name & Status */}
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="text-[19px] font-bold text-gray-900">
                          {skill.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm">
                          {skill.status?.toUpperCase() === "VERIFIED" ? (
                            <>
                              <svg
                                className="w-4 h-4 text-[#8BC34A]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                ></circle>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4"
                                ></path>
                              </svg>
                              <span className="text-gray-500 font-medium">
                                Verified
                              </span>
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 text-[#FF5252]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                ></circle>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 9l-6 6M9 9l6 6"
                                ></path>
                              </svg>
                              <span className="text-gray-500 font-medium">
                                Not Verified
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative w-full h-[10px] bg-[#E2E8F0] rounded-full mb-3 overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full transition-all duration-500"
                          style={{
                            width: style.width,
                            backgroundColor: style.color,
                          }}
                        />
                        <div className="absolute top-0 left-[33.33%] w-0.5 h-full bg-white z-10" />
                        <div className="absolute top-0 left-[66.66%] w-0.5 h-full bg-white z-10" />
                      </div>

                      {/* Level Badge */}
                      <div className="mb-6">
                        <span
                          className="inline-block px-3 py-1 rounded text-[11px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: style.color }}
                        >
                          {skill.level}
                        </span>
                      </div>

                      {/* Bottom: Category & Action Buttons */}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="text-sm text-gray-500 font-medium">
                          {skill.category}
                        </span>

                        <div className="flex gap-3">
                          {/* Delete Button */}
                          <button
                            className="text-gray-400 hover:text-red-500 transition-colors mr-1"
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                name: skill.name,
                                id: skill.id,
                              })
                            }
                            title="Delete Skill"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>

                          {/* Skill Test Button */}
                          <button
                            disabled={skill.attemptsUsed >= 3}
                            onClick={() =>
                              setTestingSkill({
                                id: skill.id,
                                name: skill.name,
                              })
                            } 
                            // เพิ่ม title ตรงนี้: ถ้าครบ 3 ครั้ง ให้โชว์วันปลดล็อก
                            title={
                              skill.attemptsUsed >= 3 && skill.nextAvailableDate
                                ? `You can test again on: ${new Date(skill.nextAvailableDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                : `Attempts used: ${skill.attemptsUsed || 0}/3`
                            }
                            className={`px-5 py-1.5 border text-sm font-bold rounded-lg transition-colors shadow-sm ${
                              skill.attemptsUsed >= 3
                                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed" // สีเทากดไม่ได้
                                : "border-[#3B82F6] text-[#3B82F6] hover:bg-blue-50" // สีฟ้าปกติ
                            }`}
                          >
                            Skill Test {skill.attemptsUsed || 0}/3
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditClick(skill)}
                            className="px-5 py-1.5 border border-[#3B82F6] text-[#3B82F6] text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <SkillsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSkill}
        editingSkill={editingSkill}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        skillName={deleteModal.name}
        isDeleting={isDeletingLoading}
      />
    </div>
  );
}