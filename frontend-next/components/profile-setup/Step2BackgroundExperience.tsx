"use client";

import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import SearchableDropdown from "@/components/SearchableDropdown";
import { apiFetch } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface EducationData {
  educationLevel?: string;
  university?: string;
  degree?: string;
  fieldOfStudy?: string;
  yearOfStudy?: string;
  gpa?: string | number | null;
  isCurrent?: boolean;
}

interface Step2Props {
  data: { education?: EducationData[]; _aiFilled_education?: boolean };
  onUpdate: (data: any) => void;
  onSkip?: () => void;
  onValidate?: (fn: () => boolean | Promise<boolean>) => void;
}

interface EducationFormHandle {
  validate: () => boolean;
  submit: () => Promise<boolean>;
}

// ─────────────────────────────────────────────────────────────────────────────
// AIBadge
// ─────────────────────────────────────────────────────────────────────────────

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ml-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
      ✨ AI filled
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step2BackgroundExperience
// ─────────────────────────────────────────────────────────────────────────────

export default function Step2BackgroundExperience({
  data,
  onUpdate,
  onSkip,
  onValidate,
}: Step2Props) {
  const [education, setEducation] = useState<EducationData[]>(
    data.education || [],
  );

  useEffect(() => {
    setEducation(data.education || []);
  }, [data.education]);

  const educationFormRef = useRef<EducationFormHandle>(null);

  useEffect(() => {
    if (!onValidate) return;

    onValidate(async () => {
      if (!educationFormRef.current) return true;

      const isFormEmpty = checkFormIsEmpty();
      if (isFormEmpty) return true;

      const valid = educationFormRef.current.validate();
      if (!valid) return false;

      return await educationFormRef.current.submit();
    });
  }, [onValidate]);

  const checkFormIsEmpty = () => {
    const edu = education[0];
    if (!edu) return true;
    return (
      !edu.university &&
      !edu.degree &&
      !edu.fieldOfStudy &&
      !edu.educationLevel
    );
  };

  const handleSave = (edu: EducationData) => {
    const updated = [edu];
    setEducation(updated);
    onUpdate({ education: updated });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1 text-[#1C2D4F] dark:text-slate-100">
            Education
          </h2>
          <p className="text-sm text-[#A9B4CD] dark:text-slate-400">
            This step is optional — you can add education information at any time.
          </p>
        </div>

        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors border-2 border-[#0273B1] text-[#0273B1] bg-white dark:bg-slate-700 dark:text-blue-400 dark:border-blue-400 hover:bg-[#F0F4F8] dark:hover:bg-slate-600"
          >
            Skip &gt;
          </button>
        )}
      </div>

      {/* AI Autofill Banner */}
      {data._aiFilled_education && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-5 text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
          <span className="text-base">✨</span>
          <span className="font-semibold">AI autofilled your education</span>
          <span className="text-indigo-500 dark:text-indigo-400">
            — Fields marked with ✨ AI filled were read from your resume. Please review and edit if needed.
          </span>
        </div>
      )}

      {/* Form */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <EducationForm
          ref={educationFormRef}
          education={education[0] || null}
          isAiFilled={!!data._aiFilled_education}
          onFieldChange={(edu: EducationData) => {
            const updated = [edu];
            setEducation(updated);
            onUpdate({ education: updated });
          }}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EducationForm
// ─────────────────────────────────────────────────────────────────────────────

const EDUCATION_LEVELS = [
  "Below High School",
  "High School / Vocational Certificate",
  "Higher Vocational Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctoral Degree (PhD)",
];
const YEAR_OF_STUDY_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Graduate",
];

type EducationFormProps = {
  education: EducationData | null;
  isAiFilled?: boolean;
  onSave: (edu: EducationData) => void;
  onFieldChange: (edu: EducationData) => void;
};

const EducationForm = forwardRef<EducationFormHandle, EducationFormProps>(
  function EducationForm({ education, isAiFilled, onSave, onFieldChange }, ref) {
    const [fields, setFields] = useState({
      educationLevel: education?.educationLevel || "",
      institution: education?.university || "",
      degree: education?.degree || "",
      fieldOfStudy: education?.fieldOfStudy || "",
      yearOfStudy: education?.yearOfStudy || "",
      gpa: education?.gpa != null ? String(education.gpa) : "",
      isCurrent: education?.isCurrent || false,
    });

    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [universities, setUniversities] = useState<{ name: string; thname?: string }[]>([]);
    const [universitiesLoading, setUniversitiesLoading] = useState(false);

    useEffect(() => {
      if (!education) return;
      setFields({
        educationLevel: education.educationLevel || "",
        institution: education.university || "",
        degree: education.degree || "",
        fieldOfStudy: education.fieldOfStudy || "",
        yearOfStudy: education.yearOfStudy || "",
        gpa: education.gpa != null ? String(education.gpa) : "",
        isCurrent: education.isCurrent || false,
      });
    }, [education]);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        setUniversitiesLoading(true);
        try {
          const data = await apiFetch<{ universities: any[] }>("/api/universities");
          if (!cancelled) setUniversities(data.universities || []);
        } catch {
          if (!cancelled) setUniversities([]);
        } finally {
          if (!cancelled) setUniversitiesLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, []);

    const updateField = (key: string, value: any) => {
      const updated = { ...fields, [key]: value };
      setFields(updated);
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));
      onFieldChange(toPayload(updated));
    };

    const toPayload = (f: typeof fields): EducationData => ({
      educationLevel: f.educationLevel,
      university: f.institution,
      degree: f.degree,
      fieldOfStudy: f.fieldOfStudy,
      yearOfStudy: f.yearOfStudy,
      gpa: f.gpa,
      isCurrent: f.isCurrent,
    });

    const validate = (): boolean => {
      const newErrors: Record<string, boolean> = {};
      if (!fields.educationLevel) newErrors.educationLevel = true;
      if (!fields.institution) newErrors.institution = true;
      if (!fields.degree) newErrors.degree = true;
      if (!fields.fieldOfStudy) newErrors.fieldOfStudy = true;
      if (!fields.yearOfStudy) newErrors.yearOfStudy = true;
      if (!fields.gpa) newErrors.gpa = true;
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    useImperativeHandle(ref, () => ({
      validate,
      submit: async () => {
        if (!validate()) return false;
        onSave(toPayload(fields));
        return true;
      },
    }));

    const borderClass = (key: string) =>
      errors[key]
        ? "border-red-500 ring-1 ring-red-400"
        : "border-gray-300 dark:border-slate-600";

    return (
      <div className="space-y-5">
        {/* Error banner */}
        {Object.values(errors).some(Boolean) && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            Please fill in all required fields highlighted in red.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Education Level */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-slate-300">
              Education Level
            </label>
            <select
              value={fields.educationLevel}
              onChange={(e) => updateField("educationLevel", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${borderClass("educationLevel")}`}
            >
              <option value="">Select education level</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Institution Name */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-slate-300">
              Institution Name {isAiFilled && <AIBadge />}
            </label>
            {universitiesLoading ? (
              <div className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-700">
                Loading...
              </div>
            ) : (
              <div className={errors.institution ? "rounded-lg ring-1 ring-red-500" : ""}>
                <SearchableDropdown
                  options={universities.map((uni: { name: string; thname?: string }) => ({
                    value: uni.name,
                    label: uni.thname ? `${uni.name} (${uni.thname})` : uni.name,
                  }))}
                  value={fields.institution}
                  onChange={(value) => updateField("institution", value)}
                  placeholder="Select Institution"
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Degree */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-slate-300">
              Degree {isAiFilled && <AIBadge />}
            </label>
            <input
              value={fields.degree}
              onChange={(e) => updateField("degree", e.target.value)}
              placeholder="e.g. Bachelor of Science"
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${borderClass("degree")}`}
            />
          </div>

          {/* Field of Study */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-slate-300">
              Field of Study {isAiFilled && <AIBadge />}
            </label>
            <input
              value={fields.fieldOfStudy}
              onChange={(e) => updateField("fieldOfStudy", e.target.value)}
              placeholder="e.g. Computer Science"
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${borderClass("fieldOfStudy")}`}
            />
          </div>

          {/* Year of Study */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-slate-300">
              Year of Study
            </label>
            <select
              value={fields.yearOfStudy}
              onChange={(e) => updateField("yearOfStudy", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${borderClass("yearOfStudy")}`}
            >
              <option value="">Select year of study</option>
              {YEAR_OF_STUDY_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* GPA */}
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-slate-300">
              GPA (Current) {isAiFilled && <AIBadge />}
            </label>
            <input
              value={fields.gpa}
              onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                    if (Number(val) > 4.0) return;
                    updateField("gpa", e.target.value);
                  }
                }}
              placeholder="e.g. 3.50"
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${borderClass("gpa")}`}
            />
          </div>
        </div>
      </div>
    );
  }
);