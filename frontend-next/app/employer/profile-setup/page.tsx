"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import ThemedCompanyHubLogo from "@/components/ThemedCompanyHubLogo";
import Step1GeneralInfo from "@/components/employer-profile-setup/Step1GeneralInfo";
import Step2CompanyAddress from "@/components/employer-profile-setup/Step2CompanyAddress";
import Step3ContactInfo from "@/components/employer-profile-setup/Step3ContactInfo";
import EmployerProgressIndicator from "@/components/employer-profile-setup/EmployerProgressIndicator";
import { useTheme } from "@/components/ThemeProvider";

export default function EmployerProfileSetupPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
  const [showProfileCreatedModal, setShowProfileCreatedModal] = useState(false);

  // ✅ ย้าย useState ขึ้นมาก่อน useEffect
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

        // ✅ เพิ่ม provinceId, districtId, subdistrictId และแก้ companyLogo ให้รับ profileImage ด้วย
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
        body: JSON.stringify({
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
        }),
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
    <div
      className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950"
      style={{
        background: theme === "dark"
          ? "linear-gradient(180deg, #121316 0%, #262626 100%)"
          :
          "linear-gradient(180deg, #F3F4F6 0px, #F3F4F6 92px, #EAF3FA 92px, #EAF3FA 100%)",
      }}
    >
      {/* Header */}
      <div
        className="border-b border-[#E5E7EB] bg-[#F3F4F6] transition-colors dark:bg-[#121212]"
        style={{
          borderColor: theme === "dark" ? "#eff3fa" : "#E5E7EB",
        }}
      >
        <div className="mx-auto flex h-[82px] max-w-[1120px] items-center px-[34px]">
          <ThemedCompanyHubLogo href="/" />
        </div>
      </div>

      {/* Main Content */}
      <div className="layout-container layout-page-compact">
        <div className="mx-auto mb-[18px] min-h-[193px] max-w-[1008px] rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-[40px] shadow-[0_6px_16px_rgba(148,163,184,0.2)] transition-colors dark:border-transparent dark:bg-[#070e12] dark:shadow-[0_8px_22px_rgba(0,0,0,0.25)] sm:px-10">
          <h1
            className="text-center text-[31px] font-bold leading-none"
            style={{ color: "#0273B1" }}
          >
            Company Registration
          </h1>

          <div className="mt-[26px]">
            <EmployerProgressIndicator
              currentStep={currentStep}
              totalSteps={3}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="mx-auto min-h-[538px] max-w-[1008px] rounded-[12px] border border-[#E5E7EB] bg-white px-[44px] py-[34px] shadow-[0_8px_22px_rgba(148,163,184,0.24)] transition-colors dark:border-transparent dark:bg-[#070e12] dark:shadow-[0_8px_22px_rgba(0,0,0,0.25)]">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
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

          {/* Navigation Buttons */}
          <div className="mt-[40px] flex flex-col gap-4 sm:mt-[34px] sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handlePrevious}
              className="order-2 flex h-[35px] w-full items-center justify-center rounded-[7px] border-2 border-[#0273B1] bg-white px-5 text-[14px] font-semibold text-[#0273B1] transition-colors hover:bg-[#F0F4F8] dark:bg-slate-900 dark:hover:bg-slate-800 sm:order-1 sm:w-auto"
              style={{ minWidth: "122px" }}
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Back
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="order-1 flex h-[35px] w-full items-center justify-center rounded-[7px] border-2 border-[#0273B1] bg-white px-5 text-[14px] font-semibold text-[#0273B1] transition-colors hover:bg-[#F0F4F8] dark:bg-slate-900 dark:hover:bg-slate-800 sm:order-2 sm:w-auto"
                style={{ minWidth: "106px" }}
              >
                Next
                <svg
                  className="w-5 h-5 ml-2"
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
                onClick={handleOpenCreateProfileModal}
                disabled={isSubmitting}
                className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors h-11 w-full sm:w-auto order-1 sm:order-2"
                style={{ backgroundColor: "#0273B1", minWidth: "120px" }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = "#025a8f";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = "#0273B1";
                  }
                }}
              >
                {isSubmitting ? "Creating..." : "Create Profile"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showCreateProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-[440px] rounded-[20px] bg-white px-8 py-10 shadow-[0_20px_50px_rgba(15,23,42,0.24)] transition-colors dark:bg-[#070e12] dark:shadow-none dark:ring-1 dark:ring-[#0273b1]/30">
            <div className="flex flex-col items-center text-center">
              <div
                className="mb-8 flex h-[110px] w-[110px] items-center justify-center rounded-full border-[4px]"
                style={{ borderColor: "#9BB8C9" }}
              >
                <span
                  className="select-none text-[64px] font-light leading-none"
                  style={{ color: "#9BB8C9", transform: "translateY(-2px)" }}
                >
                  ?
                </span>
              </div>

              <h2
                className="mb-3 text-[22px] font-bold leading-tight text-[#2C3E67] dark:text-white"
              >
                Ready to Create Your Profile?
              </h2>

              <p className="mb-8 max-w-[330px] text-[14px] leading-6 text-[#7A879A] dark:text-[#7f7f7f]">
                Are you sure you want to proceed? You can update your
                information at any time.
              </p>

              <div className="flex w-full max-w-[270px] gap-3">
                <button
                  onClick={() => setShowCreateProfileModal(false)}
                  className="flex-1 rounded-[8px] border-2 border-[#0273B1] bg-white px-6 py-3 text-[14px] font-semibold text-[#0273B1] transition-colors hover:bg-[#F0F4F8] dark:bg-[#070e12] dark:text-[#0273b1] dark:hover:bg-[#070e12]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreateProfile}
                  disabled={isSubmitting}
                  className="flex-1 rounded-[8px] px-6 py-3 text-[14px] font-semibold text-white transition-colors"
                  style={{ backgroundColor: "#0273B1" }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = "#025a8f";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = "#0273B1";
                    }
                  }}
                >
                  {isSubmitting ? "Creating..." : "Ready"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfileCreatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-[440px] rounded-[20px] bg-white px-8 py-10 shadow-[0_20px_50px_rgba(15,23,42,0.24)] transition-colors dark:bg-slate-950 dark:shadow-none dark:ring-1 dark:ring-slate-800">
            <div className="flex flex-col items-center text-center">
              <div
                className="mb-7 flex h-[96px] w-[96px] items-center justify-center rounded-full border-[4px]"
                style={{ borderColor: "#DCE8D1" }}
              >
                <svg
                  className="h-[50px] w-[50px]"
                  style={{ color: "#9ACA7A" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2
                className="mb-3 text-[22px] font-bold leading-tight text-[#2C3E67] dark:text-white"
              >
                Your Profile Created
              </h2>

              <p
                className="mb-8 max-w-[330px] text-[14px] leading-6 text-[#7A879A] dark:text-slate-400"
              >
                Your profile has been successfully created. You can update it at
                any time.
              </p>

              <button
                onClick={handleViewProfile}
                className="rounded-[8px] px-8 py-3 text-[14px] font-semibold text-white transition-colors"
                style={{ backgroundColor: "#0273B1", minWidth: "166px" }}
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
        </div>
      )}
    </div>
  );
}