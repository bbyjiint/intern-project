import { randomUUID } from "crypto";
import {
  AllowancePeriod,
  ApplicationStatus,
  AuthProvider,
  CandidateFileType,
  JobPostState,
  JobPostStatus,
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

type SeededJob = {
  key: string;
  title: string;
  roleType: string;
  workplaceType: WorkplaceType;
  allowance: number | null;
  allowancePeriod: AllowancePeriod | null;
  noAllowance: boolean;
  jobPostStatus: JobPostStatus;
  state: JobPostState;
  description: string;
  specification: string;
};

type SeededCompany = {
  email: string;
  companyName: string;
  about: string;
  recruiterName: string;
  recruiterPosition: string;
  registrationNum: string;
  companySize: string;
  addressDetails: string;
  phones: string[];
  jobs: SeededJob[];
};

type SeededCandidate = {
  email: string;
  fullName: string;
  desiredPosition: string;
  phoneNumber: string;
  bio: string;
  description: string;
  gender: string;
  nationality: string;
  internshipPeriod: string;
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
  "Financial Analysis",
  "Excel",
  "Data Analysis",
  "Machine Learning",
  "SEO",
  "Content Strategy",
  "Social Media Marketing",
];

const companies: SeededCompany[] = [
  {
    email: "seed.trinity@intern-project.local",
    companyName: "Trinity Securities Mock",
    about: "Seeded employer account for testing company profile, job posts, messaging, and candidate review flows.",
    recruiterName: "Nina Supakit",
    recruiterPosition: "Talent Acquisition Manager",
    registrationNum: "0105569001001",
    companySize: "201-500 employees",
    addressDetails: "90 North Sathorn Road, Silom",
    phones: ["+66-2-100-1001", "+66-81-100-1001"],
    jobs: [
      {
        key: "trinity-software",
        title: "Software Engineering Intern",
        roleType: "Software Engineer",
        workplaceType: WorkplaceType.HYBRID,
        allowance: 18000,
        allowancePeriod: AllowancePeriod.MONTH,
        noAllowance: false,
        jobPostStatus: JobPostStatus.URGENT,
        state: JobPostState.PUBLISHED,
        description: "Build internal tools, improve recruiter dashboards, and collaborate on backend APIs.",
        specification: "React or Next.js basics\nNode.js basics\nAble to work with Git\nStrong communication skills",
      },
      {
        key: "trinity-data",
        title: "Data Analyst Intern",
        roleType: "Data Analyst",
        workplaceType: WorkplaceType.ON_SITE,
        allowance: 15000,
        allowancePeriod: AllowancePeriod.MONTH,
        noAllowance: false,
        jobPostStatus: JobPostStatus.NOT_URGENT,
        state: JobPostState.CLOSED,
        description: "Support reporting, SQL analysis, and dashboard preparation for investment operations.",
        specification: "SQL\nExcel\nAttention to detail\nInterest in finance",
      },
    ],
  },
  {
    email: "seed.tech@intern-project.local",
    companyName: "TechVerse Labs",
    about: "Seeded software company for testing live job listings, bookmarks, and applications.",
    recruiterName: "Ploy Rattanasiri",
    recruiterPosition: "HR Business Partner",
    registrationNum: "0105569001002",
    companySize: "51-200 employees",
    addressDetails: "12 Sukhumvit 55 Road, Khlong Tan Nuea",
    phones: ["+66-2-200-2002"],
    jobs: [
      {
        key: "techverse-frontend",
        title: "Frontend Developer Intern",
        roleType: "Frontend Developer",
        workplaceType: WorkplaceType.REMOTE,
        allowance: 20000,
        allowancePeriod: AllowancePeriod.MONTH,
        noAllowance: false,
        jobPostStatus: JobPostStatus.URGENT,
        state: JobPostState.PUBLISHED,
        description: "Build user-facing features in Next.js, integrate APIs, and improve frontend performance.",
        specification: "JavaScript or TypeScript\nReact or Next.js\nHTML/CSS\nBasic API integration",
      },
      {
        key: "techverse-ux",
        title: "UX/UI Design Intern",
        roleType: "UX/UI Designer",
        workplaceType: WorkplaceType.HYBRID,
        allowance: 12000,
        allowancePeriod: AllowancePeriod.MONTH,
        noAllowance: false,
        jobPostStatus: JobPostStatus.NOT_URGENT,
        state: JobPostState.PUBLISHED,
        description: "Create wireframes, improve user flows, and maintain product design consistency.",
        specification: "Figma\nUI fundamentals\nUX research basics\nPortfolio preferred",
      },
    ],
  },
  {
    email: "seed.finance@intern-project.local",
    companyName: "FinanceHub Advisory",
    about: "Seeded finance company to help test filters, applications, and employer messaging.",
    recruiterName: "Korn Chaiyasit",
    recruiterPosition: "Senior Recruiter",
    registrationNum: "0105569001003",
    companySize: "11-50 employees",
    addressDetails: "88 Wireless Road, Lumphini",
    phones: ["+66-2-300-3003"],
    jobs: [
      {
        key: "financehub-analyst",
        title: "Financial Analyst Intern",
        roleType: "Financial Analyst",
        workplaceType: WorkplaceType.ON_SITE,
        allowance: 22000,
        allowancePeriod: AllowancePeriod.MONTH,
        noAllowance: false,
        jobPostStatus: JobPostStatus.URGENT,
        state: JobPostState.PUBLISHED,
        description: "Assist with market research, valuation spreadsheets, and management reports.",
        specification: "Finance or economics background\nExcel\nAnalytical thinking\nPresentation skills",
      },
      {
        key: "financehub-marketing",
        title: "Marketing Intern",
        roleType: "Marketing",
        workplaceType: WorkplaceType.HYBRID,
        allowance: null,
        allowancePeriod: null,
        noAllowance: true,
        jobPostStatus: JobPostStatus.NOT_URGENT,
        state: JobPostState.DRAFT,
        description: "Support branding campaigns and client communication content.",
        specification: "Content writing\nSocial media basics\nDetail oriented",
      },
    ],
  },
];

const candidates: SeededCandidate[] = [
  {
    email: "seed.alex@intern-project.local",
    fullName: "Alex Patel",
    desiredPosition: "Software Engineering Intern",
    phoneNumber: "+66-81-111-1111",
    bio: "Full-stack focused student who enjoys shipping useful features and improving developer tooling.",
    description: "Interested in backend APIs, frontend performance, and working on real product teams.",
    gender: "Male",
    nationality: "Thai",
    internshipPeriod: "June 2026 - August 2026",
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
        description: "Built event registration features and maintained the club website.",
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
        relatedSkills: ["HTML", "CSS", "React"],
        description: "Certification in responsive interface design and frontend fundamentals.",
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
    description: "Looking for analytics internships where I can work with product or finance data.",
    gender: "Female",
    nationality: "Thai",
    internshipPeriod: "May 2026 - July 2026",
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
        description: "Cleaned survey data and prepared visual summaries for faculty research.",
      },
    ],
    projects: [
      {
        name: "Sales KPI Dashboard",
        role: "Data Analyst",
        description: "Created a KPI dashboard from transaction data to support monthly reviews.",
        startDate: "Aug 2025",
        endDate: "Dec 2025",
        relatedSkills: ["SQL", "Excel", "Data Analysis"],
      },
    ],
    certificates: [
      {
        name: "Google Data Analytics",
        issuedBy: "Google",
        issueDate: "2025-10-01",
        relatedSkills: ["SQL", "Data Analysis", "Excel"],
        description: "Professional certificate in analytics workflows and stakeholder reporting.",
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
    description: "Enjoys turning user insights into practical, easy-to-build interfaces.",
    gender: "Male",
    nationality: "Korean",
    internshipPeriod: "June 2026 - September 2026",
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
        description: "Redesigned mobile banking flows for onboarding and transfer tasks.",
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
    description: "Interested in employer branding, growth campaigns, and digital content operations.",
    gender: "Female",
    nationality: "Thai",
    internshipPeriod: "April 2026 - June 2026",
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
      { name: "Social Media Marketing", category: SkillCategory.BUSINESS, rating: 3 },
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
        description: "Planned and executed social content for a campus recruitment event.",
        startDate: "Sep 2025",
        endDate: "Nov 2025",
        relatedSkills: ["Content Strategy", "SEO"],
      },
    ],
    certificates: [],
    preferredProvinceIndexes: [0],
  },
];

async function ensureSkills() {
  for (const name of skillNames) {
    await prisma.skills.upsert({
      where: { name },
      update: {},
      create: {
        id: randomUUID(),
        name,
      },
    });
  }
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
    return [{ provinceId: null, provinceName: null, districtId: null, districtName: null, subdistrictId: null, subdistrictName: null, postcode: null }];
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
  const universities = await prisma.university.findMany({
    take: 20,
    orderBy: { name: "asc" },
  });

  if (universities.length === 0) {
    throw new Error("No universities found. Seed universities before running mock data seed.");
  }

  return universities;
}

async function upsertCompany(
  company: SeededCompany,
  address: AddressRecord,
  defaultPassword: string
) {
  const user = await prisma.user.upsert({
    where: { email: company.email },
    update: {
      role: UserRole.COMPANY,
      authProvider: AuthProvider.LOCAL,
      password: defaultPassword,
      socialID: `seed:${company.email}`,
    },
    create: {
      id: randomUUID(),
      email: company.email,
      role: UserRole.COMPANY,
      authProvider: AuthProvider.LOCAL,
      password: defaultPassword,
      socialID: `seed:${company.email}`,
    },
  });

  const companyProfile = await prisma.companyProfile.upsert({
    where: { userId: user.id },
    update: {
      companyName: company.companyName,
      about: company.about,
      addressDetails: company.addressDetails,
      location: [address.districtName, address.provinceName].filter(Boolean).join(", ") || null,
      province: address.provinceName,
      provinceId: address.provinceId,
      districtId: address.districtId,
      subdistrictId: address.subdistrictId,
      postcode: address.postcode,
      companySize: company.companySize,
      recruiterName: company.recruiterName,
      recruiterPosition: company.recruiterPosition,
      registrationNum: company.registrationNum,
      updatedAt: new Date(),
    },
    create: {
      id: randomUUID(),
      userId: user.id,
      companyName: company.companyName,
      about: company.about,
      addressDetails: company.addressDetails,
      location: [address.districtName, address.provinceName].filter(Boolean).join(", ") || null,
      province: address.provinceName,
      provinceId: address.provinceId,
      districtId: address.districtId,
      subdistrictId: address.subdistrictId,
      postcode: address.postcode,
      companySize: company.companySize,
      recruiterName: company.recruiterName,
      recruiterPosition: company.recruiterPosition,
      registrationNum: company.registrationNum,
      updatedAt: new Date(),
    },
  });

  await prisma.companyEmail.deleteMany({ where: { companyId: companyProfile.id } });
  await prisma.companyPhone.deleteMany({ where: { companyId: companyProfile.id } });

  await prisma.companyEmail.create({
    data: {
      id: randomUUID(),
      companyId: companyProfile.id,
      email: company.email,
    },
  });

  await prisma.companyPhone.createMany({
    data: company.phones.map((phone) => ({
      id: randomUUID(),
      companyId: companyProfile.id,
      phone,
    })),
  });

  await prisma.jobPost.deleteMany({ where: { companyId: companyProfile.id } });

  const createdJobs: Record<string, string> = {};

  for (const job of company.jobs) {
    const jobPost = await prisma.jobPost.create({
      data: {
        id: randomUUID(),
        companyId: companyProfile.id,
        jobTitle: job.title,
        locationProvince: address.provinceName,
        locationDistrict: address.districtName,
        jobType: job.roleType,
        workplaceType: job.workplaceType,
        allowance: job.allowance,
        allowancePeriod: job.allowancePeriod,
        noAllowance: job.noAllowance,
        jobPostStatus: job.jobPostStatus,
        jobDescription: job.description,
        jobSpecification: job.specification,
        state: job.state,
      },
    });

    createdJobs[job.key] = jobPost.id;

    await prisma.screeningQuestion.create({
      data: {
        id: randomUUID(),
        jobPostId: jobPost.id,
        question: "Why are you interested in this internship?",
        questionType: "TEXT",
        order: 1,
      },
    });
  }

  return { user, companyProfile, createdJobs };
}

async function upsertCandidate(
  candidate: SeededCandidate,
  universities: Awaited<ReturnType<typeof getUniversities>>,
  provinces: AddressRecord[],
  defaultPassword: string
) {
  const user = await prisma.user.upsert({
    where: { email: candidate.email },
    update: {
      role: UserRole.CANDIDATE,
      authProvider: AuthProvider.LOCAL,
      password: defaultPassword,
      socialID: `seed:${candidate.email}`,
    },
    create: {
      id: randomUUID(),
      email: candidate.email,
      role: UserRole.CANDIDATE,
      authProvider: AuthProvider.LOCAL,
      password: defaultPassword,
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
      updatedAt: new Date(),
    },
  });

  await prisma.candidatePreferredProvince.deleteMany({ where: { candidateId: profile.id } });
  await prisma.candidateUniversity.deleteMany({ where: { candidateId: profile.id } });
  await prisma.userSkill.deleteMany({ where: { candidateId: profile.id } });
  await prisma.workHistory.deleteMany({ where: { candidateId: profile.id } });
  await prisma.userProjects.deleteMany({ where: { candidateId: profile.id } });
  await prisma.candidateResume.deleteMany({ where: { candidateId: profile.id } });
  await prisma.candidateContactFile.deleteMany({ where: { candidateId: profile.id } });
  await prisma.certificateFile.deleteMany({ where: { candidateId: profile.id } });

  for (const provinceIndex of candidate.preferredProvinceIndexes) {
    const province = provinces[provinceIndex % provinces.length];
    if (!province?.provinceId) continue;
    await prisma.candidatePreferredProvince.create({
      data: {
        id: randomUUID(),
        candidateId: profile.id,
        provinceId: province.provinceId,
      },
    });
  }

  const university = universities[candidate.education.universityIndex % universities.length];
  await prisma.candidateUniversity.create({
    data: {
      id: randomUUID(),
      candidateId: profile.id,
      universityId: university.id,
      degreeName: candidate.education.degreeName,
      educationLevel: candidate.education.educationLevel,
      fieldOfStudy: candidate.education.fieldOfStudy,
      yearOfStudy: candidate.education.yearOfStudy,
      gpa: candidate.education.gpa,
      isCurrent: candidate.education.isCurrent,
    },
  });

  for (const skillEntry of candidate.skills) {
    const skill = await prisma.skills.findUnique({ where: { name: skillEntry.name } });
    if (!skill) continue;
    await prisma.userSkill.create({
      data: {
        id: randomUUID(),
        candidateId: profile.id,
        skillId: skill.id,
        rating: skillEntry.rating,
        category: skillEntry.category,
      },
    });
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
    await prisma.userProjects.create({
      data: {
        id: randomUUID(),
        candidateId: profile.id,
        name: project.name,
        role: project.role,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        relatedSkills: project.relatedSkills,
        githubUrl: project.githubUrl ?? null,
        projectUrl: project.projectUrl ?? null,
      },
    });
  }

  await prisma.candidateResume.create({
    data: {
      id: randomUUID(),
      candidateId: profile.id,
      name: `${candidate.fullName} Resume.pdf`,
      url: `https://example.com/resumes/${profile.id}.pdf`,
      fileType: "application/pdf",
      fileSize: 125000,
      isPrimary: true,
    },
  });

  await prisma.candidateContactFile.create({
    data: {
      id: randomUUID(),
      candidateId: profile.id,
      name: `${candidate.fullName} Portfolio.pdf`,
      url: `https://example.com/portfolios/${profile.id}.pdf`,
      type: CandidateFileType.PORTFOLIO,
    },
  });

  for (const certificate of candidate.certificates) {
    await prisma.certificateFile.create({
      data: {
        id: randomUUID(),
        candidateId: profile.id,
        name: certificate.name,
        url: certificate.url,
        type: "application/pdf",
        issuedBy: certificate.issuedBy,
        issueDate: new Date(certificate.issueDate),
        relatedSkills: certificate.relatedSkills,
        description: certificate.description,
      },
    });
  }

  return { user, profile };
}

async function reseedApplications(
  jobsByKey: Record<string, string>,
  candidatesByEmail: Record<string, string>
) {
  const candidateIds = Object.values(candidatesByEmail);
  const jobIds = Object.values(jobsByKey);

  await prisma.jobApplication.deleteMany({
    where: {
      OR: [
        { candidateId: { in: candidateIds } },
        { jobPostId: { in: jobIds } },
      ],
    },
  });

  const applicationSpecs = [
    { jobKey: "trinity-software", candidateEmail: "seed.alex@intern-project.local", status: ApplicationStatus.NEW },
    { jobKey: "trinity-software", candidateEmail: "seed.sarah@intern-project.local", status: ApplicationStatus.SHORTLISTED },
    { jobKey: "techverse-frontend", candidateEmail: "seed.alex@intern-project.local", status: ApplicationStatus.REVIEWED },
    { jobKey: "techverse-ux", candidateEmail: "seed.david@intern-project.local", status: ApplicationStatus.NEW },
    { jobKey: "financehub-analyst", candidateEmail: "seed.sarah@intern-project.local", status: ApplicationStatus.NEW },
    { jobKey: "financehub-analyst", candidateEmail: "seed.emily@intern-project.local", status: ApplicationStatus.REJECTED },
  ];

  for (const spec of applicationSpecs) {
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
  candidateIds: Record<string, string>
) {
  await prisma.bookmark.deleteMany({
    where: {
      OR: [
        { companyId: { in: Object.values(companyIds) } },
        { candidateId: { in: Object.values(candidateIds) } },
      ],
    },
  });

  const bookmarkSpecs = [
    ["seed.trinity@intern-project.local", "seed.sarah@intern-project.local"],
    ["seed.trinity@intern-project.local", "seed.david@intern-project.local"],
    ["seed.tech@intern-project.local", "seed.alex@intern-project.local"],
  ];

  for (const [companyEmail, candidateEmail] of bookmarkSpecs) {
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
}

async function reseedConversations(
  companyIds: Record<string, string>,
  candidateIds: Record<string, string>
) {
  await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: { in: [...Object.values(companyIds), ...Object.values(candidateIds)] } },
      ],
    },
  });

  await prisma.conversation.deleteMany({
    where: {
      OR: [
        { companyId: { in: Object.values(companyIds) } },
        { candidateId: { in: Object.values(candidateIds) } },
      ],
    },
  });

  const conversationSpecs = [
    {
      companyEmail: "seed.trinity@intern-project.local",
      candidateEmail: "seed.alex@intern-project.local",
      messages: [
        { senderRole: UserRole.COMPANY, text: "Hi Alex, your profile looks interesting. Are you available for an interview next week?", read: true },
        { senderRole: UserRole.CANDIDATE, text: "Yes, I am available. Thank you for reaching out.", read: true },
      ],
    },
    {
      companyEmail: "seed.tech@intern-project.local",
      candidateEmail: "seed.david@intern-project.local",
      messages: [
        { senderRole: UserRole.COMPANY, text: "Hi David, we would like to know more about your portfolio work.", read: false },
      ],
    },
  ];

  for (const spec of conversationSpecs) {
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
      const item = spec.messages[i];
      latestCreatedAt = new Date(Date.now() - (spec.messages.length - i) * 60 * 60 * 1000);
      await prisma.message.create({
        data: {
          id: randomUUID(),
          conversationId: conversation.id,
          senderId: item.senderRole === UserRole.COMPANY ? companyId : candidateId,
          senderRole: item.senderRole,
          text: item.text,
          read: item.read,
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
  console.log("🌱 Seeding mock data...");

  const defaultPassword = await hashPassword(defaultPasswordPlain);
  await ensureSkills();

  const [universities, addresses] = await Promise.all([
    getUniversities(),
    getAddresses(),
  ]);

  const companiesByEmail: Record<string, string> = {};
  const candidatesByEmail: Record<string, string> = {};
  const jobsByKey: Record<string, string> = {};

  for (let i = 0; i < companies.length; i++) {
    const result = await upsertCompany(
      companies[i],
      addresses[i % addresses.length] ?? addresses[0],
      defaultPassword
    );

    companiesByEmail[companies[i].email] = result.companyProfile.id;
    Object.assign(jobsByKey, result.createdJobs);
    console.log(`✅ Seeded company ${companies[i].companyName}`);
  }

  for (const candidate of candidates) {
    const result = await upsertCandidate(candidate, universities, addresses, defaultPassword);
    candidatesByEmail[candidate.email] = result.profile.id;
    console.log(`✅ Seeded candidate ${candidate.fullName}`);
  }

  await reseedApplications(jobsByKey, candidatesByEmail);
  await reseedBookmarks(companiesByEmail, candidatesByEmail);
  await reseedConversations(companiesByEmail, candidatesByEmail);

  console.log("\n🎉 Mock data seed completed.");
  console.log(`Password for seeded users: ${defaultPasswordPlain}`);
  console.log("\nSeeded company logins:");
  for (const company of companies) {
    console.log(`- ${company.email}`);
  }
  console.log("\nSeeded candidate logins:");
  for (const candidate of candidates) {
    console.log(`- ${candidate.email}`);
  }
}

main()
  .catch((error) => {
    console.error("❌ Mock data seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
