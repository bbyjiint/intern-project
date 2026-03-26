"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import CompanyHubLogoDark from "@/components/CompanyHubLogoDark";
import ThemeToggle from "@/components/ThemeToggle";
import Step1GeneralInfo from "@/components/employer-profile-setup/Step1GeneralInfo";
import Step2CompanyAddress from "@/components/employer-profile-setup/Step2CompanyAddress";
import Step3ContactInfo from "@/components/employer-profile-setup/Step3ContactInfo";
import EmployerProgressIndicator from "@/components/employer-profile-setup/EmployerProgressIndicator";

export default function EmployerProfileSetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [showProfileCreatedModal, setShowProfileCreatedModal] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    companyDescription: "",
    businessType: "",
    companySize: "",
    companyLogo: "",
    addressDetails: "",
    subDistrict: "",
    district: "",
    province: "",
    postcode: "",
    provinceId: "",
    districtId: "",
    subdistrictId: "",
    phoneNumber: "",
    email: "",
    websiteUrl: "",
    contactName: "",
  });

  // Check if user has correct role and load existing data
  useEffect(() => {
    apiFetch<{ user: { role: string | null } }>("/api/auth/me")
      .then((data) => {
        setUserRole(data.user.role);
        if (data.user.role !== "COMPANY") {
          router.push("/role-selection");
        }
      })
      .catch(() => {
        router.push("/login");
      });

    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get("step");
    if (stepParam) {
      const step = parseInt(stepParam, 10);
      if (step >= 1 && step <= 3) {
        setCurrentStep(step);
      }
    }

    const loadProfile = async () => {
      try {
        const data = await apiFetch<{ profile: any }>("/api/companies/profile");
        const profile = data.profile || {};

        setFormData((prev) => ({
          companyName: profile.companyName || prev.companyName || "",
          companyDescription: profile.companyDescription || prev.companyDescription || "",
          businessType: profile.businessType || prev.businessType || "",
          companySize: profile.companySize || prev.companySize || "",
          companyLogo: profile.profileImage || profile.companyLogo || profile.logoURL || prev.companyLogo || "",
          addressDetails: profile.addressDetails || prev.addressDetails || "",
          subDistrict: profile.subDistrict || prev.subDistrict || "",
          district: profile.district || prev.district || "",
          province: profile.province || prev.province || "",
          postcode: profile.postcode || prev.postcode || "",
          provinceId: profile.provinceId || prev.provinceId || "",
          districtId: profile.districtId || prev.districtId || "",
          subdistrictId: profile.subdistrictId || prev.subdistrictId || "",
          phoneNumber: profile.phoneNumber || prev.phoneNumber || "",
          email: profile.email || prev.email || "",
          websiteUrl: profile.websiteUrl || prev.websiteUrl || "",
          contactName: profile.contactName || prev.contactName || "",
        }));

        localStorage.setItem("employerProfileData", JSON.stringify(profile));
      } catch (err: any) {
        if (err?.status === 404) {
          const savedData = localStorage.getItem("employerProfileData");
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData);
              setFormData((prev) => ({ ...prev, ...parsed }));
            } catch (e) {
              console.error("Failed to parse profile data:", e);
            }
          }
          return;
        }
        console.error("Failed to load profile data:", err);
        const savedData = localStorage.getItem("employerProfileData");
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setFormData((prev) => ({ ...prev, ...parsed }));
          } catch (e) {
            console.error("Failed to parse profile data:", e);
          }
        }
      }
    };

    loadProfile();
  }, []);

  const buildCompanyPayload = () => ({
    companyName: formData.companyName,
    companyDescription: formData.companyDescription,
    businessType: formData.businessType,
    companySize: formData.companySize,
    profileImage: formData.companyLogo || null,
    addressDetails: formData.addressDetails,
    subDistrict: formData.subDistrict,
    district: formData.district,
    province: formData.province,
    postcode: formData.postcode,
    provinceId: formData.provinceId,
    districtId: formData.districtId,
    subdistrictId: formData.subdistrictId,
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    websiteUrl: formData.websiteUrl,
    contactName: formData.contactName,
  });

  const saveProgress = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await apiFetch("/api/companies/profile", {
        method: "PUT",
        body: JSON.stringify(buildCompanyPayload()),
      });
      setShowSaveModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 1) {
      if (userRole === "COMPANY") {
        router.push("/employer/profile");
      } else {
        router.push("/role-selection");
      }
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateProfile = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await apiFetch("/api/companies/profile", {
        method: "PUT",
        body: JSON.stringify(buildCompanyPayload()),
      });

      localStorage.removeItem("employerProfileData");
      setIsSubmitting(false);
      setShowProfileCreatedModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
      setIsSubmitting(false);
    }
  };

  const handleOpenCreateProfileModal = () => {
    if (isSubmitting) return;
    setShowCreateProfileModal(true);
  };

  const handleConfirmCreateProfile = async () => {
    setShowCreateProfileModal(false);
    await handleCreateProfile();
  };

  const handleViewProfile = () => {
    setShowProfileCreatedModal(false);
    router.push("/employer/profile");
  };

  const updateFormData = (stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#EAF3FA] transition-colors duration-300 dark:bg-slate-950 md:bg-[#F0F4F8]">
      <header className="sticky top-0 z-50 border-b border-[#223A57] bg-[#0B1C2C]">
        <div className="layout-container flex h-12 items-center justify-between px-3 md:h-[76px] md:px-6">
          <CompanyHubLogoDark href="/" className="shrink-0" />
          <div
            className="shrink-0 [&_button]:!h-9 [&_button]:!w-9 md:[&_button]:!h-10 md:[&_button]:!w-10 [&_button]:!border-[#223A57] [&_button]:!bg-[#10273F] [&_button:hover]:!bg-[#223A57] [&_button]:focus:ring-blue-400 [&_button]:focus:ring-offset-2 [&_button]:focus:ring-offset-[#0B1C2C] [&_button_svg]:!h-3.5 [&_button_svg]:!w-3.5 md:[&_button_svg]:!h-4 md:[&_button_svg]:!w-4 [&_button_svg]:!text-[#8A94A6]"
          >
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="layout-container pt-3 pb-24 md:pt-8 md:pb-36 lg:pt-12">
        <div className="mx-auto w-full max-w-[800px] min-w-0">
          <div className="mb-2 pt-1 md:mb-4 md:px-1 md:pt-4">
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-[#223A57] dark:bg-[#0B1C2C] md:hidden">
              <h1 className="mb-2 text-center text-lg font-semibold leading-tight tracking-tight text-[#0273B1] dark:text-white">
                Company Registration
              </h1>
              <EmployerProgressIndicator
                currentStep={currentStep}
                totalSteps={3}
              />
            </div>
            <div className="hidden md:block md:rounded-lg md:bg-white md:p-6 md:shadow md:dark:bg-slate-800">
              <h1 className="mb-6 text-center text-3xl font-bold leading-tight text-gray-900 dark:text-slate-100">
                Company Registration
              </h1>
              <EmployerProgressIndicator
                currentStep={currentStep}
                totalSteps={3}
              />
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-md transition-colors dark:bg-slate-800 md:rounded-lg md:p-10 md:shadow">
            {error && (
              <div className="mb-3 text-sm text-red-500 md:mb-4">{error}</div>
            )}
            {currentStep === 1 && (
              <Step1GeneralInfo data={formData} onUpdate={updateFormData} />
            )}
            {currentStep === 2 && (
              <Step2CompanyAddress data={formData} onUpdate={updateFormData} />
            )}
            {currentStep === 3 && (
              <Step3ContactInfo data={formData} onUpdate={updateFormData} />
            )}

            <div className="mt-5 border-t border-gray-200 pt-4 dark:border-slate-700 md:mt-10 md:pt-6">
              <div className="flex max-w-full flex-col gap-2 md:hidden">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={saveProgress}
                    disabled={isSubmitting}
                    className="inline-flex h-10 max-w-full shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#0273B1] bg-white px-3 text-sm font-medium text-[#0273B1] transition-colors hover:bg-blue-50 disabled:opacity-60 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    <svg
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
                <div className="grid w-full min-w-0 grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="inline-flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 text-sm font-medium text-[#1C2D4F] transition-colors hover:bg-gray-50 active:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <svg
                      className="h-4 w-4 shrink-0 opacity-70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span className="truncate">Previous</span>
                  </button>
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg bg-[#0273B1] px-2 text-sm font-semibold text-white shadow-sm ring-1 ring-[#0273B1]/20 transition-colors hover:bg-[#025a8f] active:scale-[0.99]"
                    >
                      <span className="truncate">Next</span>
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenCreateProfileModal}
                      disabled={isSubmitting}
                      className="inline-flex h-10 min-w-0 items-center justify-center rounded-lg bg-[#16A34A] px-2 text-xs font-semibold leading-tight text-white shadow-sm transition-colors hover:bg-[#15803D] disabled:opacity-60 md:text-sm"
                    >
                      <span className="px-0.5 text-center leading-snug">
                        Create Profile
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="hidden items-center justify-between gap-3 md:flex">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border-2 border-[#0273B1] bg-white px-4 py-2 text-sm font-semibold text-[#0273B1] transition-colors hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveProgress}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-95 disabled:opacity-60"
                    style={{ backgroundColor: "#0273B1" }}
                  >
                    <svg
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border-2 border-[#0273B1] px-4 py-2 text-sm font-semibold text-[#0273B1] transition-colors hover:bg-blue-50 dark:hover:bg-slate-700"
                    >
                      Next
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenCreateProfileModal}
                      disabled={isSubmitting}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                      style={{ backgroundColor: "#16A34A" }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting)
                          e.currentTarget.style.backgroundColor = "#15803D";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting)
                          e.currentTarget.style.backgroundColor = "#16A34A";
                      }}
                    >
                      Create Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white px-5 py-6 text-center shadow-xl dark:bg-slate-800 sm:px-12 sm:py-10">
            <div className="mb-6 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-green-200">
                <svg
                  className="h-14 w-14 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-lg font-bold text-[#1C2D4F] dark:text-white sm:mb-3 sm:text-2xl md:text-3xl">
              Saved Successfully
            </h2>
            <p className="mb-6 text-xs text-gray-500 dark:text-slate-400 sm:mb-8 sm:text-sm md:text-base">
              Your information has been saved. You can update your profile at
              any time.
            </p>
            <button
              type="button"
              onClick={() => setShowSaveModal(false)}
              className="w-full rounded-lg px-10 py-3 font-semibold text-white transition-colors sm:w-auto"
              style={{ backgroundColor: "#0273B1" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#025a8f";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#0273B1";
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showCreateProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white px-5 py-6 text-center shadow-xl dark:bg-slate-800 sm:px-12 sm:py-10">
            <div className="mb-6 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-blue-200">
                <svg
                  className="h-14 w-14 text-[#0273B1]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-lg font-bold text-[#1C2D4F] dark:text-white sm:mb-3 sm:text-2xl md:text-3xl">
              Ready to Create Your Profile?
            </h2>
            <p className="mb-6 text-xs text-gray-500 dark:text-slate-400 sm:mb-8 sm:text-sm md:text-base">
              Are you sure you want to proceed? You can update your information
              at any time.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => setShowCreateProfileModal(false)}
                className="w-full rounded-lg border border-gray-300 px-8 py-3 font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateProfile}
                disabled={isSubmitting}
                className="w-full rounded-lg px-8 py-3 font-semibold text-white transition-colors sm:w-auto disabled:opacity-60"
                style={{ backgroundColor: "#0273B1" }}
                onMouseEnter={(e) => {
                  if (!isSubmitting)
                    e.currentTarget.style.backgroundColor = "#025a8f";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting)
                    e.currentTarget.style.backgroundColor = "#0273B1";
                }}
              >
                {isSubmitting ? "Creating..." : "Ready"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfileCreatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white px-5 py-6 text-center shadow-xl dark:bg-slate-800 sm:px-12 sm:py-10">
            <div className="mb-6 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-green-200">
                <svg
                  className="h-14 w-14 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-lg font-bold text-[#1C2D4F] dark:text-white sm:mb-3 sm:text-2xl md:text-3xl">
              Your Profile Created
            </h2>
            <p className="mb-6 text-xs text-gray-500 dark:text-slate-400 sm:mb-8 sm:text-sm md:text-base">
              Your profile has been successfully created. You can update it at
              any time.
            </p>
            <button
              type="button"
              onClick={handleViewProfile}
              className="w-full rounded-lg px-10 py-3 font-semibold text-white transition-colors sm:w-auto"
              style={{ backgroundColor: "#0273B1" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#025a8f";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#0273B1";
              }}
            >
              View Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}