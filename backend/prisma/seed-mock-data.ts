import { randomUUID } from "crypto";
import {
  AllowancePeriod,
  ApplicationStatus,
  AuthProvider,
  CandidateFileType,
  JobPostState,
  SkillCategory,
  UserRole,
  WorkplaceType,
} from "@prisma/client";
import prisma from "../src/utils/prisma.js";
import { hashPassword } from "../src/utils/password.js";

type AddressRecord = {
  provinceId: string | null;
  provinceName: string | null;
  districtId: string | null;
  districtName: string | null;
  subdistrictId: string | null;
  subdistrictName: string | null;
  postcode: string | null;
};

type SeedJob = {
  key: string;
  title: string;
  jobType: string;
  positionsAvailable: number;
  gpa: string;
  workplaceType: WorkplaceType;
  allowance: number | null;
  allowancePeriod: AllowancePeriod | null;
  noAllowance: boolean;
  state: JobPostState;
  jobPostStatus: "URGENT" | "NOT_URGENT";
  description: string;
  specification: string;
};

type SeedCompany = {
  email: string;
  companyName: string;
  businessType: string;
  companySize: string;
  websiteUrl: string;
  recruiterName: string;
  about: string;
  addressDetails: string;
  phones: string[];
  jobs: SeedJob[];
};

type SeedCandidate = {
  email: string;
  fullName: string;
  desiredPosition: string;
  phoneNumber: string;
  bio: string;
  description: string;
  gender: string;
  nationality: string;
  internshipPeriod: string;
  profileImage?: string | null;
  education: {
    degreeName: string;
    educationLevel: string;
    fieldOfStudy: string;
    yearOfStudy: string;
    gpa: number;
    isCurrent: boolean;
    universityIndex: number;
  };
  skills: Array<{ name: string; category: SkillCategory; rating: number }>;
  workHistory: Array<{
    companyName: string;
    position: string;
    startDate: string;
    endDate: string | null;
    description: string;
  }>;
  projects: Array<{
    name: string;
    role: string;
    description: string;
    startDate: string;
    endDate: string;
    relatedSkills: string[];
    githubUrl?: string;
    projectUrl?: string;
    fileUrl?: string;
    fileName?: string;
  }>;
  certificates: Array<{
    name: string;
    issuedBy: string;
    issueDate: string;
    relatedSkills: string[];
    description: string;
    url: string;
  }>;
  preferredProvinceIndexes: number[];
};

const defaultPasswordPlain = "password123";

const businessSkillNames = new Set([
  "UI Design",
  "UX Research",
  "Financial Analysis",
  "Excel",
  "Data Analysis",
  "SEO",
  "Content Strategy",
  "Social Media Marketing",
]);

function getSkillCategory(name: string): SkillCategory {
  return businessSkillNames.has(name)
    ? SkillCategory.BUSINESS
    : SkillCategory.TECHNICAL;
}

const skillNames = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "SQL",
  "PostgreSQL",
  "Docker",
  "Figma",
  "UI Design",
  "UX Research",
  "Excel",
  "Data Analysis",
  "Machine Learning",
  "Financial Analysis",
  "Content Strategy",
  "SEO",
  "Social Media Marketing",
];

const companies: SeedCompany[] = [
  {
    email: "seed.trinity@intern-project.local",
    companyName: "Trinity Securities Mock",
    businessType: "private",
    companySize: "201-500",
    websiteUrl: "https://trinity-mock.example.com",
    recruiterName: "Nina Supakit",
    about:
      "Seeded employer account for testing company profile, job posts, applicants, bookmarks, and messaging.",
    addressDetails: "90 North Sathorn Road, Silom",
    phones: ["+66-2-100-1001", "+66-81-100-1001"],
    jobs: [
      {
        key: "trinity-software",
        title: "Software Engineering Intern",
        jobType: "Software Engineer",
        positionsAvailable: 2,
        gpa: "3.00",
        workplaceType: WorkplaceType.HYBRID,
        allowance: 18000,
        allowancePeriod: AllowancePeriod.MONTH,
        noAllowance: false,
        state: JobPostState.PUBLISHED,
        jobPostStatus: "URGENT",
        description:
          "Build internal tools, improve recruiter dashboards, and collaborate on backend APIs.",
        specification:
          "React or Next.js basics\nNode.js basics\nAble to work with Git\nStrong communication skills",
      },
      {
        key: "trinity-data",
        title: "Data Analyst Intern",
        jobType: "Data Analyst",
        positionsAvailable: 1,
        gpa: "3.20",
        workplaceType: WorkplaceType.ON_SITE,
        allowance: 15000,
        allowancePeriod: AllowancePeriod.MONTH,
        noAllowance: false,
        state: JobPostState.CLOSED,
        jobPostStatus: "NOT_URGENT",
        description:
          "Support reporting, SQL analysis, and dashboard preparation for investment operations.",
        specification:
          "SQL\nExcel\nAttention to detail\nInterest in finance",
      },
    ],
  },
  {
    email: "seed.tech@intern-project.local",
    companyName: "TechVerse Labs",
    businessType: "private",
    companySize: "51-200",
    websiteUrl: "https://techverse.example.com",
    recruiterName: "Ploy Rattanasiri",
    about:
      "Seeded software company for testing live job listings, candidate search, and company workflows.",
    addressDetails: "12 Sukhumvit 55 Road, Khlong Tan Nuea",
    phones: ["+66-2-200-2002"],
    jobs: [
      {
        key: "techverse-frontend",
        title: "Frontend Developer Intern",
        jobType: "Frontend Developer",
        positionsAvailable: 3,
        gpa: "3.00",
        workplaceType: WorkplaceType.REMOTE,
        allowance: 20000,
        allowancePeriod: AllowancePeriod.MONTH,
        noAllowance: false,
        state: JobPostState.PUBLISHED,
        jobPostStatus: "URGENT",
        description:
          "Build user-facing features in Next.js, integrate APIs, and improve frontend performance.",
        specification:
          "JavaScript or TypeScript\nReact or Next.js\nHTML/CSS\nBasic API integration",
      },
      {
        key: "techverse-ux",
        title: "UX/UI Design Intern",
        jobType: "UX/UI Design Intern",
        positionsAvailable: 2,
        gpa: "2.80",
        workplaceType: WorkplaceType.HYBRID,
        allowance: 12000,
        allowancePeriod: AllowancePeriod.MONTH,
        noAllowance: false,
        state: JobPostState.PUBLISHED,
        jobPostStatus: "NOT_URGENT",
        description:
          "Create wireframes, improve user flows, and maintain product design consistency.",
        specification:
          "Figma\nUI fundamentals\nUX research basics\nPortfolio preferred",
      },
    ],
  },
  {
    email: "seed.finance@intern-project.local",
    companyName: "FinanceHub Advisory",
    businessType: "private",
    companySize: "10-50",
    websiteUrl: "https://financehub.example.com",
    recruiterName: "Korn Chaiyasit",
    about:
      "Seeded finance company to help test filters, applications, and employer messaging.",
    addressDetails: "88 Wireless Road, Lumphini",
    phones: ["+66-2-300-3003"],
    jobs: [
      {
        key: "financehub-analyst",
        title: "Financial Analyst Intern",
        jobType: "Financial Analyst",
        positionsAvailable: 2,
        gpa: "3.25",
        workplaceType: WorkplaceType.ON_SITE,
        allowance: 22000,
        allowancePeriod: AllowancePeriod.MONTH,
        noAllowance: false,
        state: JobPostState.PUBLISHED,
        jobPostStatus: "URGENT",
        description:
          "Assist with market research, valuation spreadsheets, and management reports.",
        specification:
          "Finance or economics background\nExcel\nAnalytical thinking\nPresentation skills",
      },
      {
        key: "financehub-marketing",
        title: "Marketing Intern",
        jobType: "Marketing",
        positionsAvailable: 1,
        gpa: "2.75",
        workplaceType: WorkplaceType.HYBRID,
        allowance: null,
        allowancePeriod: null,
        noAllowance: true,
        state: JobPostState.DRAFT,
        jobPostStatus: "NOT_URGENT",
        description:
          "Support branding campaigns and client communication content.",
        specification: "Content writing\nSocial media basics\nDetail oriented",
      },
    ],
  },
];

const candidates: SeedCandidate[] = [
  {
    email: "seed.alex@intern-project.local",
    fullName: "Alex Patel",
    desiredPosition: "Software Engineering Intern",
    phoneNumber: "+66-81-111-1111",
    bio: "Full-stack focused student who enjoys shipping useful features and improving developer tooling.",
    description:
      "Interested in backend APIs, frontend performance, and working on real product teams.",
    gender: "Male",
    nationality: "Thai",
    internshipPeriod: "1 June 2026 - 31 August 2026 (3 Month)",
    education: {
      degreeName: "Bachelor of Engineering in Computer Engineering",
      educationLevel: "BACHELOR",
      fieldOfStudy: "Computer Engineering",
      yearOfStudy: "3",
      gpa: 3.72,
      isCurrent: true,
      universityIndex: 0,
    },
    skills: [
      { name: "JavaScript", category: SkillCategory.TECHNICAL, rating: 3 },
      { name: "React", category: SkillCategory.TECHNICAL, rating: 3 },
      { name: "Node.js", category: SkillCategory.TECHNICAL, rating: 2 },
      { name: "SQL", category: SkillCategory.TECHNICAL, rating: 2 },
    ],
    workHistory: [
      {
        companyName: "Campus Dev Club",
        position: "Student Developer",
        startDate: "2025-01-10",
        endDate: null,
        description:
          "Built event registration features and maintained the club website.",
      },
    ],
    projects: [
      {
        name: "Intern Matching Portal",
        role: "Frontend Developer",
        description: "Built dashboards and search flows for internship matching.",
        startDate: "Jan 2025",
        endDate: "May 2025",
        relatedSkills: ["React", "TypeScript", "Figma"],
        githubUrl: "https://github.com/example/intern-matching-portal",
        projectUrl: "https://example.com/intern-matching-portal",
      },
    ],
    certificates: [
      {
        name: "Responsive Web Design",
        issuedBy: "freeCodeCamp",
        issueDate: "2025-11-15",
        relatedSkills: ["React"],
        description:
          "Certification in responsive interface design and frontend fundamentals.",
        url: "https://example.com/certificates/alex-responsive-web-design.pdf",
      },
    ],
    preferredProvinceIndexes: [0, 1],
  },
  {
    email: "seed.sarah@intern-project.local",
    fullName: "Sarah Wong",
    desiredPosition: "Data Analyst Intern",
    phoneNumber: "+66-82-222-2222",
    bio: "Data-oriented student with strong SQL, dashboarding, and business analysis fundamentals.",
    description:
      "Looking for analytics internships where I can work with product or finance data.",
    gender: "Female",
    nationality: "Thai",
    internshipPeriod: "5 May 2026 - 31 July 2026 (3 Month)",
    education: {
      degreeName: "Bachelor of Science in Data Science",
      educationLevel: "BACHELOR",
      fieldOfStudy: "Data Science",
      yearOfStudy: "4",
      gpa: 3.86,
      isCurrent: true,
      universityIndex: 1,
    },
    skills: [
      { name: "Python", category: SkillCategory.TECHNICAL, rating: 3 },
      { name: "SQL", category: SkillCategory.TECHNICAL, rating: 3 },
      { name: "Data Analysis", category: SkillCategory.BUSINESS, rating: 3 },
      { name: "Excel", category: SkillCategory.BUSINESS, rating: 2 },
    ],
    workHistory: [
      {
        companyName: "Insight Research Lab",
        position: "Research Assistant",
        startDate: "2024-06-01",
        endDate: "2024-12-15",
        description:
          "Cleaned survey data and prepared visual summaries for faculty research.",
      },
    ],
    projects: [
      {
        name: "Sales KPI Dashboard",
        role: "Data Analyst",
        description:
          "Created a KPI dashboard from transaction data to support monthly reviews.",
        startDate: "Aug 2025",
        endDate: "Dec 2025",
        relatedSkills: ["SQL", "Excel", "Data Analysis"],
        githubUrl: "https://github.com/example/sales-kpi-dashboard",
      },
    ],
    certificates: [
      {
        name: "Google Data Analytics",
        issuedBy: "Google",
        issueDate: "2025-10-01",
        relatedSkills: ["SQL", "Data Analysis", "Excel"],
        description:
          "Professional certificate in analytics workflows and stakeholder reporting.",
        url: "https://example.com/certificates/sarah-google-data-analytics.pdf",
      },
    ],
    preferredProvinceIndexes: [0],
  },
  {
    email: "seed.david@intern-project.local",
    fullName: "David Kim",
    desiredPosition: "UX/UI Design Intern",
    phoneNumber: "+66-83-333-3333",
    bio: "Product design student focused on clean interaction design and design systems.",
    description:
      "Enjoys turning user insights into practical, easy-to-build interfaces.",
    gender: "Male",
    nationality: "Korean",
    internshipPeriod: "15 June 2026 - 15 September 2026 (3 Month)",
    education: {
      degreeName: "Bachelor of Fine Arts in Digital Design",
      educationLevel: "BACHELOR",
      fieldOfStudy: "Digital Design",
      yearOfStudy: "2",
      gpa: 3.58,
      isCurrent: true,
      universityIndex: 2,
    },
    skills: [
      { name: "Figma", category: SkillCategory.TECHNICAL, rating: 3 },
      { name: "UI Design", category: SkillCategory.TECHNICAL, rating: 3 },
      { name: "UX Research", category: SkillCategory.BUSINESS, rating: 2 },
    ],
    workHistory: [],
    projects: [
      {
        name: "Mobile Banking Redesign",
        role: "UX/UI Designer",
        description:
          "Redesigned mobile banking flows for onboarding and transfer tasks.",
        startDate: "Feb 2025",
        endDate: "Jun 2025",
        relatedSkills: ["Figma", "UI Design", "UX Research"],
        projectUrl: "https://example.com/projects/mobile-banking-redesign",
      },
    ],
    certificates: [],
    preferredProvinceIndexes: [0, 2],
  },
  {
    email: "seed.emily@intern-project.local",
    fullName: "Emily Chen",
    desiredPosition: "Marketing Intern",
    phoneNumber: "+66-84-444-4444",
    bio: "Marketing student with experience in content planning and campaign reporting.",
    description:
      "Interested in employer branding, growth campaigns, and digital content operations.",
    gender: "Female",
    nationality: "Thai",
    internshipPeriod: "1 April 2026 - 30 June 2026 (3 Month)",
    education: {
      degreeName: "Bachelor of Business Administration in Marketing",
      educationLevel: "BACHELOR",
      fieldOfStudy: "Marketing",
      yearOfStudy: "3",
      gpa: 3.67,
      isCurrent: true,
      universityIndex: 3,
    },
    skills: [
      { name: "Content Strategy", category: SkillCategory.BUSINESS, rating: 3 },
      { name: "SEO", category: SkillCategory.BUSINESS, rating: 2 },
      {
        name: "Social Media Marketing",
        category: SkillCategory.BUSINESS,
        rating: 3,
      },
    ],
    workHistory: [
      {
        companyName: "Campus Media Team",
        position: "Content Coordinator",
        startDate: "2025-02-01",
        endDate: null,
        description: "Managed content calendars and created campaign reports.",
      },
    ],
    projects: [
      {
        name: "Student Event Campaign",
        role: "Campaign Planner",
        description:
          "Planned and executed social content for a campus recruitment event.",
        startDate: "Sep 2025",
        endDate: "Nov 2025",
        relatedSkills: ["Content Strategy", "SEO"],
        projectUrl: "https://example.com/projects/student-event-campaign",
        fileUrl: "https://example.com/files/student-event-campaign.pdf",
        fileName: "student-event-campaign.pdf",
      },
    ],
    certificates: [],
    preferredProvinceIndexes: [0],
  },
];

async function ensureSkills() {
  for (const name of skillNames) {
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO "Skills" ("id", "name", "category", "createdAt", "updatedAt")
      VALUES (${randomUUID()}, ${name}, ${getSkillCategory(name)}, ${now}, ${now})
      ON CONFLICT ("name")
      DO UPDATE SET
        "category" = EXCLUDED."category",
        "updatedAt" = EXCLUDED."updatedAt"
    `;
  }

  const rows = await prisma.$queryRaw<Array<{ id: string; name: string }>>`
    SELECT "id", "name" FROM "Skills"
  `;

  return new Map(rows.map((row) => [row.name, row.id]));
}

async function getAddresses(): Promise<AddressRecord[]> {
  const provinces = await prisma.province.findMany({
    take: 10,
    orderBy: { name: "asc" },
    include: {
      Districts: {
        take: 5,
        orderBy: { name: "asc" },
        include: {
          Subdistricts: {
            take: 5,
            orderBy: { name: "asc" },
          },
        },
      },
    },
  });

  if (provinces.length === 0) {
    return [
      {
        provinceId: null,
        provinceName: null,
        districtId: null,
        districtName: null,
        subdistrictId: null,
        subdistrictName: null,
        postcode: null,
      },
    ];
  }

  return provinces.map((province) => {
    const district = province.Districts[0] ?? null;
    const subdistrict = district?.Subdistricts?.[0] ?? null;
    return {
      provinceId: province.id,
      provinceName: province.name,
      districtId: district?.id ?? null,
      districtName: district?.name ?? null,
      subdistrictId: subdistrict?.id ?? null,
      subdistrictName: subdistrict?.name ?? null,
      postcode: district?.postalCode ?? null,
    };
  });
}

async function getUniversities() {
  return prisma.university.findMany({
    take: 20,
    orderBy: { name: "asc" },
  });
}

async function upsertCompany(
  company: SeedCompany,
  address: AddressRecord,
  passwordHash: string,
) {
  const user = await prisma.user.upsert({
    where: { email: company.email },
    update: {
      role: UserRole.COMPANY,
      authProvider: AuthProvider.LOCAL,
      password: passwordHash,
      socialID: `seed:${company.email}`,
    },
    create: {
      id: randomUUID(),
      email: company.email,
      role: UserRole.COMPANY,
      authProvider: AuthProvider.LOCAL,
      password: passwordHash,
      socialID: `seed:${company.email}`,
    },
  });

  const profile = await prisma.companyProfile.upsert({
    where: { userId: user.id },
    update: {
      companyName: company.companyName,
      businessType: company.businessType,
      about: company.about,
      addressDetails: company.addressDetails,
      provinceId: address.provinceId,
      districtId: address.districtId,
      subdistrictId: address.subdistrictId,
      postcode: address.postcode,
      companySize: company.companySize,
      recruiterName: company.recruiterName,
      websiteUrl: company.websiteUrl,
      updatedAt: new Date(),
    },
    create: {
      id: randomUUID(),
      userId: user.id,
      companyName: company.companyName,
      businessType: company.businessType,
      about: company.about,
      addressDetails: company.addressDetails,
      provinceId: address.provinceId,
      districtId: address.districtId,
      subdistrictId: address.subdistrictId,
      postcode: address.postcode,
      companySize: company.companySize,
      recruiterName: company.recruiterName,
      websiteUrl: company.websiteUrl,
      updatedAt: new Date(),
    },
  });

  await prisma.companyEmail.deleteMany({ where: { companyId: profile.id } });
  await prisma.companyPhone.deleteMany({ where: { companyId: profile.id } });
  await prisma.jobPost.deleteMany({ where: { companyId: profile.id } });

  await prisma.companyEmail.create({
    data: {
      id: randomUUID(),
      companyId: profile.id,
      email: company.email,
    },
  });

  await prisma.companyPhone.createMany({
    data: company.phones.map((phone) => ({
      id: randomUUID(),
      companyId: profile.id,
      phone,
    })),
  });

  const jobsByKey: Record<string, string> = {};

  for (const job of company.jobs) {
    const jobId = randomUUID();
    const now = new Date();

    await prisma.$executeRaw`
      INSERT INTO "JobPost" (
        "id",
        "companyId",
        "jobTitle",
        "locationProvince",
        "locationDistrict",
        "jobType",
        "workplaceType",
        "allowance",
        "allowancePeriod",
        "noAllowance",
        "jobPostStatus",
        "jobDescription",
        "jobSpecification",
        "state",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${jobId},
        ${profile.id},
        ${job.title},
        ${address.provinceName},
        ${address.districtName},
        ${job.jobType},
        ${job.workplaceType},
        ${job.allowance},
        ${job.allowancePeriod},
        ${job.noAllowance},
        ${job.jobPostStatus},
        ${job.description},
        ${job.specification},
        ${job.state},
        ${now},
        ${now}
      )
    `;

    jobsByKey[job.key] = jobId;
  }

  return { user, profile, jobsByKey };
}

async function upsertCandidate(
  candidate: SeedCandidate,
  universities: Awaited<ReturnType<typeof getUniversities>>,
  addresses: AddressRecord[],
  passwordHash: string,
  skillIds: Map<string, string>,
) {
  const user = await prisma.user.upsert({
    where: { email: candidate.email },
    update: {
      role: UserRole.CANDIDATE,
      authProvider: AuthProvider.LOCAL,
      password: passwordHash,
      socialID: `seed:${candidate.email}`,
    },
    create: {
      id: randomUUID(),
      email: candidate.email,
      role: UserRole.CANDIDATE,
      authProvider: AuthProvider.LOCAL,
      password: passwordHash,
      socialID: `seed:${candidate.email}`,
    },
  });

  const profile = await prisma.candidateProfile.upsert({
    where: { userId: user.id },
    update: {
      fullName: candidate.fullName,
      desiredPosition: candidate.desiredPosition,
      contactEmail: candidate.email,
      phoneNumber: candidate.phoneNumber,
      gender: candidate.gender,
      nationality: candidate.nationality,
      internshipPeriod: candidate.internshipPeriod,
      bio: candidate.bio,
      description: candidate.description,
      preferredPositions: [candidate.desiredPosition],
      profileImage: candidate.profileImage ?? null,
      updatedAt: new Date(),
    },
    create: {
      id: randomUUID(),
      userId: user.id,
      fullName: candidate.fullName,
      desiredPosition: candidate.desiredPosition,
      contactEmail: candidate.email,
      phoneNumber: candidate.phoneNumber,
      gender: candidate.gender,
      nationality: candidate.nationality,
      internshipPeriod: candidate.internshipPeriod,
      bio: candidate.bio,
      description: candidate.description,
      preferredPositions: [candidate.desiredPosition],
      profileImage: candidate.profileImage ?? null,
      updatedAt: new Date(),
    },
  });

  await prisma.candidatePreferredProvince.deleteMany({
    where: { candidateId: profile.id },
  });
  await prisma.candidateUniversity.deleteMany({ where: { candidateId: profile.id } });
  await prisma.userSkill.deleteMany({ where: { candidateId: profile.id } });
  await prisma.workHistory.deleteMany({ where: { candidateId: profile.id } });
  await prisma.userProjects.deleteMany({ where: { candidateId: profile.id } });
  await prisma.candidateResume.deleteMany({ where: { candidateId: profile.id } });
  await prisma.candidateContactFile.deleteMany({
    where: { candidateId: profile.id },
  });
  await prisma.certificateFile.deleteMany({ where: { candidateId: profile.id } });

  for (const provinceIndex of candidate.preferredProvinceIndexes) {
    const province = addresses[provinceIndex % addresses.length];
    if (!province?.provinceId) continue;
    await prisma.candidatePreferredProvince.create({
      data: {
        id: randomUUID(),
        candidateId: profile.id,
        provinceId: province.provinceId,
      },
    });
  }

  const university =
    universities.length > 0
      ? universities[candidate.education.universityIndex % universities.length]
      : null;

  if (university) {
    const now = new Date();
    const isVerified =
      candidate.email === "seed.alex@intern-project.local" ||
      candidate.email === "seed.sarah@intern-project.local";
    await prisma.$executeRaw`
      INSERT INTO "CandidateUniversity" (
        "id",
        "candidateId",
        "universityId",
        "educationLevel",
        "degreeName",
        "gpa",
        "isCurrent",
        "isVerified",
        "verifiedBy",
        "transcriptUrl",
        "createdAt",
        "updatedAt",
        "fieldOfStudy",
        "yearOfStudy"
      )
      VALUES (
        ${randomUUID()},
        ${profile.id},
        ${university.id},
        ${candidate.education.educationLevel},
        ${candidate.education.degreeName},
        ${candidate.education.gpa},
        ${candidate.education.isCurrent},
        ${isVerified},
        ${isVerified ? "TRANSCRIPT" : null},
        ${isVerified ? `https://example.com/transcripts/${profile.id}.pdf` : null},
        ${now},
        ${now},
        ${candidate.education.fieldOfStudy},
        ${candidate.education.yearOfStudy}
      )
    `;
  }

  for (const skillEntry of candidate.skills) {
    const skillId = skillIds.get(skillEntry.name);
    if (!skillId) continue;
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO "UserSkill" ("id", "candidateId", "skillId", "rating", "category", "status", "createdAt", "updatedAt")
      VALUES (${randomUUID()}, ${profile.id}, ${skillId}, ${skillEntry.rating}, ${skillEntry.category}, ${"VERIFIED"}, ${now}, ${now})
    `;
  }

  for (const workItem of candidate.workHistory) {
    await prisma.workHistory.create({
      data: {
        id: randomUUID(),
        candidateId: profile.id,
        companyName: workItem.companyName,
        position: workItem.position,
        startDate: new Date(workItem.startDate),
        endDate: workItem.endDate ? new Date(workItem.endDate) : null,
        description: workItem.description,
      },
    });
  }

  for (const project of candidate.projects) {
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO "UserProjects" (
        "id",
        "candidateId",
        "name",
        "role",
        "description",
        "createdAt",
        "updatedAt",
        "startDate",
        "endDate",
        "relatedSkills",
        "githubUrl",
        "githubVerified",
        "projectUrl",
        "fileUrl",
        "fileName"
      )
      VALUES (
        ${randomUUID()},
        ${profile.id},
        ${project.name},
        ${project.role},
        ${project.description},
        ${now},
        ${now},
        ${project.startDate},
        ${project.endDate},
        ${project.relatedSkills},
        ${project.githubUrl ?? null},
        ${project.githubUrl ? true : false},
        ${project.projectUrl ?? null},
        ${project.fileUrl ?? null},
        ${project.fileName ?? null}
      )
    `;
  }

  await prisma.candidateResume.create({
    data: {
      id: randomUUID(),
      candidateId: profile.id,
      name: `${candidate.fullName} Resume.pdf`,
      url: `https://example.com/resumes/${profile.id}.pdf`,
      fileSize: 125000,
      fileType: "application/pdf",
      isPrimary: true,
    },
  });

  await prisma.candidateContactFile.create({
    data: {
      id: randomUUID(),
      candidateId: profile.id,
      name: `${candidate.fullName} Portfolio.pdf`,
      url: `https://example.com/portfolio/${profile.id}.pdf`,
      type: CandidateFileType.PORTFOLIO,
    },
  });

  for (const certificate of candidate.certificates) {
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO "CertificateFile" (
        "id",
        "candidateId",
        "name",
        "url",
        "type",
        "issuedBy",
        "issueDate",
        "relatedSkills",
        "description",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${randomUUID()},
        ${profile.id},
        ${certificate.name},
        ${certificate.url},
        ${"application/pdf"},
        ${certificate.issuedBy},
        ${new Date(certificate.issueDate)},
        ${certificate.relatedSkills},
        ${certificate.description},
        ${now},
        ${now}
      )
    `;
  }

  return { user, profile };
}

async function reseedApplications(
  jobsByKey: Record<string, string>,
  candidatesByEmail: Record<string, string>,
) {
  await prisma.jobApplication.deleteMany({
    where: {
      OR: [
        { jobPostId: { in: Object.values(jobsByKey) } },
        { candidateId: { in: Object.values(candidatesByEmail) } },
      ],
    },
  });

  const specs = [
    {
      jobKey: "trinity-software",
      candidateEmail: "seed.alex@intern-project.local",
      status: ApplicationStatus.NEW,
    },
    {
      jobKey: "trinity-software",
      candidateEmail: "seed.sarah@intern-project.local",
      status: ApplicationStatus.SHORTLISTED,
    },
    {
      jobKey: "techverse-frontend",
      candidateEmail: "seed.alex@intern-project.local",
      status: ApplicationStatus.REVIEWED,
    },
    {
      jobKey: "techverse-ux",
      candidateEmail: "seed.david@intern-project.local",
      status: ApplicationStatus.NEW,
    },
    {
      jobKey: "financehub-analyst",
      candidateEmail: "seed.sarah@intern-project.local",
      status: ApplicationStatus.NEW,
    },
    {
      jobKey: "financehub-analyst",
      candidateEmail: "seed.emily@intern-project.local",
      status: ApplicationStatus.REJECTED,
    },
  ];

  for (const spec of specs) {
    const jobPostId = jobsByKey[spec.jobKey];
    const candidateId = candidatesByEmail[spec.candidateEmail];
    if (!jobPostId || !candidateId) continue;
    await prisma.jobApplication.create({
      data: {
        id: randomUUID(),
        jobPostId,
        candidateId,
        status: spec.status,
      },
    });
  }
}

async function reseedBookmarks(
  companyIds: Record<string, string>,
  candidateIds: Record<string, string>,
  jobsByKey: Record<string, string>,
) {
  await prisma.bookmark.deleteMany({
    where: {
      OR: [
        { companyId: { in: Object.values(companyIds) } },
        { candidateId: { in: Object.values(candidateIds) } },
      ],
    },
  });

  await prisma.jobBookmark.deleteMany({
    where: {
      OR: [
        { jobPostId: { in: Object.values(jobsByKey) } },
        { candidateId: { in: Object.values(candidateIds) } },
      ],
    },
  });

  const companyBookmarkSpecs = [
    ["seed.trinity@intern-project.local", "seed.sarah@intern-project.local"],
    ["seed.trinity@intern-project.local", "seed.david@intern-project.local"],
    ["seed.tech@intern-project.local", "seed.alex@intern-project.local"],
  ] as const;

  for (const [companyEmail, candidateEmail] of companyBookmarkSpecs) {
    const companyId = companyIds[companyEmail];
    const candidateId = candidateIds[candidateEmail];
    if (!companyId || !candidateId) continue;
    await prisma.bookmark.create({
      data: {
        id: randomUUID(),
        companyId,
        candidateId,
      },
    });
  }

  const jobBookmarkSpecs = [
    ["trinity-software", "seed.alex@intern-project.local"],
    ["techverse-frontend", "seed.sarah@intern-project.local"],
    ["financehub-analyst", "seed.emily@intern-project.local"],
  ] as const;

  for (const [jobKey, candidateEmail] of jobBookmarkSpecs) {
    const jobPostId = jobsByKey[jobKey];
    const candidateId = candidateIds[candidateEmail];
    if (!jobPostId || !candidateId) continue;
    await prisma.jobBookmark.create({
      data: {
        id: randomUUID(),
        jobPostId,
        candidateId,
      },
    });
  }
}

async function reseedJobIgnores(
  candidateIds: Record<string, string>,
  jobsByKey: Record<string, string>,
) {
  await prisma.jobIgnore.deleteMany({
    where: {
      OR: [
        { jobPostId: { in: Object.values(jobsByKey) } },
        { candidateId: { in: Object.values(candidateIds) } },
      ],
    },
  });

  const ignoreSpecs = [
    ["techverse-ux", "seed.alex@intern-project.local"],
    ["financehub-marketing", "seed.david@intern-project.local"],
  ] as const;

  for (const [jobKey, candidateEmail] of ignoreSpecs) {
    const jobPostId = jobsByKey[jobKey];
    const candidateId = candidateIds[candidateEmail];
    if (!jobPostId || !candidateId) continue;
    await prisma.jobIgnore.create({
      data: {
        id: randomUUID(),
        jobPostId,
        candidateId,
      },
    });
  }
}

async function reseedConversations(
  companyIds: Record<string, string>,
  candidateIds: Record<string, string>,
) {
  const profileIds = [...Object.values(companyIds), ...Object.values(candidateIds)];

  await prisma.message.deleteMany({
    where: { senderId: { in: profileIds } },
  });

  await prisma.conversation.deleteMany({
    where: {
      OR: [
        { companyId: { in: Object.values(companyIds) } },
        { candidateId: { in: Object.values(candidateIds) } },
      ],
    },
  });

  const specs = [
    {
      companyEmail: "seed.trinity@intern-project.local",
      candidateEmail: "seed.alex@intern-project.local",
      messages: [
        {
          senderRole: UserRole.COMPANY,
          text: "Hi Alex, your profile looks interesting. Are you available for an interview next week?",
          read: true,
        },
        {
          senderRole: UserRole.CANDIDATE,
          text: "Yes, I am available. Thank you for reaching out.",
          read: true,
        },
        {
          senderRole: UserRole.COMPANY,
          text: "Great. I will send the interview details by tomorrow.",
          read: false,
        },
      ],
    },
    {
      companyEmail: "seed.tech@intern-project.local",
      candidateEmail: "seed.david@intern-project.local",
      messages: [
        {
          senderRole: UserRole.COMPANY,
          text: "Hi David, we would like to know more about your portfolio work.",
          read: false,
        },
      ],
    },
    {
      companyEmail: "seed.finance@intern-project.local",
      candidateEmail: "seed.sarah@intern-project.local",
      messages: [
        {
          senderRole: UserRole.COMPANY,
          text: "Your analytics background is a strong fit for our analyst internship.",
          read: true,
        },
        {
          senderRole: UserRole.CANDIDATE,
          text: "Thank you. I would love to learn more about the role.",
          read: false,
        },
      ],
    },
  ];

  for (const spec of specs) {
    const companyId = companyIds[spec.companyEmail];
    const candidateId = candidateIds[spec.candidateEmail];
    if (!companyId || !candidateId) continue;

    const conversation = await prisma.conversation.create({
      data: {
        id: randomUUID(),
        companyId,
        candidateId,
      },
    });

    let latestCreatedAt = new Date();

    for (let i = 0; i < spec.messages.length; i++) {
      const message = spec.messages[i];
      latestCreatedAt = new Date(
        Date.now() - (spec.messages.length - i) * 60 * 60 * 1000,
      );

      await prisma.message.create({
        data: {
          id: randomUUID(),
          conversationId: conversation.id,
          senderId:
            message.senderRole === UserRole.COMPANY ? companyId : candidateId,
          senderRole: message.senderRole,
          text: message.text,
          read: message.read,
          createdAt: latestCreatedAt,
        },
      });
    }

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: latestCreatedAt },
    });
  }
}

async function main() {
  console.log("Seeding mock data...");

  const passwordHash = await hashPassword(defaultPasswordPlain);
  const skillIds = await ensureSkills();

  const [universities, addresses] = await Promise.all([
    getUniversities(),
    getAddresses(),
  ]);

  const companiesByEmail: Record<string, string> = {};
  const candidatesByEmail: Record<string, string> = {};
  const jobsByKey: Record<string, string> = {};

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const result = await upsertCompany(
      company,
      addresses[i % addresses.length] ?? addresses[0],
      passwordHash,
    );
    companiesByEmail[company.email] = result.profile.id;
    Object.assign(jobsByKey, result.jobsByKey);
    console.log(`Seeded company ${company.companyName}`);
  }

  for (const candidate of candidates) {
    const result = await upsertCandidate(
      candidate,
      universities,
      addresses,
      passwordHash,
      skillIds,
    );
    candidatesByEmail[candidate.email] = result.profile.id;
    console.log(`Seeded candidate ${candidate.fullName}`);
  }

  await reseedApplications(jobsByKey, candidatesByEmail);
  await reseedBookmarks(companiesByEmail, candidatesByEmail, jobsByKey);
  await reseedJobIgnores(candidatesByEmail, jobsByKey);
  await reseedConversations(companiesByEmail, candidatesByEmail);

  console.log("");
  console.log("Mock data seed completed.");
  console.log(`Password for all seeded users: ${defaultPasswordPlain}`);
  console.log("");
  console.log("Company logins:");
  for (const company of companies) {
    console.log(`- ${company.email}`);
  }
  console.log("");
  console.log("Candidate logins:");
  for (const candidate of candidates) {
    console.log(`- ${candidate.email}`);
  }
}

main()
  .catch((error) => {
    console.error("Mock data seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
