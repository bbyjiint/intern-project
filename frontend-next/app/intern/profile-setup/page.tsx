"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import CompanyHubLogo from "@/components/CompanyHubLogo";
import { Sun, Moon, Check, AlertTriangle, User, ChevronLeft, Rocket } from "lucide-react";

import Step0UploadResume from "@/components/profile-setup/Step0UploadResume";
import Step1GeneralInfo from "@/components/profile-setup/Step1GeneralInfo";
import Step2BackgroundExperience from "@/components/profile-setup/Step2BackgroundExperience";
import ProjectsSection, {
  type ProjectsSectionHandle,
} from "@/components/profile-setup/ProjectsSection";
import Step3SkillsProjects from "@/components/profile-setup/Step3SkillsProjects";
import ProgressIndicator from "@/components/profile-setup/ProgressIndicator";

type Education = {
  university?: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: string;
  endYear?: string | null;
  gpa?: string | number | null;
};

export default function ProfileSetupPage() {
  const router = useRouter();

  const projectsSectionRef = useRef<ProjectsSectionHandle>(null);
  const educationValidatorRef = useRef<(() => boolean | Promise<boolean>) | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingStep, setPendingStep] = useState<number | null>(null);

  const [loadKey, setLoadKey] = useState(0);
  const [skillsKey, setSkillsKey] = useState(0);

  const [formData, setFormData] = useState({
    resumeUrl: null as string | null,
    resumeFile: null,
    _pendingResumeFile: null as File | null,
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    aboutYou: "",
    photo: null as string | null,
    profileImage: null as string | null,
    education: [] as Education[],
    experience: [] as any[],
    projects: [] as any[],
    skills: [] as any[],
    positionsOfInterest: [] as string[],
    preferredLocations: [] as string[],
    dateOfBirth: "" as string,
    gender: "" as string,
    nationality: "Thai" as string,
    internshipPeriod: "",
    internshipStart: "",
    internshipEnd: "",
  });

  // --- Theme Logic ---
  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark" || 
                  (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  // --- Auth & Profile Loading ---
  useEffect(() => {
    apiFetch<{ user: { role: string | null } }>("/api/auth/me")
      .then((data) => {
        if (data.user.role !== "CANDIDATE") router.push("/role-selection");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const loadProfile = async () => {
    try {
      const res = await apiFetch<{ profile: any }>("/api/candidates/profile");
      const profile = res.profile || {};
      const nameParts = (profile.fullName ?? "").split(" ");

      let internshipStart = "";
      let internshipEnd = "";
      if (profile.internshipPeriod) {
        const parts = profile.internshipPeriod.split(" - ");
        internshipStart = parts[0] || "";
        internshipEnd = parts[1] || "";
      }

      setFormData((prev) => ({
        ...prev,
        ...profile,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        internshipStart,
        internshipEnd,
      }));
    } catch (err) {
      console.error("Load profile failed:", err);
    } finally {
      setLoadKey((prev) => (prev === 0 ? 1 : prev));
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/candidates/profile", {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      setShowSaveModal(true);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError("Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ฟังก์ชันสำคัญสำหรับ Complete Profile
  const handleCompleteProfile = async () => {
    setIsSubmitting(true);
    try {
      // 1. บันทึกข้อมูลครั้งสุดท้าย
      await apiFetch("/api/candidates/profile", {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      // 2. ปิด Modal
      setShowConfirmModal(false);
      setHasUnsavedChanges(false);
      // 3. ไปที่หน้าโปรไฟล์
      router.push("/intern/profile");
    } catch (err) {
      setError("Failed to complete profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 1) {
      hasUnsavedChanges ? (setPendingStep(0), setShowUnsavedModal(true)) : router.push("/intern/profile");
    } else {
      tryNavigateTo(currentStep - 1);
    }
  };

  const tryNavigateTo = (targetStep: number) => {
    if (hasUnsavedChanges) {
      setPendingStep(targetStep);
      setShowUnsavedModal(true);
    } else {
      setCurrentStep(targetStep);
    }
  };

  const updateFormData = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setHasUnsavedChanges(true);
  };

  const handleLeaveWithoutSaving = async () => {
    setShowUnsavedModal(false);
    await loadProfile();
    setHasUnsavedChanges(false);
    if (pendingStep === 0) router.push("/intern/profile");
    else if (pendingStep !== null) setCurrentStep(pendingStep);
  };

  if (loadKey === 0) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-slate-500 dark:text-slate-400 animate-pulse font-bold">Loading your profile...</div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-3">
          <CompanyHubLogo href="/" />
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:ring-2 ring-blue-500 transition-all"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-10 px-6">
        <div className="mx-auto">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 transition-all">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white text-center mb-8">
              Build Your Professional Profile
            </h1>
            <ProgressIndicator currentStep={currentStep} totalSteps={5} />
          </div>

          {/* Form Content Card */}
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            <div className="min-h-[400px]">
              {currentStep === 1 && <Step0UploadResume key={`s0-${loadKey}`} data={formData} onUpdate={updateFormData} onSkip={() => tryNavigateTo(2)} />}
              {currentStep === 2 && <Step1GeneralInfo key={`s1-${loadKey}`} data={formData} onUpdate={updateFormData} onSkip={() => tryNavigateTo(3)} />}
              {currentStep === 3 && <Step2BackgroundExperience key={`s2-${loadKey}`} data={formData} onUpdate={updateFormData} onSkip={() => tryNavigateTo(4)} onValidate={(fn) => (educationValidatorRef.current = fn)} />}
              {currentStep === 4 && <ProjectsSection key={`s3-${loadKey}`} ref={projectsSectionRef} data={formData} onUpdate={updateFormData} onSkip={() => tryNavigateTo(5)} />}
              {currentStep === 5 && <Step3SkillsProjects key={`s4-${loadKey}-${skillsKey}`} data={formData} onUpdate={updateFormData} onSkip={() => router.push("/intern/profile")} />}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              <div className="flex gap-4">
                <button
                  onClick={saveProfile}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black transition-all"
                >
                  {isSubmitting ? "Saving..." : "Save Draft"}
                </button>

                {currentStep < 5 ? (
                  <button
                    onClick={() => tryNavigateTo(currentStep + 1)}
                    className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20 transition-all"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Complete Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      
      {/* 1. Modal ยืนยันการสร้างโปรไฟล์ (ตัวที่แก้ปัญหา) */}
      {showConfirmModal && (
        <ModalWrapper>
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6 mx-auto">
            <Rocket className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Ready to Launch?</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Your profile looks great! Click below to finalize and view your profile page.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleCompleteProfile} 
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg transition-all"
            >
              {isSubmitting ? "Finalizing..." : "Yes, Show My Profile"}
            </button>
            <button 
              onClick={() => setShowConfirmModal(false)} 
              className="w-full py-3 text-slate-500 dark:text-slate-400 font-bold hover:underline"
            >
              Wait, let me double check
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* 2. Modal แจ้งเตือนบันทึกสำเร็จ */}
      {showSaveModal && (
        <ModalWrapper>
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 mx-auto">
            <Check className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Progress Saved</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">You can come back and continue anytime.</p>
          <button onClick={() => setShowSaveModal(false)} className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black">Continue Editing</button>
        </ModalWrapper>
      )}

      {/* 3. Modal แจ้งเตือนข้อมูลที่ยังไม่ได้บันทึก */}
      {showUnsavedModal && (
        <ModalWrapper>
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6 mx-auto">
            <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Unsaved Changes</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">You have some unsaved work. Would you like to save it first?</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setShowUnsavedModal(false); saveProfile(); }} className="py-4 rounded-2xl bg-blue-600 text-white font-black">Save & Continue</button>
            <button onClick={handleLeaveWithoutSaving} className="py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">Discard changes</button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}

function ModalWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full text-center border border-slate-200 dark:border-slate-800 scale-95 animate-in zoom-in duration-300">
        {children}
      </div>
    </div>
  );
}