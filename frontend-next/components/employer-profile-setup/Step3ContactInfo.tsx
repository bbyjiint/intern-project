"use client";

import { useState, useEffect } from "react";
import { COUNTRY_DATA } from "@/constants/countries";

interface Step3ContactInfoProps {
  data: any;
  onUpdate: (data: any) => void;
}

const DIAL_CODES = COUNTRY_DATA.filter((c) => c.dialCode !== "").map(
  (c) => c.dialCode,
);

/** Longest dial code first so +886 matches before +86 */
function parsePhoneNumber(raw: string): { prefix: string; local: string } {
  const t = (raw || "").trim();
  if (!t) return { prefix: "+66", local: "" };
  const sorted = [...DIAL_CODES].sort((a, b) => b.length - a.length);
  for (const code of sorted) {
    if (t === code) return { prefix: code, local: "" };
    if (t.startsWith(code + " ")) {
      return { prefix: code, local: t.slice(code.length + 1).trim() };
    }
    if (t.startsWith(code) && /^\d/.test(t.slice(code.length))) {
      return { prefix: code, local: t.slice(code.length).trim() };
    }
  }
  return { prefix: "+66", local: t.replace(/^\+\d+\s*/, "").trim() };
}

function stripLocal(full: string, prefix: string): string {
  const t = (full || "").trim();
  if (!t) return "";
  if (t.startsWith(prefix + " ")) return t.slice(prefix.length + 1).trim();
  if (t.startsWith(prefix)) return t.slice(prefix.length).trim();
  return parsePhoneNumber(t).local;
}

export default function Step3ContactInfo({
  data,
  onUpdate,
}: Step3ContactInfoProps) {
  const [phonePrefix, setPhonePrefix] = useState<string>("+66");
  const [formData, setFormData] = useState({
    phoneNumber: data.phoneNumber || "",
    email: data.email || "",
    websiteUrl: data.websiteUrl || "",
    contactName: data.contactName || "",
  });

  useEffect(() => {
    const p = parsePhoneNumber(data.phoneNumber || "");
    setPhonePrefix(p.prefix);
    setFormData({
      phoneNumber: data.phoneNumber || "",
      email: data.email || "",
      websiteUrl: data.websiteUrl || "",
      contactName: data.contactName || "",
    });
  }, [data.phoneNumber, data.email, data.websiteUrl, data.contactName]);

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  const handlePhonePrefixChange = (newPrefix: string) => {
    const rawLocal = stripLocal(formData.phoneNumber, phonePrefix);
    const local = rawLocal.replace(/[^0-9-]/g, "");
    setPhonePrefix(newPrefix);
    const next = local ? `${newPrefix} ${local}` : "";
    const updated = { ...formData, phoneNumber: next };
    setFormData(updated);
    onUpdate(updated);
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-[13px] text-[#1E293B] dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-400 outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE]";

  const localDigits = stripLocal(formData.phoneNumber, phonePrefix).replace(
    /[^0-9-]/g,
    "",
  );

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-[#0273B1] dark:text-white sm:mb-8 sm:text-2xl">
        Contact Information
      </h2>

      <div className="space-y-6">
        {/* Phone — same row layout as intern profile setup (dial + number) */}
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-medium text-[#0273B1] md:mb-2">
            Phone Number
          </label>
          <div className="flex min-w-0 gap-2">
            <select
              value={phonePrefix}
              onChange={(e) => handlePhonePrefixChange(e.target.value)}
              size={1}
              className="w-[4.75rem] shrink-0 rounded-lg border border-gray-300 bg-slate-50 px-1.5 py-2.5 text-sm tabular-nums text-[#1E293B] outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 md:w-[120px] md:px-3 md:py-3"
            >
              {COUNTRY_DATA.filter((c) => c.dialCode !== "").map((country) => (
                <option key={`${country.name}-${country.dialCode}`} value={country.dialCode}>
                  {country.dialCode}
                </option>
              ))}
            </select>
            <input
              type="tel"
              maxLength={15}
              value={localDigits}
              onChange={(e) => {
                const sanitized = e.target.value.replace(/[^0-9-]/g, "");
                const full = sanitized ? `${phonePrefix} ${sanitized}` : "";
                handleChange("phoneNumber", full);
              }}
              placeholder="e.g. 08x-xxx-xxxx"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-[#1E293B] outline-none transition focus:border-[#0273B1] focus:ring-2 focus:ring-[#BFDBFE] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder:text-slate-400 md:px-4 md:py-3"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-[#0273B1]">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="company@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-[#0273B1]">
            Website URL{" "}
            <span className="text-xs font-normal text-[#A9B4CD] dark:text-slate-500">
              (Optional)
            </span>
          </label>
          <input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => handleChange("websiteUrl", e.target.value)}
            placeholder="https://www.example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-[#0273B1]">
            Contact Name
          </label>
          <input
            type="text"
            value={formData.contactName}
            onChange={(e) => handleChange("contactName", e.target.value)}
            placeholder="Enter contact person name"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
