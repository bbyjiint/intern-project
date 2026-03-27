"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import CompanyHubLogoDark from "@/components/CompanyHubLogoDark";
import ThemeToggle from "@/components/ThemeToggle";

import Step0UploadResume from "@/components/profile-setup/Step0UploadResume";
import Step1GeneralInfo from "@/components/profile-setup/Step1GeneralInfo";
import Step2BackgroundExperience from "@/components/profile-setup/Step2BackgroundExperience";
import ProjectsSection, {
  type ProjectsSectionHandle,
} from "@/components/profile-setup/ProjectsSection";
import Step3SkillsProjects from "@/components/profile-setup/Step3SkillsProjects";
import ProgressIndicator from "@/components/profile-setup/ProgressIndicator";

const DRAFT_KEY = "profileSetupDraft";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showIncompleteProjectsModal, setShowIncompleteProjectsModal] = useState(false);
  const [incompleteProjectNames, setIncompleteProjectNames] = useState<string[]>([]);

  const [loadKey, setLoadKey] = useState(0);
  const [skillsKey, setSkillsKey] = useState(0);

  const [formData, setFormData] = useState({
    resumeUrl: null as string | null,
    resumeFile: null,
    _pendingResumeFile: null as File | null,
    _pendingPhotoFile: null as File | null, // ✅ เก็บ File จริงสำหรับ upload รูป

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

      const baseData = {
        resumeUrl: profile.resumeUrl || null,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        fullName: profile.fullName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        aboutYou: profile.aboutYou || "",
        photo: profile.profileImage || null,
        profileImage: profile.profileImage || null,
        education: profile.education || [],
        experience: profile.experience || [],
        projects: profile.projects || [],
        skills: profile.skills || [],
        positionsOfInterest: profile.positionsOfInterest || [],
        preferredLocations: profile.preferredLocations || [],
        gender: profile.gender || "",
        nationality: profile.nationality || "Thai",
        dateOfBirth: profile.dateOfBirth || "",
        internshipPeriod: profile.internshipPeriod || "",
        internshipStart,
        internshipEnd,
      };

      let draftData: any = null;
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) draftData = JSON.parse(raw);
      } catch {}

      setFormData((prev) => ({
        ...prev,
        ...baseData,
        ...(draftData || {}),
        _pendingResumeFile: null,
        _pendingPhotoFile: null,
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

  // Persist draft to localStorage (exclude non-serializable File objects)
  useEffect(() => {
    if (loadKey === 0) return;
    try {
      const { _pendingResumeFile, _pendingPhotoFile, ...saveable } = formData as any;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(saveable));
    } catch {}
  }, [formData, loadKey]);

  // Upload resume file → returns URL
  const uploadResume = async (): Promise<string | null> => {
    if (!formData._pendingResumeFile) {
      const url = formData.resumeUrl;
      if (url?.startsWith("blob:")) return null;
      return url;
    }
    const uploadForm = new FormData();
    uploadForm.append("file", formData._pendingResumeFile);
    const res = await fetch("http://localhost:5001/api/upload/resume", {
      method: "POST",
      body: uploadForm,
      credentials: "include",
    });
    const data = await res.json();
    return data.url ?? null;
  };

  // ✅ Upload profile photo → returns URL
  // Uses backend POST /api/candidates/profile/image which handles S3/local storage
  const uploadPhoto = async (): Promise<string | null> => {
    if (!formData._pendingPhotoFile) {
      // No new file — use existing URL if it's already a real URL (not base64)
      const photo = formData.photo;
      if (!photo || photo.startsWith("data:")) return null;
      return photo;
    }
    const uploadForm = new FormData();
    uploadForm.append("file", formData._pendingPhotoFile);
    const res = await fetch("http://localhost:5001/api/candidates/profile/image", {
      method: "POST",
      body: uploadForm,
      credentials: "include",
    });
    const data = await res.json();
    return data.url ?? null;
  };

  // Sync projects that have not yet been persisted to DB
  const syncProjectsFromFormData = async (projects: any[]) => {
    for (const p of projects) {
      const payload = {
        name: p.name,
        role: p.role,
        description: p.description || "",
        startDate: p.startDate || "",
        endDate: p.endDate || "",
        relatedSkills: p.relatedSkills || [],
      };

      const isNew = p._status === "new" || String(p.id || "").startsWith("local-");
      const isEdited = p._status === "edited" && p.id && !String(p.id).startsWith("local-");
      const isDeleted = p._status === "deleted" && p.id && !String(p.id).startsWith("local-");

      if (isDeleted) {
        await apiFetch(`/api/candidates/projects/${p.id}`, { method: "DELETE" });
      } else if (isNew) {
        await apiFetch("/api/candidates/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else if (isEdited) {
        await apiFetch(`/api/candidates/projects/${p.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
    }
  };

  const validateProjects = (): string[] => {
    const incomplete: string[] = [];
    for (const p of formData.projects) {
      if (p._status === "deleted") continue;
      const missing =
        !p.name?.trim() ||
        !p.role?.trim() ||
        !p.startDate?.trim() ||
        !p.endDate?.trim() ||
        !p.description?.trim() ||
        !p.relatedSkills?.length;
      if (missing) incomplete.push(p.name?.trim() || "(Unnamed Project)");
    }
    return incomplete;
  };

  const handleCreateProfile = () => {
    const incomplete = validateProjects();
    if (incomplete.length > 0) {
      setIncompleteProjectNames(incomplete);
      setShowIncompleteProjectsModal(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmCreateProfile = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setError(null);

    try {
      const [resumeUrl, profileImageUrl] = await Promise.all([
        uploadResume(),
        uploadPhoto(), // ✅ upload รูปพร้อมกัน
      ]);

      // Sync projects — use ref if still on step 4, else use formData
      if (projectsSectionRef.current) {
        await projectsSectionRef.current.syncToDb();
      } else {
        await syncProjectsFromFormData(formData.projects);
      }

      const internshipPeriod =
        formData.internshipPeriod ||
        (formData.internshipStart && formData.internshipEnd
          ? `${formData.internshipStart} - ${formData.internshipEnd}`
          : formData.internshipStart || formData.internshipEnd || "");

      let dateOfBirth: string | null = null;
      if (formData.dateOfBirth) {
        const raw = formData.dateOfBirth.split("T")[0];
        dateOfBirth = `${raw}T12:00:00.000Z`;
      }

      await apiFetch("/api/candidates/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          aboutYou: formData.aboutYou,
          profileImage: profileImageUrl, // ✅ ใช้ URL จริงแทน base64
          resumeUrl,
          positionsOfInterest: formData.positionsOfInterest,
          preferredLocations: formData.preferredLocations,
          education: formData.education,
          experience: formData.experience,
          skills: formData.skills,
          gender: formData.gender,
          nationality: formData.nationality,
          dateOfBirth,
          internshipPeriod,
        }),
      });

      localStorage.removeItem(DRAFT_KEY);
      router.push("/intern/profile");
    } catch (err) {
      setError("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep((s) => s + 1);
  };

  const handlePrevious = () => {
    if (currentStep === 1) {
      router.push("/intern/profile");
    } else {
      setCurrentStep((s) => s - 1);
    }
  };

  const updateFormData = (data: any) => setFormData((prev) => ({ ...prev, ...data }));
  const updateFormDataSilent = (data: any) => setFormData((prev) => ({ ...prev, ...data }));

  if (loadKey === 0) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-gray-400 dark:text-slate-500 text-sm">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#EAF3FA] transition-colors duration-300 dark:bg-slate-950 md:bg-[#F0F4F8]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#223A57] bg-[#0B1C2C]">
        <div className="layout-container flex h-12 items-center justify-between px-3 md:h-[76px] md:px-6">
          <CompanyHubLogoDark href="/" className="shrink-0" />
          <div className="shrink-0 [&_button]:!h-9 [&_button]:!w-9 md:[&_button]:!h-10 md:[&_button]:!w-10 [&_button]:!border-[#223A57] [&_button]:!bg-[#10273F] [&_button:hover]:!bg-[#223A57] [&_button]:focus:ring-blue-400 [&_button]:focus:ring-offset-2 [&_button]:focus:ring-offset-[#0B1C2C] [&_button_svg]:!h-3.5 [&_button_svg]:!w-3.5 md:[&_button_svg]:!h-4 md:[&_button_svg]:!w-4 [&_button_svg]:!text-[#8A94A6]">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="layout-container pt-3 pb-24 md:pt-8 md:pb-36 lg:pt-12">
        <div className="mx-auto w-full max-w-[800px] min-w-0">
          {/* Progress */}
          <div className="mb-2 pt-1 md:mb-4 md:px-1 md:pt-4">
            {/* Mobile */}
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-[#223A57] dark:bg-[#0B1C2C] md:hidden">
              <h1 className="mb-2 text-center text-lg font-semibold leading-tight tracking-tight text-[#0273B1] dark:text-white">
                Start building your profile
              </h1>
              <ProgressIndicator currentStep={currentStep} totalSteps={5} />
            </div>
            {/* Desktop */}
            <div className="hidden md:block md:rounded-lg md:bg-white md:p-6 md:shadow md:dark:bg-slate-800">
              <h1 className="mb-6 text-center text-3xl font-bold leading-tight text-gray-900 dark:text-slate-100">
                Start building your profile
              </h1>
              <ProgressIndicator currentStep={currentStep} totalSteps={5} />
            </div>
          </div>

          {/* Main Card */}
          <div className="rounded-lg bg-white p-4 shadow-md transition-colors dark:bg-slate-800 md:rounded-lg md:p-10 md:shadow">
            {error && <div className="mb-3 text-sm text-red-500 md:mb-4">{error}</div>}

            {currentStep === 1 && (
              <Step0UploadResume
                key={`step0-${loadKey}`}
                data={formData}
                onUpdate={updateFormDataSilent}
                onSkip={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 2 && (
              <Step1GeneralInfo
                key={`step1-${loadKey}`}
                data={formData}
                onUpdate={updateFormData}
                onSkip={() => setCurrentStep(3)}
              />
            )}
            {currentStep === 3 && (
              <Step2BackgroundExperience
                key={`step2-${loadKey}`}
                data={formData}
                onUpdate={updateFormData}
                onSkip={() => setCurrentStep(4)}
                onValidate={(fn) => (educationValidatorRef.current = fn)}
              />
            )}
            {currentStep === 4 && (
              <ProjectsSection
                key={`step3-${loadKey}`}
                ref={projectsSectionRef}
                data={formData}
                onUpdate={updateFormData}
                onSkip={() => setCurrentStep(5)}
              />
            )}
            {currentStep === 5 && (
              <Step3SkillsProjects
                key={`step4-${loadKey}-${skillsKey}`}
                data={formData}
                onUpdate={updateFormData}
                onSkip={() => router.push("/intern/profile")}
              />
            )}

            {/* Footer Buttons */}
            <div className="mt-5 border-t border-gray-200 pt-4 dark:border-slate-700 md:mt-10 md:pt-6">
              {/* Mobile */}
              <div className="flex max-w-full flex-col gap-2 md:hidden">
                <div className="grid w-full min-w-0 grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="inline-flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 text-sm font-medium text-[#1C2D4F] transition-colors hover:bg-gray-50 active:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <svg className="h-4 w-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="truncate">Previous</span>
                  </button>

                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg bg-[#0273B1] px-2 text-sm font-semibold text-white shadow-sm ring-1 ring-[#0273B1]/20 transition-colors hover:bg-[#025a8f] active:scale-[0.99]"
                    >
                      <span className="truncate">Next</span>
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCreateProfile}
                      disabled={isSubmitting}
                      className="inline-flex h-10 min-w-0 items-center justify-center rounded-lg bg-[#16A34A] px-2 text-xs font-semibold leading-tight text-white shadow-sm transition-colors hover:bg-[#15803D] disabled:opacity-60 md:text-sm"
                    >
                      <span className="px-0.5 text-center leading-snug">
                        {isSubmitting ? "Creating..." : "Create Profile"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Desktop */}
              <div className="hidden items-center justify-between gap-3 md:flex">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border-2 border-[#0273B1] bg-white px-4 py-2 text-sm font-semibold text-[#0273B1] transition-colors hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex gap-2">
                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border-2 border-[#0273B1] px-4 py-2 text-sm font-semibold text-[#0273B1] transition-colors hover:bg-blue-50 dark:hover:bg-slate-700"
                    >
                      Next
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCreateProfile}
                      disabled={isSubmitting}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                      style={{ backgroundColor: "#16A34A" }}
                      onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = "#15803D"; }}
                      onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = "#16A34A"; }}
                    >
                      {isSubmitting ? "Creating..." : "Create Profile"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white px-5 py-6 text-center shadow-xl dark:bg-slate-800 sm:px-12 sm:py-10">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-blue-200 flex items-center justify-center">
                <svg className="w-14 h-14 text-[#0273B1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-lg font-bold text-[#1C2D4F] dark:text-white sm:mb-3 sm:text-2xl md:text-3xl">
              Create Profile?
            </h2>
            <p className="mb-6 text-xs text-gray-500 dark:text-slate-400 sm:mb-8 sm:text-sm md:text-base">
               Are you sure you want to create your profile and save your information to your account?
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full rounded-lg border border-gray-300 px-8 py-3 font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={confirmCreateProfile}
                className="w-full rounded-lg px-8 py-3 font-semibold text-white transition-colors sm:w-auto"
                style={{ backgroundColor: "#16A34A" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#15803D"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#16A34A"; }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incomplete Projects Modal */}
      {showIncompleteProjectsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white px-5 py-6 text-center shadow-xl dark:bg-slate-800 sm:px-12 sm:py-10">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-red-200 flex items-center justify-center">
                <svg className="w-14 h-14 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-lg font-bold text-[#1C2D4F] dark:text-white sm:mb-3 sm:text-2xl">
              Incomplete Project Information
            </h2>
            <p className="mb-3 text-xs text-gray-500 dark:text-slate-400 sm:text-sm">
              Please complete all required fields or remove any unwanted projects before proceeding.
            </p>
            <div className="mb-6 flex flex-col gap-1.5">
              {incompleteProjectNames.map((name, i) => (
                <div key={i} className="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400">
                  {name}
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <button
                onClick={() => { setShowIncompleteProjectsModal(false); setCurrentStep(4); }}
                className="w-full rounded-lg px-8 py-3 font-semibold text-white transition-colors sm:w-auto"
                style={{ backgroundColor: "#0273B1" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#025a8f"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0273B1"; }}
              >
                Go to Edit Projects
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}