"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import EmployerNavbar from "@/components/EmployerNavbar";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  id: string;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  profileImage?: string | null;
  bio?: string | null;
  internshipPeriod?: string | null;
  preferredPositions?: string[];
  preferredLocations?: string[];
  education?: Education[];
  resume?: {
    id?: string;
    name?: string;
    url?: string;
    createdAt?: string;
  } | null;
  projects?: Project[];
  skills?: Skill[];
  certificates?: Certificate[];
  files?: { certificates?: Certificate[]; contactFiles?: any[] };
}

interface Education {
  id: string;
  university?: string; // API field name
  degree?: string; // API field name
  universityName?: string; // alias
  degreeName?: string; // alias
  fieldOfStudy?: string;
  gpa?: string;
  isCurrent?: boolean;
  yearOfStudy?: string;
  transcriptUrl?: string;
}

interface Project {
  id: string;
  name: string;
  role?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  githubUrl?: string;
  projectUrl?: string;
  fileUrl?: string;
  skills?: string[];
  relatedSkills?: string[];
}

interface Skill {
  id: string;
  name: string;
  level?: string;
  rating?: number;
  category?: string;
}

interface Certificate {
  id: string;
  name: string;
  issuedBy?: string;
  issueDate?: string;
  description?: string;
  relatedSkills?: string[];
  tags?: string[];
  url?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatFileUrl(url?: string) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}

// ─── Sub-components (read-only) ───────────────────────────────────────────────

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-2 text-blue-600">
      {icon}
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

function ResumeReadOnly({ resume }: { resume?: ProfileData["resume"] }) {
  const href = formatFileUrl(resume?.url);
  return (
    <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionTitle
        icon={
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        }
        title="Resume File"
      />
      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-5">
        <div className="flex items-center gap-4">
          <div className="relative flex flex-col items-center">
            <svg
              className="h-14 w-12 text-blue-100"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
            </svg>
            <div className="absolute bottom-1 rounded-sm bg-blue-600 px-1 text-[8px] font-bold text-white">
              PDF
            </div>
          </div>
          <div>
            <p className="font-bold text-gray-800">
              {resume?.name || "No resume uploaded"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Upload latest:{" "}
              {resume?.createdAt
                ? new Date(resume.createdAt).toLocaleDateString("en-GB")
                : "-"}
            </p>
          </div>
        </div>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            See File
          </a>
        )}
      </div>
    </div>
  );
}

function EducationReadOnly({ education }: { education?: Education[] }) {
  return (
    <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionTitle
        icon={
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
          </svg>
        }
        title="Education"
      />
      {!education?.length ? (
        <p className="text-center italic text-gray-400">
          No education history.
        </p>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => {
            const transcriptHref = formatFileUrl(edu.transcriptUrl);
            return (
              <div
                key={edu.id}
                className="relative rounded-xl border border-gray-100 bg-white p-5"
              >
                {/* verified badge */}
                <div className="absolute right-5 top-5">
                  {transcriptHref ? (
                    <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Verified by Transcript
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                      Not Verified
                    </span>
                  )}
                </div>
                <div className="pr-40">
                  <h3 className="text-lg font-bold text-gray-900">
                    {edu.universityName}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {edu.degreeName}
                    {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                    {edu.gpa ? ` | GPA: ${edu.gpa}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {edu.isCurrent
                      ? `Year ${edu.yearOfStudy || ""} (Currently studying)`
                      : "Graduated"}
                  </p>
                </div>
                {transcriptHref && (
                  <div className="mt-4 flex justify-end">
                    <a
                      href={transcriptHref}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-gray-300 bg-white px-5 py-1.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                    >
                      See Transcript
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProjectsReadOnly({ projects }: { projects?: Project[] }) {
  return (
    <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionTitle
        icon={
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
        }
        title="Projects"
      />
      {!projects?.length ? (
        <p className="text-center italic text-gray-400">No projects added.</p>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => {
            const hasGithub = !!project.githubUrl;
            const hasLink = !!project.projectUrl;
            const hasFile = !!project.fileUrl;
            const hasAny = hasGithub || hasLink || hasFile;
            const skills = project.skills || project.relatedSkills || [];
            return (
              <div
                key={project.id}
                className="relative rounded-xl border border-gray-100 bg-white p-6"
              >
                {/* badge */}
                <div className="absolute right-5 top-5">
                  <span
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold ${hasAny ? "border-green-200 bg-green-50 text-green-600" : "border-blue-200 bg-blue-50 text-blue-600"}`}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${hasAny ? "bg-green-500" : "bg-blue-500"}`}
                    />
                    {hasAny ? "Fully Upload" : "Not Upload"}
                  </span>
                </div>
                <div className="pr-32">
                  <h3 className="text-lg font-bold text-gray-900">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Role: {project.role || "Contributor"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-2">
                    {project.description || "No description."}
                  </p>
                </div>
                {/* credibility links */}
                <div className="mt-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Upload Files for Credibility
                  </p>
                  <p className="mb-2 text-right text-[11px] text-blue-500">
                    Tip: You can click on the card to view the file or link.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Github Linked",
                        active: hasGithub,
                        url: project.githubUrl,
                        icon: "github",
                      },
                      {
                        label: "Live Demo",
                        active: hasLink,
                        url: project.projectUrl,
                        icon: "link",
                      },
                      {
                        label: "Upload File",
                        active: hasFile,
                        url: project.fileUrl,
                        icon: "file",
                      },
                    ].map(({ label, active, url, icon }) => (
                      <a
                        key={label}
                        href={active && url ? url : undefined}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          if (!active) e.preventDefault();
                        }}
                        className={`flex items-center justify-between rounded-xl border p-3 transition ${active ? "border-gray-200 bg-white shadow-sm" : "border-gray-100 bg-gray-50/50 opacity-60"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-lg p-2 ${active ? "bg-green-50 text-green-600" : "bg-gray-200 text-gray-500"}`}
                          >
                            {icon === "github" && (
                              <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                            )}
                            {icon === "link" && (
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            )}
                            {icon === "file" && (
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`text-xs font-bold ${active ? "text-gray-700" : "text-gray-400"}`}
                          >
                            {label}
                          </span>
                        </div>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? "border-green-500 bg-green-50" : "border-gray-200"}`}
                        >
                          {active && (
                            <svg
                              className="h-3 w-3 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
                {skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SkillsReadOnly({
  skills,
  certificates,
  projects,
}: {
  skills?: Skill[];
  certificates?: Certificate[];
  projects?: Project[];
}) {
  const certSkillNames = new Set(
    (certificates || []).flatMap((c) => c.relatedSkills || c.tags || []),
  );
  const projectSkillNames = new Set(
    (projects || []).flatMap((p) => p.skills || p.relatedSkills || []),
  );
  const technicalSkills = (skills || []).filter(
    (s) =>
      s.category?.toUpperCase() === "TECHNICAL" ||
      s.category === "Technical Skill",
  );
  const businessSkills = (skills || []).filter(
    (s) =>
      s.category?.toUpperCase() === "BUSINESS" ||
      s.category === "Business Skills",
  );

  const SkillItem = ({ skill }: { skill: Skill }) => {
    let pct = 33.33;
    let color = "#68B383";
    if (skill.rating === 2 || skill.level === "Intermediate") {
      pct = 66.66;
      color = "#3B82F6";
    }
    if (skill.rating === 3 || skill.level === "Advanced") {
      pct = 100;
      color = "#8B5CF6";
    }
    const hasCert = certSkillNames.has(skill.name);
    const hasProject = projectSkillNames.has(skill.name);
    return (
      <div className="mb-6 last:mb-0">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-y-1">
          <span className="font-bold text-gray-900">{skill.name}</span>
          <div className="flex items-center gap-2 text-xs">
            {hasCert && hasProject ? (
              <span className="text-[#6B7280]">
                Evidence By Project & Certificate
              </span>
            ) : hasCert ? (
              <span className="text-[#6B7280]">Evidence By Certificate</span>
            ) : hasProject ? (
              <span className="text-[#6B7280]">Evidence By Project</span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Not Verified
              </span>
            )}
          </div>
        </div>
        <div className="relative mb-1 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        <p className="mt-1 text-[12px] font-medium" style={{ color }}>
          Level:{" "}
          {skill.level ||
            (pct <= 33.33
              ? "Beginner"
              : pct <= 66.66
                ? "Intermediate"
                : "Advanced")}
        </p>
      </div>
    );
  };

  return (
    <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionTitle
        icon={
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-5 9h10v2H7z" />
          </svg>
        }
        title="Skills"
      />
      <div className="space-y-4">
        {(["Technical Skills", "Business Skills"] as const).map((label) => {
          const list =
            label === "Technical Skills" ? technicalSkills : businessSkills;
          return (
            <div
              key={label}
              className="rounded-xl border border-gray-100 bg-gray-50/50 p-6"
            >
              <h3 className="mb-6 text-lg font-bold text-gray-800">{label}</h3>
              {list.length > 0 ? (
                list.map((s) => <SkillItem key={s.id} skill={s} />)
              ) : (
                <p className="text-center italic text-sm text-gray-400">
                  No {label.toLowerCase()} added.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CertificatesReadOnly({
  certificates,
}: {
  certificates?: Certificate[];
}) {
  return (
    <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionTitle
        icon={
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        }
        title="Certificates"
      />
      {!certificates?.length ? (
        <p className="text-center italic text-gray-400">
          No certificates added.
        </p>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => {
            const tags = cert.relatedSkills || cert.tags || [];
            return (
              <div
                key={cert.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 transition hover:border-blue-200 hover:shadow-md"
              >
                <h3 className="mb-1 text-lg font-bold text-gray-900">
                  {cert.name}
                </h3>
                <p className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">
                    {cert.issuedBy}
                  </span>
                  {cert.issueDate && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>{formatDate(cert.issueDate)}</span>
                    </>
                  )}
                </p>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  {cert.description || "No description."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {cert.url && (
                  <div className="mt-4 flex justify-end border-t border-gray-50 pt-4">
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border-2 border-blue-600 px-5 py-1.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                    >
                      View File
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployerCandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = params?.candidateId as string;
  const scrollTo = searchParams.get("section"); // 'education' | 'skills' | 'projects' | 'certificates'

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // refs สำหรับ scroll
  const resumeRef = useRef<HTMLDivElement>(null);
  const educationRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const certificatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!candidateId) return;
    apiFetch<{ profile: any }>(`/api/candidates/${candidateId}`)
      .then((data) => {
        const raw = data.profile;
        // ✅ normalize field names ให้ตรงกับ API response
        const normalized: ProfileData = {
          ...raw,
          // education: API ส่ง university (ไม่ใช่ universityName), degree (ไม่ใช่ degreeName)
          education: (raw.education || []).map((edu: any) => ({
            ...edu,
            universityName: edu.university || edu.universityName || "",
            degreeName: edu.degree || edu.degreeName || "",
            isCurrent: edu.isCurrent ?? false, // ✅ เพิ่ม
            yearOfStudy: edu.yearOfStudy || "",
          })),
          // skills: API ส่ง skills[] ตรงๆ (ไม่มี id ใน employer route)
          skills: (raw.skills || []).map((s: any, i: number) => ({
            ...s,
            id: s.id || `skill-${i}`,
            category: s.category || "TECHNICAL",
          })),
          // certificates: API ส่งมาใน files.certificates ไม่ใช่ certificates ตรงๆ
          certificates: raw.files?.certificates || raw.certificates || [],
          // resume: employer route ไม่มี resume — แสดง null
          resume: raw.resume || null,
        };
        setProfile(normalized);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [candidateId]);

  // ✅ scroll ไปที่ section ที่ระบุหลัง load เสร็จ
  useEffect(() => {
    if (!scrollTo || loading) return;
    const refMap: Record<string, React.RefObject<HTMLDivElement>> = {
      education: educationRef,
      projects: projectsRef,
      skills: skillsRef,
      certificates: certificatesRef,
      resume: resumeRef,
    };
    const target = refMap[scrollTo];
    if (target?.current) {
      setTimeout(() => {
        target.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [scrollTo, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployerNavbar />
        <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployerNavbar />
        <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">
          <p className="text-gray-500">Profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6EBF4]">
      <EmployerNavbar />
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile Header */}
        <div className="mb-6 flex items-start gap-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt={profile.fullName || ""}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white">
              {profile.fullName?.substring(0, 2).toUpperCase() || "??"}
            </div>
          )}
          <div className="flex-1 pt-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.fullName}
            </h1>
            {profile.phoneNumber && (
              <p className="mt-1 text-sm text-gray-500">
                Phone: {profile.phoneNumber}
              </p>
            )}
            {profile.email && (
              <p className="mt-0.5 text-sm text-gray-500">
                Email: {profile.email}
              </p>
            )}
            {profile.bio && (
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {profile.bio}
              </p>
            )}
            {(profile.preferredPositions?.length ||
              profile.preferredLocations?.length) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.preferredPositions?.map((p) => (
                  <span
                    key={p}
                    className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
                  >
                    {p}
                  </span>
                ))}
                {profile.preferredLocations?.map((l) => (
                  <span
                    key={l}
                    className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                  >
                    {l}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        <div ref={resumeRef}>
          <ResumeReadOnly resume={profile.resume} />
        </div>
        <div ref={educationRef}>
          <EducationReadOnly education={profile.education} />
        </div>
        <div ref={projectsRef}>
          <ProjectsReadOnly projects={profile.projects} />
        </div>
        <div ref={skillsRef}>
          <SkillsReadOnly
            skills={profile.skills}
            certificates={profile.certificates}
            projects={profile.projects}
          />
        </div>
        <div ref={certificatesRef}>
          <CertificatesReadOnly certificates={profile.certificates} />
        </div>

        {/* Back button */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
