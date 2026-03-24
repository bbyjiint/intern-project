"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import ThemedCompanyHubLogo from "@/components/ThemedCompanyHubLogo";
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
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-50 transition-colors">
        <div className="mx-auto flex h-[82px] max-w-[1120px] items-center justify-between px-[34px]">
          <ThemedCompanyHubLogo href="/" />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="layout-container layout-page-compact">
        {/* Progress Card */}
        <div className="mx-auto mb-4 max-w-[1008px] rounded-lg bg-white dark:bg-slate-800 px-6 py-10 shadow transition-colors">
          <h1 className="text-center text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Company Registration
          </h1>
          <EmployerProgressIndicator
            currentStep={currentStep}
            totalSteps={3}
          />
        </div>

        {/* Form Content */}
        <div className="mx-auto max-w-[1008px] rounded-lg bg-white dark:bg-slate-800 px-[44px] py-[34px] shadow transition-colors">
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
          <div className="mt-10 pt-6 border-t dark:border-slate-700 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handlePrevious}
              className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-white dark:bg-slate-800 border-2 border-[#0273B1] text-[#0273B1] hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors order-2 sm:order-1 w-full sm:w-auto"
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
                className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold border-2 border-[#0273B1] text-[#0273B1] hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors order-1 sm:order-2 w-full sm:w-auto"
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
                className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-colors order-1 sm:order-2 w-full sm:w-auto"
                style={{ backgroundColor: "#0273B1" }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = "#025a8f";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = "#0273B1";
                }}
              >
                {isSubmitting ? "Creating..." : "Create Profile"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Create Profile Modal */}
      {showCreateProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl px-12 py-10 max-w-lg w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-blue-200 flex items-center justify-center">
                <svg className="w-14 h-14 text-[#0273B1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#1C2D4F] dark:text-white mb-3">
              Ready to Create Your Profile?
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-base mb-8">
              Are you sure you want to proceed? You can update your information at any time.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowCreateProfileModal(false)}
                className="px-8 py-3 rounded-lg font-semibold border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreateProfile}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg font-semibold text-white transition-colors"
                style={{ backgroundColor: "#0273B1" }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = "#025a8f";
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = "#0273B1";
                }}
              >
                {isSubmitting ? "Creating..." : "Ready"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Created Success Modal */}
      {showProfileCreatedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl px-12 py-10 max-w-lg w-full text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-green-200 flex items-center justify-center">
                <svg className="w-14 h-14 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#1C2D4F] dark:text-white mb-3">
              Your Profile Created
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-base mb-8">
              Your profile has been successfully created. You can update it at any time.
            </p>
            <button
              onClick={handleViewProfile}
              className="px-10 py-3 rounded-lg font-semibold text-white transition-colors"
              style={{ backgroundColor: "#0273B1" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#025a8f"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0273B1"; }}
            >
              View Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}