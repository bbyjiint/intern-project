"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import CompanyHubLogo from "@/components/CompanyHubLogo";

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

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingStep, setPendingStep] = useState<number | null>(null);

  // loadKey increments after profile loads — used as key on steps to force re-mount with correct data
  const [loadKey, setLoadKey] = useState(0);

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

  // ─── Auth Check ───────────────────────────────────────────────────────────

  useEffect(() => {
    apiFetch<{ user: { role: string | null } }>("/api/auth/me")
      .then((data) => {
        if (data.user.role !== "CANDIDATE") router.push("/role-selection");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // ─── Load Profile ─────────────────────────────────────────────────────────

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
        // FIX: use empty string fallback (not null) so form fields display correctly
        gender: profile.gender || "",
        nationality: profile.nationality || "Thai",
        dateOfBirth: profile.dateOfBirth || "",
        internshipPeriod: profile.internshipPeriod || "",
        internshipStart,
        internshipEnd,
      }));
    } catch (err) {
      console.error("Load profile failed:", err);
    } finally {
      // Always unlock the page after the initial fetch, even for new/empty profiles.
      setLoadKey((prev) => (prev === 0 ? 1 : prev));
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ─── Upload Resume ────────────────────────────────────────────────────────

  const uploadResume = async () => {
    if (!formData._pendingResumeFile) return formData.resumeUrl;

    const uploadForm = new FormData();
    uploadForm.append("file", formData._pendingResumeFile);

    const res = await fetch("http://localhost:5001/api/upload/resume", {
      method: "POST",
      body: uploadForm,
      credentials: "include",
    });

    const data = await res.json();
    return data.url;
  };

  // ─── Save Profile ─────────────────────────────────────────────────────────

  const saveProfile = async () => {
    if (currentStep === 3 && educationValidatorRef.current) {
      const valid = await educationValidatorRef.current();
      if (!valid) return;
    }

    setIsSubmitting(true);

    try {
      const resumeUrl = await uploadResume();

      if (currentStep === 4 && projectsSectionRef.current) {
        await projectsSectionRef.current.syncToDb();
      }

      const internshipPeriod =
        formData.internshipPeriod ||
        (formData.internshipStart && formData.internshipEnd
          ? `${formData.internshipStart} - ${formData.internshipEnd}`
          : formData.internshipStart || formData.internshipEnd || "");

      // FIX: send midday UTC to prevent timezone day-shift in backend
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
          profileImage: formData.photo || null,
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

      setHasUnsavedChanges(false);
      setShowSaveModal(true);
    } catch (err) {
      setError("Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Create Profile ──────────────────────────────────────────────────────

  const handleCreateProfile = () => {
    setShowConfirmModal(true);
  };

  const confirmCreateProfile = async () => {
    setShowConfirmModal(false);
    await saveProfile();
    router.push("/intern/profile");
  };

  // ─── Navigation ───────────────────────────────────────────────────────────

  // Reset dirty flag whenever step actually changes
  useEffect(() => {
    setHasUnsavedChanges(false);
  }, [currentStep]);

  const tryNavigateTo = (targetStep: number) => {
    if (hasUnsavedChanges) {
      setPendingStep(targetStep);
      setShowUnsavedModal(true);
    } else {
      setHasUnsavedChanges(false); // ensure clean state when navigating
      setCurrentStep(targetStep);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) tryNavigateTo(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep === 1) {
      // Step 1 goes back to profile page — check unsaved changes first
      if (hasUnsavedChanges) {
        setPendingStep(0); // 0 = special flag meaning "go to /intern/profile"
        setShowUnsavedModal(true);
      } else {
        router.push("/intern/profile");
      }
    } else {
      tryNavigateTo(currentStep - 1);
    }
  };

  // Called when user actively edits a field — marks unsaved changes
  const updateFormData = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setHasUnsavedChanges(true);
  };



  const handleLeaveWithoutSaving = async () => {
    setShowUnsavedModal(false);
    setLoadKey(0);
    await loadProfile();
    setHasUnsavedChanges(false);
    if (pendingStep === 0) {
      // Special case: navigate away from setup entirely
      setPendingStep(null);
      router.push("/intern/profile");
    } else if (pendingStep !== null) {
      setCurrentStep(pendingStep);
      setPendingStep(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  // Show loading spinner until profile data is ready
  // Show spinner on first load only
  if (loadKey === 0) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <div className="bg-white border-b">
        <div className="layout-container layout-page-tight">
          <CompanyHubLogo href="/" />
        </div>
      </div>

      <div className="layout-container layout-page">
        <div className="mx-auto max-w-[800px]">
          <div className="bg-white p-6 rounded-lg shadow mb-4">
            <h1 className="text-3xl font-bold text-center mb-6">Start building your profile</h1>
            <ProgressIndicator currentStep={currentStep} totalSteps={5} />
          </div>

          <div className="bg-white p-10 rounded-lg shadow">
            {error && <div className="text-red-500 mb-4">{error}</div>}

          {/* FIX: key={profileLoaded ? "loaded" : "loading"} forces re-mount
              so each step initialises its local state with the correct data */}

          {currentStep === 1 && (
            <Step0UploadResume
              key={`step0-${loadKey}`}
              data={formData}
              onUpdate={updateFormData}
              onSkip={() => tryNavigateTo(2)}
            />
          )}

          {currentStep === 2 && (
            <Step1GeneralInfo
              key={`step1-${loadKey}`}
              data={formData}
              onUpdate={updateFormData}
              onSkip={() => tryNavigateTo(3)}
            />
          )}

          {currentStep === 3 && (
            <Step2BackgroundExperience
              key={`step2-${loadKey}`}
              data={formData}
              onUpdate={updateFormData}
              onSkip={() => tryNavigateTo(4)}
              onValidate={(fn) => (educationValidatorRef.current = fn)}
            />
          )}

          {currentStep === 4 && (
            <ProjectsSection
              key={`step3-${loadKey}`}
              ref={projectsSectionRef}
              data={formData}
              onUpdate={updateFormData}
              onSkip={() => tryNavigateTo(5)}
            />
          )}

          {currentStep === 5 && (
            <Step3SkillsProjects
              key={`step4-${loadKey}`}
              data={formData}
              onUpdate={updateFormData}
              onSkip={() => router.push("/intern/profile")}
            />
          )}

            <div className="flex justify-between mt-10 pt-6 border-t">
            <button
              onClick={handlePrevious}
              className="flex items-center px-6 py-3 rounded-lg font-semibold"
              style={{ backgroundColor: "white", border: "2px solid #0273B1", color: "#0273B1" }}
            >
              Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={saveProfile}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-lg text-white font-semibold"
                style={{ backgroundColor: "#0273B1" }}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg border font-semibold"
                  style={{ border: "2px solid #0273B1", color: "#0273B1" }}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreateProfile}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: "#16A34A" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#15803D" }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#16A34A" }}
                >
                  Create Profile
                </button>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save success modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl px-12 py-10 max-w-lg w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-green-200 flex items-center justify-center">
                <svg className="w-14 h-14 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#1C2D4F] mb-3">Saved Successfully</h2>
            <p className="text-gray-500 text-base mb-8">
              Your information has been saved. You can update your profile at any time.
            </p>
            <button
              onClick={() => setShowSaveModal(false)}
              className="px-10 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: "#0273B1" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#025a8f" }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#0273B1" }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Create Profile modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl px-12 py-10 max-w-lg w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-blue-200 flex items-center justify-center">
                <svg className="w-14 h-14 text-[#0273B1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#1C2D4F] mb-3">Create Profile?</h2>
            <p className="text-gray-500 text-base mb-8">
              ยืนยันที่จะสร้างโปรไฟล์และบันทึกข้อมูลลงในบัญชีของคุณใช่ไหม?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-8 py-3 rounded-lg font-semibold border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmCreateProfile}
                className="px-8 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: "#16A34A" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#15803D" }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#16A34A" }}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved changes modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl px-12 py-10 max-w-lg w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-yellow-200 flex items-center justify-center">
                <svg className="w-14 h-14 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#1C2D4F] mb-3">Unsaved Changes</h2>
            <p className="text-gray-500 text-base mb-8">You have unsaved changes. Continue without saving?</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleLeaveWithoutSaving}
                className="px-8 py-3 rounded-lg font-semibold border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Leave without saving
              </button>
              <button
                onClick={() => { setShowUnsavedModal(false); saveProfile(); }}
                className="px-8 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: "#0273B1" }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#025a8f" }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#0273B1" }}
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}