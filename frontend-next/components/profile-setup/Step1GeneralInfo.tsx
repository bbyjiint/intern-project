"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { POSITION_OPTIONS } from "@/constants/positionOptions";
import { COUNTRY_DATA } from "@/constants/countries";

interface Province {
  id: string;
  name: string;
  thname: string | null;
}

interface FormFields {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  email: string;
  phoneNumber: string;
  aboutYou: string;
  photo: string | null;
  positionsOfInterest: string[];
  preferredLocations: string[];
  internshipStart: string;
  internshipEnd: string;
  internshipPeriod: string;
}

interface Step1Props {
  data: any;
  onUpdate: (data: any) => void;
  onSkip?: () => void;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ml-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
      ✨ AI filled
    </span>
  );
}

function parseDate(val: string): { day: number; month: number; year: number } | null {
  if (!val) return null;
  const iso = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return { year: +iso[1], month: +iso[2], day: +iso[3] };
  const dmy = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return { day: +dmy[1], month: +dmy[2], year: +dmy[3] };
  return null;
}

function toDisplayDate(val: string): string {
  const p = parseDate(val);
  if (!p) return val;
  return `${String(p.day).padStart(2, "0")}/${String(p.month).padStart(2, "0")}/${p.year}`;
}

function DayMonthYearPicker({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"day" | "month" | "year">("day");
  const wrapRef = useRef<HTMLDivElement>(null);

  const parsed = parseDate(value);
  const today = new Date();
  const [calYear, setCalYear] = useState(parsed?.year ?? today.getFullYear());
  const [calMonth, setCalMonth] = useState(parsed?.month ?? today.getMonth() + 1);

  useEffect(() => {
    const p = parseDate(value);
    if (p) { setCalYear(p.year); setCalMonth(p.month); }
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
  const getFirstDay = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

  const prevMonth = () => {
    if (calMonth === 1) { setCalMonth(12); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 12) { setCalMonth(1); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  const selectDay = (day: number) => {
    onChange(`${calYear}-${String(calMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    setOpen(false);
  };

  const days = Array.from({ length: getDaysInMonth(calYear, calMonth) }, (_, i) => i + 1);
  const blanks = Array.from({ length: getFirstDay(calYear, calMonth) }, (_, i) => i);

  const btnStyle = (active: boolean) => ({
    backgroundColor: active ? "#0273B1" : "transparent",
    color: active ? "#fff" : undefined,
  });

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          type="text"
          readOnly
          value={value ? toDisplayDate(value) : ""}
          placeholder={placeholder}
          onClick={() => { setOpen((v) => !v); setView("day"); }}
          className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 md:px-4 md:py-3"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => { setOpen((v) => !v); setView("day"); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg p-4" style={{ minWidth: 280 }}>
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700">
              <svg className="w-4 h-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => setView((v) => (v === "month" ? "day" : "month"))} className="font-semibold text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-[#1C2D4F] dark:text-slate-200">
                {MONTHS[calMonth - 1]}
              </button>
              <button type="button" onClick={() => setView((v) => (v === "year" ? "day" : "year"))} className="font-semibold text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-[#1C2D4F] dark:text-slate-200">
                {calYear}
              </button>
            </div>
            <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700">
              <svg className="w-4 h-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {view === "month" && (
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((m, i) => (
                <button key={m} type="button" onClick={() => { setCalMonth(i + 1); setView("day"); }}
                  className="py-2 rounded-lg text-sm font-medium transition-colors dark:text-slate-200"
                  style={btnStyle(calMonth === i + 1)}
                  onMouseEnter={(e) => { if (calMonth !== i + 1) e.currentTarget.style.backgroundColor = "#E3F5FF"; }}
                  onMouseLeave={(e) => { if (calMonth !== i + 1) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {view === "year" && (
            <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
              {Array.from({ length: 100 }, (_, i) => today.getFullYear() - i).map((y) => (
                <button key={y} type="button" onClick={() => { setCalYear(y); setView("day"); }}
                  className="py-2 rounded-lg text-sm font-medium transition-colors dark:text-slate-200"
                  style={btnStyle(calYear === y)}
                  onMouseEnter={(e) => { if (calYear !== y) e.currentTarget.style.backgroundColor = "#E3F5FF"; }}
                  onMouseLeave={(e) => { if (calYear !== y) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {view === "day" && (
            <>
              <div className="grid grid-cols-7 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="text-center text-xs font-medium py-1 text-[#A9B4CD] dark:text-slate-500">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {blanks.map((b) => <div key={`b${b}`} />)}
                {days.map((day) => {
                  const active = parsed?.day === day && parsed?.month === calMonth && parsed?.year === calYear;
                  return (
                    <button key={day} type="button" onClick={() => selectDay(day)}
                      className="w-8 h-8 mx-auto rounded-full text-sm font-medium transition-colors flex items-center justify-center dark:text-slate-200"
                      style={btnStyle(active)}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = "#E3F5FF"; }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function buildFormFields(data: any): FormFields {
  const nameParts = (data.fullName || "").split(" ");
  let internshipStart = data.internshipStart || "";
  let internshipEnd = data.internshipEnd || "";
  if (!internshipStart && data.internshipPeriod) {
    const parts = data.internshipPeriod.split(" - ");
    internshipStart = parts[0] || "";
    internshipEnd = parts[1] || "";
  }
  return {
    firstName: data.firstName || nameParts[0] || "",
    lastName: data.lastName || nameParts.slice(1).join(" ") || "",
    gender: data.gender || "",
    dateOfBirth: data.dateOfBirth || "",
    nationality: data.nationality || "Thai",
    email: data.email || "",
    phoneNumber: data.phoneNumber || "",
    aboutYou: data.aboutYou || data.professionalSummary || "",
    photo: data.photo || data.profileImage || null,
    positionsOfInterest: data.positionsOfInterest || [],
    preferredLocations: data.preferredLocations || [],
    internshipStart,
    internshipEnd,
    internshipPeriod: data.internshipPeriod || "",
  };
}

const AI_FLAG_MAP: Partial<Record<keyof FormFields, string>> = {
  firstName: "_aiFilled_firstName",
  lastName: "_aiFilled_lastName",
  email: "_aiFilled_email",
  phoneNumber: "_aiFilled_phoneNumber",
  aboutYou: "_aiFilled_aboutYou",
};

export default function Step1GeneralInfo({ data, onUpdate, onSkip }: Step1Props) {
  const [fields, setFields] = useState<FormFields>(() => buildFormFields(data));
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvinceIds, setSelectedProvinceIds] = useState<string[]>([]);
  const [phonePrefix, setPhonePrefix] = useState<string>("+66");

  useEffect(() => {
    setFields(buildFormFields(data));
    const locs = data.preferredLocations || [];
    if (locs.length > 0) setSelectedProvinceIds(locs);
  }, [data]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<{ provinces: Province[] }>("/api/addresses/provinces");
        if (!cancelled) setProvinces(res.provinces || []);
      } catch {
        if (!cancelled) setProvinces([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (field: keyof FormFields, value: string | string[]) => {
    const updated = { ...fields, [field]: value } as FormFields;

    if (field === "firstName" || field === "lastName") {
      (updated as any).fullName = `${updated.firstName} ${updated.lastName}`.trim();
    }
    if (field === "internshipStart" || field === "internshipEnd") {
      const start = field === "internshipStart" ? (value as string) : updated.internshipStart;
      const end = field === "internshipEnd" ? (value as string) : updated.internshipEnd;
      updated.internshipPeriod = start && end ? `${start} - ${end}` : start || end || "";
    }

    setFields(updated);

    const aiFlag = AI_FLAG_MAP[field];
    const extra: any = aiFlag ? { [aiFlag]: false } : {};
    onUpdate({ ...updated, ...extra });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = { ...fields, photo: reader.result as string };
      setFields(updated);
      onUpdate({ ...updated, _pendingPhotoFile: file });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    const updated = { ...fields, photo: null };
    setFields(updated);
    onUpdate({ ...updated, _pendingPhotoFile: null });
  };

  // Reusable photo UI
  const photoUpload = (size: string) => (
    fields.photo ? (
      <div className={`relative ${size}`}>
        <img src={fields.photo} alt="Profile" className="aspect-square w-full rounded-lg object-cover" />
        <button
          type="button"
          onClick={removePhoto}
          className="absolute right-1 top-1 rounded-full bg-white p-1 shadow-md transition-colors hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          <svg className="h-3 w-3 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    ) : (
      <label className={`block ${size} cursor-pointer`}>
        <div className="flex aspect-square w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-[#F9FAFB] transition-colors dark:border-slate-600 dark:bg-slate-700">
          <svg className="mb-1 h-6 w-6 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-medium text-gray-400 dark:text-slate-500">Add Picture</span>
        </div>
        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
      </label>
    )
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2 md:mb-6">
        <div className="min-w-0 flex-1 pr-1">
          <h2 className="mb-0.5 text-base font-semibold text-[#1C2D4F] dark:text-slate-100 md:text-2xl md:font-bold">
            Profile Information
          </h2>
          <p className="text-xs text-[#A9B4CD] dark:text-slate-400 md:text-sm">
            This step is optional — you can fill your profile information at any time.
          </p>
        </div>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 rounded-md border border-[#0273B1] bg-white px-2 py-1 text-xs font-semibold leading-none text-[#0273B1] transition-colors hover:bg-[#F0F4F8] dark:border-blue-400 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
          >
            Skip &gt;
          </button>
        )}
      </div>

      {/* AI Autofill Banner */}
      {data._aiAutofilled && (
        <div className="mb-4 flex gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 md:mb-5 md:items-center md:px-4 md:py-3">
          <span className="shrink-0 pt-0.5 text-sm md:pt-0 md:text-base">✨</span>
          <div className="min-w-0 flex-1 space-y-0.5 text-xs leading-snug md:text-sm md:leading-normal">
            <p className="font-semibold text-indigo-800 dark:text-indigo-200">AI autofilled your profile</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 md:text-sm">
              Fields marked with ✨ AI filled were read from your resume. Please review and edit if needed.
            </p>
          </div>
        </div>
      )}

      {/* Mobile: photo centered above fields */}
      <div className="mb-4 flex justify-center lg:hidden">
        {photoUpload("w-28")}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <div className="flex-1 space-y-3 md:space-y-5">
          {/* Name */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#0273B1] md:mb-2">
                First Name {data._aiFilled_firstName && <AIBadge />}
              </label>
              <input
                type="text"
                value={fields.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Your First Name"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 md:px-4 md:py-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#0273B1] md:mb-2">
                Last Name {data._aiFilled_lastName && <AIBadge />}
              </label>
              <input
                type="text"
                value={fields.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Your Last Name"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 md:px-4 md:py-3"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#0273B1] md:mb-2">Gender</label>
            <div className="flex gap-4">
              {["Male", "Female"].map((g) => (
                <label key={g} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={fields.gender === g}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="mr-2"
                    style={{ accentColor: "#0273B1" }}
                  />
                  <span className="text-sm text-[#1C2D4F] dark:text-slate-300">{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#0273B1] md:mb-2">Date of Birth</label>
            <DayMonthYearPicker
              value={fields.dateOfBirth}
              onChange={(val) => handleChange("dateOfBirth", val)}
            />
          </div>

          {/* Nationality */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#0273B1] md:mb-2">Nationality</label>
            <select
              value={fields.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 md:px-4 md:py-3"
            >
              <option value="" disabled>Select Nationality</option>
              {COUNTRY_DATA.map((country) => (
                <option key={country.nationality} value={country.nationality}>{country.nationality}</option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#0273B1] md:mb-2">
              Email {data._aiFilled_email && <AIBadge />}
            </label>
            <input
              type="email"
              value={fields.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="example@gmail.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 md:px-4 md:py-3"
            />
          </div>

          {/* Phone */}
          <div className="min-w-0">
            <label className="mb-1 block text-xs font-medium text-[#0273B1] md:mb-2">
              Phone Number {data._aiFilled_phoneNumber && <AIBadge />}
            </label>
            <div className="flex min-w-0 gap-2">
              <select
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
                size={1}
                className="w-[4.75rem] shrink-0 rounded-lg border border-gray-300 bg-slate-50 px-1.5 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 md:w-[120px] md:px-3 md:py-3"
              >
                {COUNTRY_DATA.filter((c) => c.dialCode !== "").map((country) => (
                  <option key={country.name} value={country.dialCode}>{country.dialCode}</option>
                ))}
              </select>
              <input
                type="tel"
                maxLength={15}
                value={fields.phoneNumber.replace(/^\+\d+\s?/, "")}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^0-9-]/g, "");
                  handleChange("phoneNumber", `${phonePrefix} ${sanitized}`);
                }}
                placeholder="e.g. 08x-xxx-xxxx"
                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 md:px-4 md:py-3"
              />
            </div>
          </div>
        </div>

        {/* Desktop: photo on the right */}
        <div className="hidden lg:ml-auto lg:mr-0 lg:block">
          {photoUpload("w-32")}
        </div>
      </div>

      {/* About You */}
      <div className="mt-6 md:mt-8">
        <label className="mb-1 block text-xs font-medium text-[#0273B1]">
          About You {data._aiFilled_aboutYou && <AIBadge />}
        </label>
        <p className="mb-2 text-xs text-[#A9B4CD] dark:text-slate-500 md:mb-3">
          Add a short description highlighting your background, skills, or interests.
        </p>
        <textarea
          value={fields.aboutYou}
          onChange={(e) => handleChange("aboutYou", e.target.value)}
          placeholder="Write a brief overview of yourself"
          rows={4}
          maxLength={3000}
          className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 md:px-4 md:py-3"
        />
      </div>

      {/* Career Preference */}
      <div className="mt-6 border-t border-gray-200 pt-6 dark:border-slate-700 md:mt-8 md:pt-8">
        <h3 className="mb-3 text-base font-semibold text-[#1C2D4F] dark:text-slate-100 md:mb-6 md:text-xl md:font-bold">
          Career Preference
        </h3>

        <div className="space-y-4 md:space-y-6">
          {/* Positions of Interest */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#0273B1] md:mb-2">
              Position(s) of Interest
            </label>
            <MultiSelectDropdown
              options={POSITION_OPTIONS}
              value={fields.positionsOfInterest}
              onChange={(selected) => handleChange("positionsOfInterest", selected)}
              placeholder="Select positions"
              helperText="One or more (e.g. HR, Accounting)"
            />
          </div>

          {/* Preferred Locations */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#0273B1] md:mb-2">
              Preferred Location(s)
            </label>
            <MultiSelectDropdown
              options={provinces.map((p) => ({
                value: p.id,
                label: p.thname ? `${p.name} (${p.thname})` : p.name,
              }))}
              value={selectedProvinceIds}
              onChange={(selected) => {
                if (selected.length <= 3) {
                  setSelectedProvinceIds(selected);
                  handleChange("preferredLocations", selected);
                }
              }}
              placeholder="Select provinces"
              maxSelections={3}
              helperText="Up to 3 provinces"
            />
          </div>

          {/* Internship Period */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#0273B1] md:mb-2">
              Internship Period
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs mb-1 block text-[#A9B4CD] dark:text-slate-500">Start Date</label>
                <DayMonthYearPicker
                  value={fields.internshipStart}
                  onChange={(val) => handleChange("internshipStart", val)}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block text-[#A9B4CD] dark:text-slate-500">End Date</label>
                <DayMonthYearPicker
                  value={fields.internshipEnd}
                  onChange={(val) => handleChange("internshipEnd", val)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}