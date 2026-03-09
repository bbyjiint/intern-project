"use client";

import { useState } from "react";
import InternNavbar from "@/components/InternNavbar";
import InternSidebar from "@/components/InternSidebar";
import SkillsModal, { SkillData } from "@/components/profile/SkillsModal";

// --- Types & Interfaces ---
type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced";
type VerificationStatus = "Not Verified" | "Verified";

interface Skill {
  id: string;
  name: string;
  status: VerificationStatus;
  level: ProficiencyLevel;
  category: string;
}

// --- Mock Data ---
const mockSkills: Skill[] = [
  {
    id: "1",
    name: "Python",
    status: "Not Verified",
    level: "Beginner",
    category: "Technical Skill",
  },
  {
    id: "2",
    name: "JavaScript",
    status: "Verified",
    level: "Intermediate",
    category: "Technical Skill",
  },
  {
    id: "3",
    name: "HTML",
    status: "Verified",
    level: "Advanced",
    category: "Technical Skill",
  },
  {
    id: "4",
    name: "Excel",
    status: "Verified",
    level: "Advanced",
    category: "Business Skills",
  },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  
  // Filter States
  const [filterTab, setFilterTab] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("Select Category");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);

  // ฟังก์ชันเปิด Modal แบบ Add
  const handleAddClick = () => {
    setEditingSkill(null);
    setIsModalOpen(true);
  };

  // ฟังก์ชันเปิด Modal แบบ Edit
  const handleEditClick = (skill: Skill) => {
    // Map ข้อมูลให้ตรงกับที่ Modal คาดหวัง
    setEditingSkill({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      level: skill.level,
    });
    setIsModalOpen(true);
  };

  // ฟังก์ชันกด Save จาก Modal
  const handleSaveSkill = (savedSkill: SkillData) => {
    if (editingSkill?.id) {
      // โหมดแก้ไข (Edit)
      setSkills((prev) =>
        prev.map((skill) =>
          skill.id === editingSkill.id
            ? {
                ...skill,
                name: savedSkill.name,
                category: savedSkill.category,
                level: savedSkill.level as ProficiencyLevel,
              }
            : skill
        )
      );
    } else {
      // โหมดเพิ่มใหม่ (Add)
      const newSkill: Skill = {
        id: Date.now().toString(), // จำลอง ID ใหม่
        name: savedSkill.name,
        category: savedSkill.category,
        level: savedSkill.level as ProficiencyLevel,
        status: "Not Verified", // ค่าเริ่มต้นเมื่อเพิ่มใหม่
      };
      setSkills([...skills, newSkill]);
    }
    setIsModalOpen(false);
  };

  // --- Logic สำหรับ Filter ข้อมูล ---
  const filteredSkills = skills.filter((skill) => {
    // 1. ตรวจสอบ Search Query
    const matchSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. ตรวจสอบ Tab Filter (All, Not Verified, Verified, Certificate, Project)
    let matchTab = true;
    if (filterTab !== "All") {
      matchTab = skill.status === filterTab; // ตอนนี้ Mock Data มีแค่ Verified / Not Verified
    }

    // 3. ตรวจสอบ Category Dropdown Filter
    let matchCategory = true;
    if (categoryFilter !== "Select Category") {
      matchCategory = skill.category === categoryFilter;
    }

    return matchSearch && matchTab && matchCategory;
  });

  // ฟังก์ชันดึงสีและเปอร์เซ็นต์ความกว้างของ Progress Bar
  const getLevelStyles = (level: ProficiencyLevel) => {
    switch (level) {
      case "Beginner":
        return { color: "#68B383", width: "33.33%" }; // สีเขียว
      case "Intermediate":
        return { color: "#3B82F6", width: "66.66%" }; // สีฟ้า
      case "Advanced":
        return { color: "#8B5CF6", width: "100%" }; // สีม่วง
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