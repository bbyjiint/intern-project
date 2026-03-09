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

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface EducationData {
  educationLevel?: string;
  university?: string;
  degree?: string;
  fieldOfStudy?: string;
  yearOfStudy?: string;
  startYear?: string;
  endYear?: string | null;
  gpa?: string | number | null;
  isCurrent?: boolean;
}

interface Step2Props {
  data: { education?: EducationData[] };
  onUpdate: (data: any) => void;
  onSkip?: () => void;
  onValidate?: (fn: () => boolean | Promise<boolean>) => void;
}

interface EducationFormHandle {
  validate: () => boolean;
  submit: () => Promise<boolean>;
}

// ─────────────────────────────────────────────
// Step2BackgroundExperience
// ─────────────────────────────────────────────

export default function Step2BackgroundExperience({
  data,
  onUpdate,
  onSkip,
  onValidate,
}: Step2Props) {
  const [education, setEducation] = useState<EducationData[]>(
    data.education || [],
  );

  // Sync when parent data changes (e.g. after loadProfile)
  useEffect(() => {
    setEducation(data.education || []);
  }, [data.education]);

  const educationFormRef = useRef<EducationFormHandle>(null);

  // Register validator with parent — re-register whenever ref changes
  useEffect(() => {
    if (!onValidate) return;

    onValidate(async () => {
      if (!educationFormRef.current) return true;

      const isFormEmpty = checkFormIsEmpty();
      // If form is completely empty, skip validation (step is optional)
      if (isFormEmpty) return true;

      const valid = educationFormRef.current.validate();
      if (!valid) return false;

      return await educationFormRef.current.submit();
    });
  }, [onValidate]);

  // Check if the education form has any data filled in
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
          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: "#1C2D4F", fontWeight: 700 }}
          >
            Education
          </h2>
          <p className="text-sm" style={{ color: "#A9B4CD" }}>
            This step is optional — you can add education information at any
            time.
          </p>
        </div>

        {onSkip && (
          <button
            onClick={onSkip}
            className="flex items-center px-4 py-2 rounded-lg font-medium text-sm"
            style={{
              border: "2px solid #0273B1",
              color: "#0273B1",
              backgroundColor: "white",
            }}
          >
            Skip &gt;
          </button>
        )}
      </div>

      {/* Form */}
      <div className="border border-gray-200 rounded-lg p-6">
        <EducationForm
          ref={educationFormRef}
          education={education[0] || null}
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

// ─────────────────────────────────────────────
// EducationForm
// ─────────────────────────────────────────────

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
    onSave: (edu: EducationData) => void;
    onFieldChange: (edu: EducationData) => void;
  }
>(function EducationForm({ education, onSave, onFieldChange }, ref) {
  const [fields, setFields] = useState({
    educationLevel: education?.educationLevel || "",
    institution: education?.university || "",
    degree: education?.degree || "",
    fieldOfStudy: education?.fieldOfStudy || "",
    yearOfStudy: education?.yearOfStudy || education?.startYear || "",
    gpa: education?.gpa != null ? String(education.gpa) : "",
    isCurrent: education?.isCurrent || false,
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [universities, setUniversities] = useState<
    { name: string; thname?: string }[]
  >([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);

  // Sync fields when education prop changes (e.g. after loadProfile)
  useEffect(() => {
    if (!education) return;
    setFields({
      educationLevel: education.educationLevel || "",
      institution: education.university || "",
      degree: education.degree || "",
      fieldOfStudy: education.fieldOfStudy || "",
      yearOfStudy: education.yearOfStudy || education.startYear || "",
      gpa: education.gpa != null ? String(education.gpa) : "",
      isCurrent: education.isCurrent || false,
    });
  }, [education]);

  // Load universities list once
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

    // Clear error on change
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));

    // Notify parent of live changes
    onFieldChange(toPayload(updated));
  };

  const toPayload = (f: typeof fields): EducationData => ({
    educationLevel: f.educationLevel,
    university: f.institution,
    degree: f.degree,
    fieldOfStudy: f.fieldOfStudy,
    yearOfStudy: f.yearOfStudy,
    startYear: f.yearOfStudy,
    endYear: f.isCurrent ? null : new Date().getFullYear().toString(),
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
      : "border-gray-300";

  return (
    <div className="space-y-5">
      {/* Error banner */}
      {Object.values(errors).some(Boolean) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Please fill in all required fields highlighted in red.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Education Level */}
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-700">
            Education Level
          </label>
          <select
            value={fields.educationLevel}
            onChange={(e) => updateField("educationLevel", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 ${borderClass("educationLevel")}`}
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
          <label className="block text-xs font-medium mb-2 text-gray-700">
            Institution Name
          </label>
          {universitiesLoading ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-400">
              Loading...
            </div>
          ) : (
            <div className={errors.institution ? "rounded-lg ring-1 ring-red-500" : ""}>
              <SearchableDropdown
                options={universities.map((uni) => ({
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
          <label className="block text-xs font-medium mb-2 text-gray-700">
            Degree
          </label>
          <input
            value={fields.degree}
            onChange={(e) => updateField("degree", e.target.value)}
            placeholder="e.g. Bachelor of Science"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${borderClass("degree")}`}
          />
        </div>

        {/* Field of Study */}
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-700">
            Field of Study
          </label>
          <input
            value={fields.fieldOfStudy}
            onChange={(e) => updateField("fieldOfStudy", e.target.value)}
            placeholder="e.g. Computer Science"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${borderClass("fieldOfStudy")}`}
          />
        </div>

        {/* Year of Study */}
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-700">
            Year of Study
          </label>
          <select
            value={fields.yearOfStudy}
            onChange={(e) => updateField("yearOfStudy", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 ${borderClass("yearOfStudy")}`}
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
          <label className="block text-xs font-medium mb-2 text-gray-700">
            GPA (Current)
          </label>
          <input
            value={fields.gpa}
            onChange={(e) => updateField("gpa", e.target.value)}
            placeholder="e.g. 3.50"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${borderClass("gpa")}`}
          />
        </div>
      </div>
    </div>
  );
});