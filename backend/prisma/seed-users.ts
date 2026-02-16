import { randomUUID } from "crypto";
import prisma from "../src/utils/prisma.js";
import { hashPassword } from "../src/utils/password.js";

async function main() {
  console.log("🌱 Starting user seed...");

  // Hash password for all users (using same password for easy testing)
  const defaultPassword = await hashPassword("password123");

  // Get some universities for candidates
  const universities = await prisma.university.findMany({
    take: 10,
  });

  if (universities.length === 0) {
    console.log("⚠️  No universities found. Creating sample universities...");
    // Create a few sample universities if none exist
    const sampleUniversities = [
      { name: "Chulalongkorn University", thname: "จุฬาลงกรณ์มหาวิทยาลัย", province: "Bangkok", code: "CU" },
      { name: "Thammasat University", thname: "มหาวิทยาลัยธรรมศาสตร์", province: "Bangkok", code: "TU" },
      { name: "Mahidol University", thname: "มหาวิทยาลัยมหิดล", province: "Bangkok", code: "MU" },
      { name: "Kasetsart University", thname: "มหาวิทยาลัยเกษตรศาสตร์", province: "Bangkok", code: "KU" },
      { name: "King Mongkut's University of Technology Thonburi", thname: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี", province: "Bangkok", code: "KMUTT" },
    ];

    for (const uniData of sampleUniversities) {
      await prisma.university.create({
        data: {
          id: randomUUID(),
          name: uniData.name,
          thname: uniData.thname,
          province: uniData.province,
          code: uniData.code,
        },
      });
    }

    // Reload universities
    const reloadedUniversities = await prisma.university.findMany({
      take: 10,
    });
    universities.length = 0;
    universities.push(...reloadedUniversities);
  }

  // Get some skills for candidates
  const allSkills = await prisma.skills.findMany({
    take: 50,
  });

  if (allSkills.length === 0) {
    console.log("⚠️  No skills found. Creating sample skills...");
    // Create essential skills if none exist
    const essentialSkills = [
      "JavaScript", "Python", "React", "Node.js", "SQL", "Java", "HTML", "CSS",
      "TypeScript", "MongoDB", "PostgreSQL", "Git", "Docker", "AWS",
      "UI Design", "UX Research", "Figma", "Adobe XD",
      "Digital Marketing", "Content Strategy", "SEO", "Social Media",
      "Financial Analysis", "Excel", "Financial Modeling", "Accounting",
    ];

    for (const skillName of essentialSkills) {
      await prisma.skills.create({
        data: {
          id: randomUUID(),
          name: skillName,
        },
      });
    }
  }

  // Get some provinces and districts for addresses
  const provinces = await prisma.province.findMany({
    take: 5,
    include: {
      Districts: {
        take: 2,
        include: {
          Subdistricts: {
            take: 1,
          },
        },
      },
    },
  });

  // ============================================
  // CREATE COMPANIES WITH JOB POSTS
  // ============================================

  const companies = [
    {
      email: "trinity@company.com",
      companyName: "Trinity Securities Co., Ltd.",
      about: "Leading financial services company specializing in securities trading and investment advisory services.",
      location: "123 Silom Road, Bang Rak",
      province: "Bangkok",
      recruiterName: "John Smith",
      recruiterPosition: "HR Manager",
      registrationNum: "0105560001234",
      jobPosts: [
        {
          jobTitle: "Software Engineering Intern",
          locationProvince: "Bangkok",
          locationDistrict: "Bang Rak",
          jobType: "internship",
          workplaceType: "REMOTE" as const,
          allowance: 15000,
          allowancePeriod: "MONTH" as const,
          noAllowance: false,
          jobPostStatus: "NOT_URGENT" as const,
          state: "PUBLISHED" as const,
          jobDescription: "1. Develop and maintain web applications using React and Node.js\n2. Collaborate with cross-functional teams to design and implement new features\n3. Write clean, maintainable code following best practices\n4. Participate in code reviews and team meetings\n5. Learn and apply modern software development methodologies",
          jobSpecification: "1. Currently pursuing a degree in Computer Science or related field\n2. Basic knowledge of JavaScript, HTML, and CSS\n3. Familiarity with React or similar frontend frameworks\n4. Strong problem-solving skills and attention to detail\n5. Good communication skills and ability to work in a team",
        },
        {
          jobTitle: "Data Science Intern",
          locationProvince: "Bangkok",
          locationDistrict: "Silom",
          jobType: "internship",
          workplaceType: "HYBRID" as const,
          allowance: 18000,
          allowancePeriod: "MONTH" as const,
          noAllowance: false,
          jobPostStatus: "URGENT" as const,
          state: "PUBLISHED" as const,
          jobDescription: "1. Analyze financial data and market trends\n2. Build predictive models using machine learning\n3. Create data visualizations and reports\n4. Assist in research projects\n5. Work with large datasets using Python and SQL",
          jobSpecification: "1. Currently pursuing a degree in Data Science, Statistics, or related field\n2. Experience with Python, pandas, and numpy\n3. Basic understanding of machine learning concepts\n4. Strong analytical and statistical skills\n5. Ability to work with large datasets",
        },
      ],
    },
    {
      email: "techcorp@company.com",
      companyName: "TechCorp Solutions",
      about: "Innovative technology solutions provider focusing on enterprise software and cloud services.",
      location: "456 Sukhumvit Road, Khlong Toei",
      province: "Bangkok",
      recruiterName: "Sarah Johnson",
      recruiterPosition: "Talent Acquisition Lead",
      registrationNum: "0105560005678",
      jobPosts: [
        {
          jobTitle: "Full-Stack Developer Intern",
          locationProvince: "Bangkok",
          locationDistrict: "Khlong Toei",
          jobType: "internship",
          workplaceType: "ON_SITE" as const,
          allowance: 20000,
          allowancePeriod: "MONTH" as const,
          noAllowance: false,
          jobPostStatus: "NOT_URGENT" as const,
          state: "PUBLISHED" as const,
          jobDescription: "1. Develop full-stack web applications\n2. Work with React, Node.js, and PostgreSQL\n3. Implement RESTful APIs\n4. Write unit and integration tests\n5. Deploy applications to cloud platforms",
          jobSpecification: "1. Currently pursuing a degree in Computer Science or Software Engineering\n2. Strong knowledge of JavaScript/TypeScript\n3. Experience with React and Node.js\n4. Understanding of databases and SQL\n5. Familiarity with Git and version control",
        },
        {
          jobTitle: "UX/UI Design Intern",
          locationProvince: "Bangkok",
          locationDistrict: "Khlong Toei",
          jobType: "internship",
          workplaceType: "HYBRID" as const,
          allowance: 12000,
          allowancePeriod: "MONTH" as const,
          noAllowance: false,
          jobPostStatus: "NOT_URGENT" as const,
          state: "PUBLISHED" as const,
          jobDescription: "1. Design user interfaces for web and mobile applications\n2. Create wireframes and prototypes\n3. Conduct user research and usability testing\n4. Collaborate with developers to implement designs\n5. Maintain design systems and style guides",
          jobSpecification: "1. Currently pursuing a degree in Design, HCI, or related field\n2. Proficiency in Figma, Adobe XD, or similar tools\n3. Understanding of user-centered design principles\n4. Strong visual design skills\n5. Portfolio demonstrating design work",
        },
      ],
    },
    {
      email: "financehub@company.com",
      companyName: "FinanceHub International",
      about: "Global financial services firm providing investment banking, asset management, and advisory services.",
      location: "789 Wireless Road, Pathum Wan",
      province: "Bangkok",
      recruiterName: "Michael Chen",
      recruiterPosition: "Senior Recruiter",
      registrationNum: "0105560009012",
      jobPosts: [
        {
          jobTitle: "Financial Analyst Intern",
          locationProvince: "Bangkok",
          locationDistrict: "Pathum Wan",
          jobType: "internship",
          workplaceType: "ON_SITE" as const,
          allowance: 25000,
          allowancePeriod: "MONTH" as const,
          noAllowance: false,
          jobPostStatus: "URGENT" as const,
          state: "PUBLISHED" as const,
          jobDescription: "1. Analyze financial statements and market data\n2. Prepare financial models and forecasts\n3. Assist in investment research\n4. Create presentations and reports\n5. Support senior analysts in various projects",
          jobSpecification: "1. Currently pursuing a degree in Finance, Economics, or Business\n2. Strong analytical and quantitative skills\n3. Proficiency in Excel and financial modeling\n4. Understanding of financial markets\n5. Excellent attention to detail",
        },
      ],
    },
  ];

  for (const companyData of companies) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: companyData.email },
      include: { CompanyProfile: true },
    });

    if (existingUser) {
      console.log(`⏭️  Company ${companyData.email} already exists, skipping...`);
      continue;
    }

    const userId = randomUUID();
    const companyId = randomUUID();

    // Create user
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: companyData.email,
        password: defaultPassword,
        authProvider: "LOCAL",
        role: "COMPANY",
        socialID: `local:${companyData.email}`,
      },
    });

    // Create company profile
    const now = new Date();
    const companyProfile = await prisma.companyProfile.create({
      data: {
        id: companyId,
        userId: user.id,
        companyName: companyData.companyName,
        about: companyData.about,
        location: companyData.location,
        province: companyData.province,
        recruiterName: companyData.recruiterName,
        recruiterPosition: companyData.recruiterPosition,
        registrationNum: companyData.registrationNum,
        updatedAt: now,
      },
    });

    // Create company email
    await prisma.companyEmail.create({
      data: {
        id: randomUUID(),
        companyId: companyProfile.id,
        email: companyData.email,
      },
    });

    // Create company phone
    await prisma.companyPhone.create({
      data: {
        id: randomUUID(),
        companyId: companyProfile.id,
        phone: "+66-2-123-4567",
      },
    });

    // Create job posts
    for (const jobData of companyData.jobPosts) {
      const jobPostId = randomUUID();
      await prisma.jobPost.create({
        data: {
          id: jobPostId,
          companyId: companyProfile.id,
          jobTitle: jobData.jobTitle,
          locationProvince: jobData.locationProvince,
          locationDistrict: jobData.locationDistrict,
          jobType: jobData.jobType,
          workplaceType: jobData.workplaceType,
          allowance: jobData.allowance,
          allowancePeriod: jobData.allowancePeriod,
          noAllowance: jobData.noAllowance,
          jobPostStatus: jobData.jobPostStatus,
          jobDescription: jobData.jobDescription,
          jobSpecification: jobData.jobSpecification,
          state: jobData.state,
        },
      });
    }

    console.log(`✅ Created company: ${companyData.companyName} with ${companyData.jobPosts.length} job post(s)`);
  }

  // ============================================
  // CREATE CANDIDATES WITH COMPLETE PROFILES
  // ============================================

  const candidates = [
    {
      email: "alex.patel@student.com",
      fullName: "Alex Patel",
      studentCode: "STU001",
      contactEmail: "alex.patel@student.com",
      phoneNumber: "+66-81-234-5678",
      desiredPosition: "Software Engineering Intern",
      bio: "Passionate software engineering student with strong interest in full-stack development. Experienced in building web applications using modern technologies.",
      major: "Computer Science",
      studyYear: 3,
      universityIndex: 0,
      skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
      education: [
        {
          universityIndex: 0,
          degreeName: "Bachelor of Science in Computer Science",
          educationLevel: "BACHELOR" as const,
          startDate: new Date("2022-09-01"),
          endDate: new Date("2026-05-31"),
          isCurrent: true,
          gpa: 3.75,
        },
      ],
      workHistory: [
        {
          companyName: "Local Tech Startup",
          position: "Part-time Web Developer",
          startDate: new Date("2024-01-15"),
          endDate: null,
          description: "Developed and maintained company website using React and Node.js",
        },
      ],
      projects: [
        {
          name: "E-Commerce Platform",
          role: "Full-Stack Developer",
          description: "Built a complete e-commerce platform with React frontend and Node.js backend",
        },
        {
          name: "Task Management App",
          role: "Frontend Developer",
          description: "Created a task management application using React and Redux",
        },
      ],
    },
    {
      email: "sarah.wong@student.com",
      fullName: "Sarah Wong",
      studentCode: "STU002",
      contactEmail: "sarah.wong@student.com",
      phoneNumber: "+66-82-345-6789",
      desiredPosition: "Data Science Intern",
      bio: "Data science enthusiast with strong analytical skills. Passionate about machine learning and data visualization.",
      major: "Data Science",
      studyYear: 4,
      universityIndex: 1,
      skills: ["Python", "Machine Learning", "SQL", "R", "Data Analysis"],
      education: [
        {
          universityIndex: 1,
          degreeName: "Bachelor of Science in Data Science",
          educationLevel: "BACHELOR" as const,
          startDate: new Date("2021-09-01"),
          endDate: new Date("2025-05-31"),
          isCurrent: true,
          gpa: 3.85,
        },
      ],
      workHistory: [
        {
          companyName: "Research Lab",
          position: "Research Assistant",
          startDate: new Date("2023-06-01"),
          endDate: new Date("2023-12-31"),
          description: "Assisted in data analysis and machine learning research projects",
        },
      ],
      projects: [
        {
          name: "Customer Segmentation Analysis",
          role: "Data Analyst",
          description: "Developed clustering models to segment customers for marketing purposes",
        },
      ],
    },
    {
      email: "david.kim@student.com",
      fullName: "David Kim",
      studentCode: "STU003",
      contactEmail: "david.kim@student.com",
      phoneNumber: "+66-83-456-7890",
      desiredPosition: "UX/UI Design Intern",
      bio: "Creative designer with a passion for user-centered design. Experienced in creating intuitive and beautiful interfaces.",
      major: "Design",
      studyYear: 2,
      universityIndex: 2,
      skills: ["UI Design", "UX Research", "Figma", "Adobe XD", "Prototyping"],
      education: [
        {
          universityIndex: 2,
          degreeName: "Bachelor of Arts in Design",
          educationLevel: "BACHELOR" as const,
          startDate: new Date("2023-09-01"),
          endDate: new Date("2027-05-31"),
          isCurrent: true,
          gpa: 3.65,
        },
      ],
      workHistory: [],
      projects: [
        {
          name: "Mobile App Redesign",
          role: "UI/UX Designer",
          description: "Redesigned mobile app interface improving user experience and engagement",
        },
        {
          name: "Website Design System",
          role: "Design Lead",
          description: "Created comprehensive design system for company website",
        },
      ],
    },
    {
      email: "emily.chen@student.com",
      fullName: "Emily Chen",
      studentCode: "STU004",
      contactEmail: "emily.chen@student.com",
      phoneNumber: "+66-84-567-8901",
      desiredPosition: "Marketing Intern",
      bio: "Marketing student with expertise in digital marketing and content strategy. Creative and results-driven.",
      major: "Marketing",
      studyYear: 3,
      universityIndex: 3,
      skills: ["Digital Marketing", "Content Strategy", "SEO", "Social Media", "Analytics"],
      education: [
        {
          universityIndex: 3,
          degreeName: "Bachelor of Business Administration in Marketing",
          educationLevel: "BACHELOR" as const,
          startDate: new Date("2022-09-01"),
          endDate: new Date("2026-05-31"),
          isCurrent: true,
          gpa: 3.7,
        },
      ],
      workHistory: [
        {
          companyName: "Marketing Agency",
          position: "Marketing Intern",
          startDate: new Date("2024-06-01"),
          endDate: new Date("2024-08-31"),
          description: "Managed social media accounts and created marketing content",
        },
      ],
      projects: [
        {
          name: "Brand Campaign Strategy",
          role: "Marketing Strategist",
          description: "Developed comprehensive marketing campaign for local brand",
        },
      ],
    },
    {
      email: "james.lee@student.com",
      fullName: "James Lee",
      studentCode: "STU005",
      contactEmail: "james.lee@student.com",
      phoneNumber: "+66-85-678-9012",
      desiredPosition: "Financial Analyst Intern",
      bio: "Finance student with strong analytical skills and interest in investment analysis. Detail-oriented and analytical.",
      major: "Finance",
      studyYear: 4,
      universityIndex: 4,
      skills: ["Financial Analysis", "Excel", "Financial Modeling", "Accounting", "Statistics"],
      education: [
        {
          universityIndex: 4,
          degreeName: "Bachelor of Business Administration in Finance",
          educationLevel: "BACHELOR" as const,
          startDate: new Date("2021-09-01"),
          endDate: new Date("2025-05-31"),
          isCurrent: true,
          gpa: 3.8,
        },
      ],
      workHistory: [
        {
          companyName: "Investment Firm",
          position: "Part-time Research Assistant",
          startDate: new Date("2023-09-01"),
          endDate: null,
          description: "Assisted in financial research and analysis for investment decisions",
        },
      ],
      projects: [
        {
          name: "Portfolio Analysis Tool",
          role: "Financial Analyst",
          description: "Developed Excel-based tool for portfolio performance analysis",
        },
      ],
    },
  ];

  for (const candidateData of candidates) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: candidateData.email },
      include: { CandidateProfile: true },
    });

    if (existingUser) {
      console.log(`⏭️  Candidate ${candidateData.email} already exists, skipping...`);
      continue;
    }

    const userId = randomUUID();
    const candidateId = randomUUID();
    const university = universities[candidateData.universityIndex % universities.length];

    // Create user
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: candidateData.email,
        password: defaultPassword,
        authProvider: "LOCAL",
        role: "CANDIDATE",
        socialID: `local:${candidateData.email}`,
      },
    });

    // Create candidate profile
    const now = new Date();
    const candidateProfile = await prisma.candidateProfile.create({
      data: {
        id: candidateId,
        userId: user.id,
        studentCode: candidateData.studentCode,
        fullName: candidateData.fullName,
        contactEmail: candidateData.contactEmail,
        phoneNumber: candidateData.phoneNumber,
        desiredPosition: candidateData.desiredPosition,
        bio: candidateData.bio,
        major: candidateData.major,
        studyYear: candidateData.studyYear,
        universityId: university.id,
        updatedAt: now,
      },
    });

    // Create education records
    for (const eduData of candidateData.education) {
      const eduUniversity = universities[eduData.universityIndex % universities.length];
      await prisma.candidateUniversity.create({
        data: {
          id: randomUUID(),
          candidateId: candidateProfile.id,
          universityId: eduUniversity.id,
          degreeName: eduData.degreeName,
          educationLevel: eduData.educationLevel,
          startDate: eduData.startDate,
          endDate: eduData.endDate,
          isCurrent: eduData.isCurrent,
          gpa: eduData.gpa,
        },
      });
    }

    // Create skills
    for (const skillName of candidateData.skills) {
      let skill = await prisma.skills.findUnique({
        where: { name: skillName },
      });

      if (!skill) {
        skill = await prisma.skills.create({
          data: {
            id: randomUUID(),
            name: skillName,
          },
        });
      }

      await prisma.userSkill.create({
        data: {
          id: randomUUID(),
          candidateId: candidateProfile.id,
          skillId: skill.id,
          rating: Math.floor(Math.random() * 3) + 1, // Random rating 1-3
        },
      });
    }

    // Create work history
    for (const workData of candidateData.workHistory) {
      await prisma.workHistory.create({
        data: {
          id: randomUUID(),
          candidateId: candidateProfile.id,
          companyName: workData.companyName,
          position: workData.position,
          startDate: workData.startDate,
          endDate: workData.endDate,
          description: workData.description,
        },
      });
    }

    // Create projects
    for (const projectData of candidateData.projects) {
      await prisma.userProjects.create({
        data: {
          id: randomUUID(),
          candidateId: candidateProfile.id,
          name: projectData.name,
          role: projectData.role,
          description: projectData.description,
        },
      });
    }

    console.log(`✅ Created candidate: ${candidateData.fullName}`);
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📝 Login credentials (all users):");
  console.log("   Email: [user email]");
  console.log("   Password: password123");
  console.log("\n🏢 Companies created:");
  companies.forEach((c) => console.log(`   - ${c.email} (${c.jobPosts.length} job post(s))`));
  console.log("\n👤 Candidates created:");
  candidates.forEach((c) => console.log(`   - ${c.email}`));
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
