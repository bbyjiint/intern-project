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
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ml-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-tight">
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Education
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            This step is optional — you can add education information at any time.
          </p>
        </div>

        {onSkip && (
          <button
            onClick={onSkip}
            className="px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-sky-600 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all active:scale-95 bg-white dark:bg-transparent"
          >
            Skip &gt;
          </button>
        )}
      </div>

      {/* AI Autofill Banner */}
      {data._aiFilled_education && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-8 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-sm animate-in fade-in slide-in-from-top-2">
          <span className="text-xl">✨</span>
          <div>
            <span className="font-bold text-indigo-900 dark:text-indigo-200">AI autofilled your education</span>
            <p className="text-indigo-700 dark:text-indigo-300/80">Fields marked with AI badge were read from your resume.</p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
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

const EDUCATION_LEVELS = ["Bachelor", "Master", "PhD"];
const YEAR_OF_STUDY_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Graduate",
];

const EducationForm = forwardRef<
  EducationFormHandle,
  {
    education: EducationData | null;
    isAiFilled?: boolean;
    onSave: (edu: EducationData) => void;
    onFieldChange: (edu: EducationData) => void;
  }
>(function EducationForm({ education, isAiFilled, onSave, onFieldChange }, ref) {
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
  const [universities, setUniversities] = useState<
    { name: string; thname?: string }[]
  >([]);
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

  const inputClasses = (key: string) => `
    w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-900 
    text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all
    ${errors[key] 
      ? "border-red-500 ring-1 ring-red-400 dark:ring-red-900/50" 
      : "border-slate-300 dark:border-slate-700"}
  `;

  const labelClasses = "block text-sm font-bold mb-2 text-sky-700 dark:text-sky-400 uppercase tracking-wide";

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {Object.values(errors).some(Boolean) && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Please fill in all required fields.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education Level */}
        <div>
          <label className={labelClasses}>
            Education Level
          </label>
          <select
            value={fields.educationLevel}
            onChange={(e) => updateField("educationLevel", e.target.value)}
            className={inputClasses("educationLevel")}
          >
            <option value="">Select level</option>
            {EDUCATION_LEVELS.map((level) => (
              <option key={level} value={level} className="dark:bg-slate-900">
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Institution Name */}
        <div>
          <label className={labelClasses}>
            Institution Name {isAiFilled && <AIBadge />}
          </label>
          {universitiesLoading ? (
            <div className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm text-slate-400 animate-pulse">
              Loading Universities...
            </div>
          ) : (
            <div className="relative">
              <SearchableDropdown
                options={universities.map((uni) => ({
                  value: uni.name,
                  label: uni.thname ? `${uni.name} (${uni.thname})` : uni.name,
                }))}
                value={fields.institution}
                onChange={(value) => updateField("institution", value)}
                placeholder="Search university..."
                className={errors.institution ? "ring-2 ring-red-500 rounded-xl" : ""}
              />
            </div>
          )}
        </div>

        {/* Degree */}
        <div>
          <label className={labelClasses}>
            Degree {isAiFilled && <AIBadge />}
          </label>
          <input
            value={fields.degree}
            onChange={(e) => updateField("degree", e.target.value)}
            placeholder="e.g. Bachelor of Science"
            className={inputClasses("degree")}
          />
        </div>

        {/* Field of Study */}
        <div>
          <label className={labelClasses}>
            Field of Study {isAiFilled && <AIBadge />}
          </label>
          <input
            value={fields.fieldOfStudy}
            onChange={(e) => updateField("fieldOfStudy", e.target.value)}
            placeholder="e.g. Computer Science"
            className={inputClasses("fieldOfStudy")}
          />
        </div>

        {/* Year of Study */}
        <div>
          <label className={labelClasses}>
            Year of Study
          </label>
          <select
            value={fields.yearOfStudy}
            onChange={(e) => updateField("yearOfStudy", e.target.value)}
            className={inputClasses("yearOfStudy")}
          >
            <option value="">Select year</option>
            {YEAR_OF_STUDY_OPTIONS.map((year) => (
              <option key={year} value={year} className="dark:bg-slate-900">
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* GPA */}
        <div>
          <label className={labelClasses}>
            GPA (Current) {isAiFilled && <AIBadge />}
          </label>
          <input
            value={fields.gpa}
            onChange={(e) => updateField("gpa", e.target.value)}
            placeholder="e.g. 3.50"
            className={inputClasses("gpa")}
          />
        </div>
      </div>
    </div>
  );
});