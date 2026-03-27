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

  // Track which AI-filled fields have been edited by the user
  const [userEditedFields, setUserEditedFields] = useState<Set<string>>(new Set());

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

  const handleFieldChange = (edu: EducationData, editedField?: string) => {
    const updated = [edu];
    setEducation(updated);

    // Mark this field as user-edited so the AI badge disappears
    if (editedField) {
      setUserEditedFields((prev) => {
        const next = new Set(prev);
        next.add(editedField);
        return next;
      });
    }

    onUpdate({ education: updated });
  };

  // A field shows the AI badge only if AI filled it AND the user hasn't edited it yet
  const showAiBadge = (field: string) =>
    !!data._aiFilled_education && !userEditedFields.has(field);

  return (
    <div>
      {/* Header — Skip compact, top-right */}
      <div className="mb-3 flex items-start justify-between gap-2 md:mb-6">
        <div className="min-w-0 flex-1 pr-1">
          <h2 className="mb-0.5 text-base font-semibold text-[#1C2D4F] dark:text-slate-100 md:text-2xl md:font-bold">
            Education
          </h2>
          <p className="text-xs text-[#A9B4CD] dark:text-slate-400 md:text-sm">
            This step is optional — you can add education information at any time.
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
      {data._aiFilled_education && (
        <div className="mb-4 flex gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 md:mb-5 md:items-center md:px-4 md:py-3">
          <span className="shrink-0 pt-0.5 text-sm md:pt-0 md:text-base">✨</span>
          <div className="min-w-0 flex-1 space-y-0.5 text-xs leading-snug md:text-sm md:leading-normal">
            <p className="font-semibold text-indigo-800 dark:text-indigo-200">AI autofilled your education</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 md:text-sm">
              Fields marked with ✨ AI filled were read from your resume. Please review and edit if needed.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="rounded-lg border border-gray-200 p-4 dark:border-slate-700 md:p-6">
        <EducationForm
          ref={educationFormRef}
          education={education[0] || null}
          showAiBadgeFor={showAiBadge}
          onFieldChange={handleFieldChange}
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
  /** Returns true if a given field name should show the AI badge */
  showAiBadgeFor: (field: string) => boolean;
  onSave: (edu: EducationData) => void;
  onFieldChange: (edu: EducationData, editedField?: string) => void;
};

const EducationForm = forwardRef<EducationFormHandle, EducationFormProps>(
  function EducationForm({ education, showAiBadgeFor, onSave, onFieldChange }, ref) {
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
      // Pass the edited field name up so the parent can clear its AI badge
      onFieldChange(toPayload(updated), key);
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
      <div className="space-y-3 md:space-y-5">
        {/* Error banner */}
        {Object.values(errors).some(Boolean) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 md:px-4 md:py-3 md:text-sm">
            Please fill in all required fields highlighted in red.
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {/* Education Level */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300 md:mb-2">
              Education Level
            </label>
            <select
              value={fields.educationLevel}
              onChange={(e) => updateField("educationLevel", e.target.value)}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-700 dark:text-slate-200 md:px-4 md:py-3 ${borderClass("educationLevel")}`}
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
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300 md:mb-2">
              Institution Name {showAiBadgeFor("institution") && <AIBadge />}
            </label>
            {universitiesLoading ? (
              <div className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-500 md:px-4 md:py-3">
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
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300 md:mb-2">
              Degree {showAiBadgeFor("degree") && <AIBadge />}
            </label>
            <input
              value={fields.degree}
              onChange={(e) => updateField("degree", e.target.value)}
              placeholder="e.g. Bachelor of Science"
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 md:px-4 md:py-3 ${borderClass("degree")}`}
            />
          </div>

          {/* Field of Study */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300 md:mb-2">
              Field of Study {showAiBadgeFor("fieldOfStudy") && <AIBadge />}
            </label>
            <input
              value={fields.fieldOfStudy}
              onChange={(e) => updateField("fieldOfStudy", e.target.value)}
              placeholder="e.g. Computer Science"
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 md:px-4 md:py-3 ${borderClass("fieldOfStudy")}`}
            />
          </div>

          {/* Year of Study */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300 md:mb-2">
              Year of Study
            </label>
            <select
              value={fields.yearOfStudy}
              onChange={(e) => updateField("yearOfStudy", e.target.value)}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-700 dark:text-slate-200 md:px-4 md:py-3 ${borderClass("yearOfStudy")}`}
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
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300 md:mb-2">
              GPA (Current) {showAiBadgeFor("gpa") && <AIBadge />}
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
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 md:px-4 md:py-3 ${borderClass("gpa")}`}
            />
          </div>
        </div>
      </div>
    );
  }
);