"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import SearchableDropdown from "@/components/SearchableDropdown";

export interface CreateJobPostModalValues {
  jobTitle: string;
  workplaceType: "on-site" | "hybrid" | "remote";
  positionsAvailable: string;
  allowance: string;
  allowancePeriod: "Month" | "Week" | "Day";
  gpa: string;
  positions: string[];
  preferredLocation: string;
  workingDaysHours: string;
  jobDescription: string;
  jobSpecification: string;
}

interface CreateJobPostModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  title?: string;
  submitLabel?: string;
  initialValues?: CreateJobPostModalValues;
  onClose: () => void;
  onSubmit: (values: CreateJobPostModalValues) => Promise<void> | void;
}

const initialValues: CreateJobPostModalValues = {
  jobTitle: "",
  workplaceType: "on-site",
  positionsAvailable: "",
  allowance: "",
  allowancePeriod: "Month",
  gpa: "",
  positions: [],
  preferredLocation: "",
  workingDaysHours: "",
  jobDescription: "",
  jobSpecification: "",
};

// Common positions list
const POSITION_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "Data Scientist",
  "Data Analyst",
  "AI Developer",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Business Analyst",
  "Marketing Intern",
  "HR Intern",
  "Finance Intern",
  "Accounting Intern",
  "Graphic Designer",
  "Content Writer",
  "Digital Marketing",
  "Sales Intern",
];

export default function CreateJobPostModal({
  isOpen,
  isSubmitting,
  title = "Create Job Post",
  submitLabel = "Create Job Post",
  initialValues: initialFormValues,
  onClose,
  onSubmit,
}: CreateJobPostModalProps) {
  const [values, setValues] = useState<CreateJobPostModalValues>(initialValues);
  const [provinces, setProvinces] = useState<
    Array<{ id: string; name: string; thname: string | null }>
  >([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [showPositionsDropdown, setShowPositionsDropdown] = useState(false);
  const positionsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValues({
        ...initialValues,
        ...(initialFormValues ?? {}),
        positions: initialFormValues?.positions ?? [],
      });
      loadProvinces();
    }
  }, [initialFormValues, isOpen]);

  // Close positions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        positionsDropdownRef.current &&
        !positionsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPositionsDropdown(false);
      }
    }

    if (showPositionsDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPositionsDropdown]);

  const loadProvinces = async () => {
    setProvincesLoading(true);
    try {
      const response = await apiFetch<{
        provinces: Array<{
          id: string;
          name: string;
          thname: string | null;
          code: string | null;
        }>;
      }>("/api/addresses/provinces");
      setProvinces(response.provinces || []);
    } catch (err) {
      console.error("Failed to load provinces:", err);
      setProvinces([]);
    } finally {
      setProvincesLoading(false);
    }
  };

  const togglePosition = (position: string) => {
    setValues((prev) => ({
      ...prev,
      positions: prev.positions.includes(position)
        ? prev.positions.filter((p) => p !== position)
        : [...prev.positions, position],
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-[780px] flex-col rounded-[16px] bg-white px-6 pb-6 pt-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)] transition-colors dark:bg-slate-950 dark:shadow-none dark:ring-1 dark:ring-slate-800"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-[22px] font-bold leading-none text-[#111827] dark:text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close create job post modal"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 6l12 12M18 6 6 18"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit(values);
          }}
          className="flex-1 space-y-4 overflow-y-auto pr-1"
        >
          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#111827] dark:text-slate-200">
              Job Title
            </label>
            <input
              type="text"
              value={values.jobTitle}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, jobTitle: event.target.value }))
              }
              placeholder="e.g. Frontend Developer Intern"
              className="h-[42px] w-full rounded-[8px] border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#111827] dark:text-slate-200">
              Internship format
            </label>
            <div className="grid grid-cols-3 overflow-hidden rounded-[8px] border border-[#A3A3A3] dark:border-slate-700">
              {(
                [
                  ["on-site", "On-site"],
                  ["hybrid", "Hybrid"],
                  ["remote", "Remote"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValues((prev) => ({
                      ...prev,
                      workplaceType: value,
                    }))
                  }
                  className={`h-[42px] border-r border-[#A3A3A3] text-[13px] font-medium transition last:border-r-0 ${
                    values.workplaceType === value
                      ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-500/10 dark:text-blue-400"
                      : "bg-white text-[#404040] dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#111827] dark:text-slate-200">
              Number of applicants
            </label>
            <input
              type="number"
              min="0"
              value={values.positionsAvailable}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  positionsAvailable: event.target.value,
                }))
              }
              placeholder="Enter number of available positions"
              className="h-[42px] w-full rounded-[8px] border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#111827] dark:text-slate-200">
              Allowance
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={values.allowance}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      allowance: event.target.value,
                    }))
                  }
                  placeholder="Example: 5,000"
                  className="h-[42px] w-full rounded-[8px] border border-[#A3A3A3] bg-white px-3 pr-9 text-[13px] text-[#111827] outline-none placeholder:text-[#8A8A8A] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#404040] dark:text-slate-300">
                  ฿
                </span>
              </div>
              <span className="text-[20px] leading-none text-[#111827] dark:text-slate-200">/</span>
              <div className="w-[110px]">
                <select
                  value={values.allowancePeriod}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      allowancePeriod: event.target
                        .value as CreateJobPostModalValues["allowancePeriod"],
                    }))
                  }
                  className="h-[42px] w-full appearance-none rounded-[8px] border border-[#A3A3A3] bg-white px-3 text-[13px] text-[#404040] outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="Month">Month</option>
                  <option value="Week">Week</option>
                  <option value="Day">Day</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#111827] dark:text-slate-200">
              Job description
            </label>
            <textarea
              value={values.jobDescription}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  jobDescription: event.target.value,
                }))
              }
              placeholder="Describe responsibilities, tasks, and project scope"
              className="min-h-[160px] w-full resize-y rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#111827] dark:text-slate-200">
              Applicant qualifications
            </label>
            <textarea
              value={values.jobSpecification}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  jobSpecification: event.target.value,
                }))
              }
              placeholder="List required skills, education, or experience"
              className="min-h-[160px] w-full resize-y rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#111827] dark:text-slate-200">
              GPA
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={values.gpa}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, gpa: event.target.value }))
              }
              placeholder="Enter minimum GPA (e.g. 2.75)"
              className="h-[42px] w-full rounded-[8px] border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#111827] dark:text-slate-200">
              Positions
            </label>
            <div className="relative" ref={positionsDropdownRef}>
              <button
                type="button"
                onClick={() => setShowPositionsDropdown(!showPositionsDropdown)}
                className="flex h-[42px] w-full items-center justify-between rounded-[8px] border border-[#CBD5E1] bg-white px-3 text-left text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              >
                <span
                  className={
                    values.positions.length > 0
                      ? "text-[#111827] dark:text-slate-100"
                      : "text-[#9CA3AF] dark:text-slate-500"
                  }
                >
                  {values.positions.length > 0
                    ? `${values.positions.length} position${values.positions.length > 1 ? "s" : ""} selected`
                    : "Select one or more positions"}
                </span>
                <svg
                  className={`h-4 w-4 text-[#6B7280] transition-transform dark:text-slate-400 ${showPositionsDropdown ? "rotate-180" : ""}`}
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
              </button>
              {showPositionsDropdown && (
                <div className="absolute z-10 mt-1 max-h-[200px] w-full overflow-y-auto rounded-[8px] border border-[#CBD5E1] bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  {POSITION_OPTIONS.map((position) => (
                    <label
                      key={position}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-[#111827] hover:bg-[#F3F4F6] dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={values.positions.includes(position)}
                        onChange={() => togglePosition(position)}
                        className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB] dark:border-slate-700"
                      />
                      <span>{position}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {values.positions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {values.positions.map((position) => (
                  <span
                    key={position}
                    className="inline-flex items-center gap-1 rounded-[6px] bg-[#EFF6FF] px-2 py-1 text-[12px] text-[#2563EB] dark:bg-blue-500/10 dark:text-blue-400"
                  >
                    {position}
                    <button
                      type="button"
                      onClick={() => togglePosition(position)}
                      className="hover:text-[#1D4ED8] dark:hover:text-blue-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#111827] dark:text-slate-200">
              Preferred Location
            </label>
            {provincesLoading ? (
              <div className="flex h-[42px] w-full items-center justify-center rounded-[8px] border border-[#CBD5E1] bg-gray-50 dark:border-slate-700 dark:bg-slate-900">
                <span className="text-[13px] text-[#9CA3AF] dark:text-slate-500">
                  Loading locations...
                </span>
              </div>
            ) : (
              <SearchableDropdown
                options={provinces.map((prov) => ({
                  value: prov.id,
                  label: prov.thname
                    ? `${prov.name} (${prov.thname})`
                    : prov.name,
                }))}
                value={values.preferredLocation}
                onChange={(value) =>
                  setValues((prev) => ({ ...prev, preferredLocation: value }))
                }
                placeholder="Select preferred work location"
                className="w-full"
                allOptionLabel="Select Location"
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[14px] font-semibold text-[#111827] dark:text-slate-200">
              Working Days & Hours
            </label>
            <input
              type="text"
              value={values.workingDaysHours}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  workingDaysHours: event.target.value,
                }))
              }
              placeholder="e.g. Monday–Friday, 9:00 AM – 5:00 PM"
              className="h-[42px] w-full rounded-[8px] border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#94A3B8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
            className="flex h-[38px] items-center justify-center rounded-[10px] border border-[#D1D5DB] bg-white px-5 text-[13px] font-semibold text-[#374151] transition hover:bg-[#F9FAFB] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-[38px] items-center justify-center rounded-[10px] bg-[#2563EB] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}