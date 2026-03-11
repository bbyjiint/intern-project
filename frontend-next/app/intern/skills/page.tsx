"use client";

import { useState, useEffect } from "react";
import InternNavbar from "@/components/InternNavbar";
import InternSidebar from "@/components/InternSidebar";
import SkillsModal, { SkillData } from "@/components/profile/SkillsModal";
import { apiFetch } from "@/lib/api"; // เพิ่ม Import apiFetch
import { useProfile } from "@/hooks/useProfile";

type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced";
type VerificationStatus = "Not Verified" | "Verified";

interface Skill {
  id: string;
  name: string;
  status: VerificationStatus;
  level: ProficiencyLevel;
  category: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]); // เอา mockSkills ออก เริ่มต้นเป็น Array ว่าง
  const [isLoading, setIsLoading] = useState(true); // เพิ่ม State โหลด
  const { profileData, refetch, isLoading: profileLoading } = useProfile();

  const [filterTab, setFilterTab] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] =
    useState<string>("Select Category");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);

      // 💡 เพิ่มส่วนนี้เข้าไปครับ
    useEffect(() => {
      if (isModalOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
  
      // คืนค่าเดิมเมื่อปิดหรือเปลี่ยนหน้า
      return () => {
        document.body.style.overflow = "auto";
      };
    }, [isModalOpen]);
    

  useEffect(() => {
    if (profileLoading) {
      setIsLoading(true);
      return;
    }

    if (profileData && profileData.skills) {
      const mappedSkills = profileData.skills.map((s: any): Skill => {
        // แปลง level จาก DB ให้ตัวพิมพ์ใหญ่ตรงกับ Frontend
        let levelStr: ProficiencyLevel = "Beginner";
        // รองรับกรณีที่ Backend ส่งมาเป็น Rating (1, 2, 3) หรือ String
        if (s.level === 'intermediate' || s.level === 'Intermediate' || s.rating === 2) levelStr = "Intermediate";
        if (s.level === 'advanced' || s.level === 'Advanced' || s.rating === 3) levelStr = "Advanced";

        return {
          id: s.id,
          name: s.name || s.skill?.name || "Unknown Skill", // รองรับโครงสร้าง DB
          category: s.category || "Technical Skill",
          level: levelStr,
          status: "Not Verified", // ค่าจำลอง
        };
      });
      
      setSkills(mappedSkills);
      setIsLoading(false);
    }
  }, [profileData, profileLoading]);

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

  /// 2. ฟังก์ชันกด Save แบบยิงเข้า DB
  const handleSaveSkill = async (savedSkill: SkillData) => {
    try {
      if (editingSkill?.id) {
        // --- อัปเดตข้อมูล (PUT) ---
        await apiFetch(`/api/candidates/skills/${editingSkill.id}`, {
          method: "PUT",
          body: JSON.stringify(savedSkill),
        });
      } else {
        // --- เพิ่มข้อมูลใหม่ (POST) ---
        await apiFetch(`/api/candidates/skills`, {
          method: "POST",
          body: JSON.stringify(savedSkill),
        });
      }
      
      // 💡 จุดสำคัญ: ดึงข้อมูลใหม่จาก DB สดๆ ทันที เพื่อให้ได้ UUID ของจริง
      await refetch(); 
      setIsModalOpen(false);

    } catch (error) {
      console.error("Failed to save skill:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this skill?")) {
      try {
        await apiFetch(`/api/candidates/skills/${id}`, { method: "DELETE" });

        setSkills(skills.filter((s) => s.id !== id));

        await refetch();
      } catch (error) {
        console.error("Failed to delete skill:", error);
        alert("Failed to delete skill.");
      }
    }
  };

  // --- Logic สำหรับ Filter ข้อมูล (เหมือนเดิม) ---
  const filteredSkills = skills.filter((skill) => {
    const matchSearch = skill.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    let matchTab = true;
    if (filterTab !== "All") matchTab = skill.status === filterTab;
    let matchCategory = true;
    if (categoryFilter !== "Select Category")
      matchCategory = skill.category === categoryFilter;
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
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <InternNavbar />

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <InternSidebar />

        {/* Main Content */}
        <div className="layout-container layout-page flex-1 overflow-y-auto">
          {/* --- Header Row --- */}
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
              {/* Search Bar */}
              <div className="relative w-full lg:w-80">
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>
              {/* Add Skill Button */}
              <button
                className="px-6 py-2.5 bg-white border border-[#3B82F6] text-[#3B82F6] text-sm font-bold rounded-full hover:bg-blue-50 transition-colors whitespace-nowrap shadow-sm"
                onClick={handleAddClick}
              >
                + Add Skill
              </button>
            </div>
          </div>

          {/* --- Filters Row --- */}
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
                  <option value="Soft Skill">Soft Skill</option>
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

          {/* --- Count --- */}
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">
            {filteredSkills.length} Total Skills
          </h2>

          {/* --- Skills Grid --- */}
          {filteredSkills.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
              No skills found.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSkills.map((skill) => {
                const style = getLevelStyles(skill.level);
                return (
                  <div
                    key={skill.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
                  >
                    {/* Top: Name & Verification Status */}
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-[19px] font-bold text-gray-900">
                        {skill.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm">
                        {skill.status === "Verified" ? (
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

                    {/* Custom Progress Bar */}
                    <div className="relative w-full h-[10px] bg-[#E2E8F0] rounded-full mb-3 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
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
                        <button
                          className="text-gray-400 hover:text-red-500 transition-colors mr-1"
                          onClick={() => handleDelete(skill.id)}
                          title="Delete Project"
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
                        <button className="px-5 py-1.5 border border-[#3B82F6] text-[#3B82F6] text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
                          Skill Test
                        </button>
                        <button
                          className="px-5 py-1.5 border border-[#3B82F6] text-[#3B82F6] text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                          onClick={() => handleEditClick(skill)}
                        >
                          Edit Skill
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <SkillsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSkill}
        editingSkill={editingSkill}
      />
    </div>
  );
}
