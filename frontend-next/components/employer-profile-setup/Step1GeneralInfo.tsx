"use client";

import { useState, useEffect } from "react";

interface Step1GeneralInfoProps {
  data: any;
  onUpdate: (data: any) => void;
}

export default function Step1GeneralInfo({
  data,
  onUpdate,
}: Step1GeneralInfoProps) {
  const [formData, setFormData] = useState({
    companyName: data.companyName || "",
    companyDescription: data.companyDescription || "",
    businessType: data.businessType || "",
    companySize: data.companySize || "",
    companyLogo: data.companyLogo || data.logoURL || null,
  });

  // Sync formData when data prop changes (e.g., when profile data is loaded from API)
  useEffect(() => {
    setFormData({
      companyName: data.companyName || "",
      companyDescription: data.companyDescription || "",
      businessType: data.businessType || "",
      companySize: data.companySize || "",
      companyLogo: data.companyLogo || data.logoURL || null,
    });
  }, [
    data.companyName,
    data.companyDescription,
    data.businessType,
    data.companySize,
    data.companyLogo,
    data.logoURL,
  ]);

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const preview = reader.result as string;
      setFormData((prev) => ({ ...prev, companyLogo: preview }));

      try {
        const uploadForm = new FormData();
        uploadForm.append("file", file);

        const res = await fetch("/api/companies/profile/logo", {
          method: "POST",
          body: uploadForm,
          credentials: "include",
        });
        const data = await res.json();

        if (data.url) {
          setFormData((prev) => {
            const updated = { ...prev, companyLogo: data.url };
            onUpdate(updated);
            return updated;
          });
        }
      } catch (err) {
        console.error("Logo upload failed:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const fieldLabel =
    "mb-1 block text-xs font-medium text-[#0273B1] md:mb-2 md:text-[14px] md:font-semibold";
  const fieldInput =
    "h-[42px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-400 md:px-4 md:text-[13px]";

  return (
    <div>
      <div className="mb-3 md:mb-6">
        <h2 className="mb-0.5 text-base font-semibold text-[#1C2D4F] dark:text-slate-100 md:text-2xl md:font-bold">
          Company Information
        </h2>
        <p className="text-xs text-[#A9B4CD] dark:text-slate-400 md:text-sm">
          Fields marked with <span className="text-red-500">*</span> are required.
        </p>
      </div>

      {/* Mobile: logo centered above fields (intern profile-setup pattern) */}
      <div className="mb-4 flex justify-center lg:hidden">
        {formData.companyLogo ? (
          <div className="relative w-[min(11.25rem,72vw)]">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm dark:border-slate-600 dark:bg-slate-700">
              <img
                src={formData.companyLogo}
                alt="Company logo preview"
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="mt-2 flex justify-center gap-2">
              <label className="cursor-pointer rounded-lg border border-[#0273B1] px-2.5 py-1.5 text-xs font-semibold text-[#0273B1] transition hover:bg-blue-50 dark:hover:bg-slate-700">
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...formData, companyLogo: null };
                  setFormData(updated);
                  onUpdate(updated);
                }}
                className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-[#64748B] transition hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="block w-[min(11.25rem,72vw)] cursor-pointer">
            <div className="flex aspect-square w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-[#F9FAFB] transition-colors dark:border-slate-600 dark:bg-slate-700">
              <svg
                className="mb-1 h-6 w-6 text-gray-400 dark:text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-xs font-medium text-gray-400 dark:text-slate-500">
                Add Picture
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="space-y-3 md:space-y-[15px]">
        <div className="grid min-w-0 items-start gap-6 md:gap-8 lg:grid-cols-[minmax(0,494px)_minmax(0,1fr)] lg:gap-[40px]">
          <div className="min-w-0 max-w-full space-y-3 md:space-y-[14px] lg:max-w-[494px]">
            <div>
              <label className={fieldLabel}>
                Company Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Company Name"
                autoComplete="organization"
                suppressHydrationWarning
                className={fieldInput}
              />
            </div>

            <div>
              <label className={fieldLabel}>
                Company Size<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.companySize}
                onChange={(e) => handleChange("companySize", e.target.value)}
                autoComplete="off"
                suppressHydrationWarning
                className={`${fieldInput} text-[#64748B]`}
              >
                <option value="">Select company size</option>
                <option value="less-than-10">Less than 10 people</option>
                <option value="10-50">10-50 people</option>
                <option value="51-200">51-200 people</option>
                <option value="201-500">201-500 people</option>
                <option value="501-1000">501-1000 people</option>
                <option value="more-than-1000">More than 1000 people</option>
              </select>
            </div>

            <div>
              <label className={fieldLabel}>
                Business Type<span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-2 pt-[1px] sm:flex-row sm:flex-wrap sm:gap-x-[30px]">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#6B7280] dark:text-slate-300 sm:text-[13px]">
                  <input
                    type="radio"
                    name="businessType"
                    value="private"
                    checked={formData.businessType === "private"}
                    onChange={(e) => handleChange("businessType", e.target.value)}
                    className="h-[13px] w-[13px]"
                    style={{ accentColor: "#0273B1" }}
                  />
                  <span>Private Company</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#6B7280] dark:text-slate-300 sm:text-[13px]">
                  <input
                    type="radio"
                    name="businessType"
                    value="state-owned"
                    checked={formData.businessType === "state-owned"}
                    onChange={(e) => handleChange("businessType", e.target.value)}
                    className="h-[13px] w-[13px]"
                    style={{ accentColor: "#0273B1" }}
                  />
                  <span>State-owned enterprise</span>
                </label>
              </div>
            </div>
          </div>

          {/* Logo: laptop (lg+) only — setup page */}
          <div className="hidden justify-center pt-[6px] lg:flex lg:justify-end">
            {formData.companyLogo ? (
              <div className="w-full max-w-[170px]">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-slate-600 dark:bg-slate-700">
                  <img
                    src={formData.companyLogo}
                    alt="Company logo preview"
                    className="h-[170px] w-[170px] object-cover"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <label className="cursor-pointer rounded-lg border border-[#0273B1] px-3 py-2 text-xs font-semibold text-[#0273B1] transition hover:bg-blue-50 dark:hover:bg-slate-700">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...formData, companyLogo: null };
                      setFormData(updated);
                      onUpdate(updated);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-[#64748B] transition hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="flex h-[170px] w-[170px] items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-center transition hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600">
                  <div className="flex items-center gap-[10px]">
                    <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#0273B1] text-[14px] text-white">
                      +
                    </div>
                    <span className="text-[13px] font-semibold text-[#334155] dark:text-slate-300">
                      Add Picture
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="pt-1 md:pt-[4px]">
          <label className={fieldLabel}>
            Company Description<span className="text-red-500">*</span>
          </label>
          <p className="mb-2 text-xs leading-snug text-[#A9B4CD] dark:text-slate-400 md:mb-[8px] md:text-[13px] md:leading-[1.4]">
            Provide a brief overview of your company, including industry,
            services, and key strengths.
          </p>
          <textarea
            value={formData.companyDescription}
            onChange={(e) => handleChange("companyDescription", e.target.value)}
            placeholder="Describe your company, industry focus, and core services"
            rows={6}
            maxLength={2000}
            autoComplete="off"
            suppressHydrationWarning
            className="min-h-[100px] w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-400 md:min-h-[116px] md:px-4 md:py-3 md:text-[13px]"
          />
        </div>
      </div>
    </div>
  );
}