import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import prisma from "../utils/prisma";

export const aiRouter = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function parseGeminiJson(raw: string): any {
  const withoutBackticks = raw.replace(/```json?/gi, "").replace(/```/g, "").trim();
  const firstBrace = withoutBackticks.indexOf("{");
  const lastBrace = withoutBackticks.lastIndexOf("}");
  const jsonCandidate =
    firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
      ? withoutBackticks.slice(firstBrace, lastBrace + 1)
      : withoutBackticks;
  const relaxed = jsonCandidate.replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(relaxed);
}

// Company-defined skill profiles per job title (can be extended per real company data)
const JOB_SKILL_PROFILES: Record<
  string,
  { mustHave: string[]; niceToHave: string[] }
> = {
  "frontend developer": {
    mustHave: [
      "JavaScript",
      "TypeScript",
      "React",
      "HTML",
      "CSS",
      "Responsive Design",
      "Git",
    ],
    niceToHave: ["Next.js", "Tailwind CSS", "Testing (Jest/RTL)", "REST API"],
  },
  "backend developer": {
    mustHave: [
      "Node.js",
      "REST API",
      "Database Design",
      "SQL",
      "Git",
    ],
    niceToHave: ["TypeScript", "Express", "Prisma ORM", "Docker", "Authentication & Authorization"],
  },
  "full stack developer": {
    mustHave: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "REST API",
      "Database Design",
      "Git",
    ],
    niceToHave: ["Next.js", "Prisma ORM", "Testing", "CI/CD basics"],
  },
  "mobile developer": {
    mustHave: [
      "iOS/Android Development",
      "React Native/Flutter",
      "API Integration",
      "Git",
      "Mobile UI Design",
    ],
    niceToHave: ["Publishing Apps", "Performance Optimization", "Firebase"],
  },
  "qa engineer": {
    mustHave: [
      "Manual Testing",
      "Automated Testing",
      "Test Plans",
      "Bug Tracking",
      "Git",
    ],
    niceToHave: ["Selenium", "Cypress", "Load Testing", "API Testing"],
  },
  "devops engineer": {
    mustHave: [
      "CI/CD Pipelines",
      "Docker",
      "Cloud Services (AWS/GCP)",
      "Linux Administration",
      "Scripting (Bash/Python)",
    ],
    niceToHave: ["Kubernetes", "Terraform", "Monitoring Tools", "Security Best Practices"],
  },
  "business analyst": {
    mustHave: [
      "Requirements Gathering",
      "Data Analysis",
      "Process Modeling",
      "Documentation",
      "Stakeholder Communication",
    ],
    niceToHave: ["SQL", "Tableau/PowerBI", "Agile Methodologies", "User Stories"],
  },
  "graphic designer": {
    mustHave: [
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Creativity",
      "Typography",
      "Layout Design",
    ],
    niceToHave: ["Adobe After Effects", "Figma", "Video Editing", "Branding"],
  },
  "human resources": {
    mustHave: [
      "Recruitment",
      "Employee Relations",
      "Communication",
      "Labor Laws",
      "Interviewing",
    ],
    niceToHave: ["HR Software", "Onboarding", "Training & Development", "Conflict Resolution"],
  },
  "accountant": {
    mustHave: [
      "Bookkeeping",
      "Financial Reporting",
      "Tax Preparation",
      "Auditing",
      "Budgeting & Forecasting",
    ],
    niceToHave: ["Excel Proficiency", "Accounting Software", "Attention to Detail", "Compliance"],
  },
  "sales representative": {
    mustHave: [
      "Lead Generation",
      "Negotiation",
      "Communication",
      "CRM Management",
      "Closing Deals",
    ],
    niceToHave: ["Presentation Skills", "Market Research", "Networking", "Cold Calling"],
  },
  "software engineer": {
    mustHave: [
      "Programming Fundamentals",
      "Data Structures",
      "Algorithms",
      "Git",
      "Problem Solving",
    ],
    niceToHave: ["System Design Basics", "Testing", "Cloud Basics"],
  },
  "data scientist": {
    mustHave: [
      "Python",
      "Statistics",
      "Machine Learning",
      "Pandas",
      "SQL",
      "Data Visualization",
    ],
    niceToHave: ["Deep Learning", "TensorFlow or PyTorch", "Big Data Tools"],
  },
  "machine learning engineer": {
    mustHave: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Data Structures",
      "Algorithms",
    ],
    niceToHave: ["TensorFlow or PyTorch", "MLOps Basics", "Cloud Platforms"],
  },
  "product manager": {
    mustHave: [
      "Product Discovery",
      "User Research",
      "Roadmapping",
      "Stakeholder Communication",
      "Data Analysis",
    ],
    niceToHave: ["A/B Testing", "SQL", "Wireframing", "Agile/Scrum"],
  },
  "ux/ui designer": {
    mustHave: [
      "User Research",
      "Wireframing",
      "Prototyping",
      "UI Design",
      "Figma or similar tools",
    ],
    niceToHave: ["Design System", "Usability Testing", "Interaction Design"],
  },
  "marketing intern": {
    mustHave: [
      "Content Creation",
      "Social Media",
      "Basic Analytics",
      "Communication",
    ],
    niceToHave: ["SEO Basics", "Paid Ads Basics", "Canva or design tools"],
  },
};

function getJobSkillProfile(jobTitle: string | undefined) {
  if (!jobTitle) {
    return { mustHave: [] as string[], niceToHave: [] as string[] };
  }
  const key = jobTitle.toLowerCase().trim();
  return (
    JOB_SKILL_PROFILES[key] || {
      mustHave: [],
      niceToHave: [],
    }
  );
}

aiRouter.post("/analyze-resume", requireAuth, async (req, res) => {
  try {
    const { text, certificates, certificateContents } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const certificateList =
      certificates && Array.isArray(certificates)
        ? certificates.join(", ")
        : "None";

    const certificateText =
      typeof certificateContents === "string" && certificateContents.trim().length > 0
        ? certificateContents
        : "No certificate or transcript text was provided.";

    const prompt = `
      Analyze the following text and determine if it is a valid resume or CV (Curriculum Vitae).
      
      STEP 1: Check if the text is a resume.
      - A valid resume should contain: Contact Info, Education, Work Experience, Skills, or Projects.
      - If the text is too short (e.g. less than 50 characters), random characters, code snippets, or clearly not a resume, it is INVALID.
      
      STEP 2: If INVALID, return:
      {
        "isValidResume": false,
        "reason": "Brief explanation why this is not considered a valid resume."
      }

      STEP 3: If VALID, extract key profile data.
      - Additional Evidence: You also have access to uploaded certificates/transcripts for this candidate.
        - Uploaded Files List: ${certificateList}
        - Uploaded Files Content: 
          ${certificateText}
      - Extract Skills: You MUST estimate a proficiency score (1-10) for each skill based on combined evidence from the resume text AND the uploaded certificates/transcripts (if relevant). If unsure, assign a default of 5.
      Return:
      {
        "isValidResume": true,
        "personalInfo": {
          "fullName": "John Doe",
          "email": "john@example.com",
          "phoneNumber": "123-456-7890",
          "location": "Bangkok, Thailand",
          "links": ["linkedin.com/in/johndoe"]
        },
        "education": [
          {
            "university": "Chulalongkorn University",
            "degree": "Bachelor of Engineering",
            "fieldOfStudy": "Computer Engineering",
            "gpa": "3.50",
            "startDate": "2020",
            "endDate": "2024"
          }
        ],
        "experience": [
          {
            "title": "Software Intern",
            "company": "Agoda",
            "startDate": "2023-06",
            "endDate": "2023-08",
            "description": "Worked on backend services..."
          }
        ],
        "skills": [
          { "name": "Python", "score": 8.5 },
          { "name": "React", "score": 7.0 }
        ]
      }
      
      Resume Text:
      ${text}
      
      Only return the JSON object, no markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    try {
      const parsedData = parseGeminiJson(textResponse);
      
      if (parsedData.isValidResume === false) {
        return res.status(400).json({ error: parsedData.reason || "The uploaded file does not appear to be a valid resume." });
      }

      // Save to database
      if ((req as AuthedRequest).user && (req as AuthedRequest).user?.role === 'CANDIDATE') {
        const userId = (req as AuthedRequest).user!.id;
        const candidate = await prisma.candidateProfile.findUnique({
          where: { userId }
        });

        if (candidate) {
          await prisma.resumeAnalysis.create({
            data: {
              candidateId: candidate.id,
              resumeText: text,
              analysisResult: parsedData,
              skills: parsedData.skills || [],
              jobTitle: 'General Analysis'
            }
          });
        }
      }

      return res.json(parsedData);
    } catch (e) {
      console.error("Failed to parse Gemini response:", textResponse);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return res.status(500).json({ error: error.message || "AI Analysis failed" });
  }
});

aiRouter.post("/suggest-skills", requireAuth, async (req, res) => {
  try {
    const { jobTitle, resumeText, certificates, certificateContents } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ error: "Job title is required" });
    }

    const certificateList =
      certificates && Array.isArray(certificates)
        ? certificates.join(", ")
        : "None";

    const jobProfile = getJobSkillProfile(jobTitle);

    // Use gemini-2.0-flash-lite for better availability and quota management
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";
    if (resumeText) {
      prompt = `
        Analyze the following resume text against the desired job title "${jobTitle}".
        
        PERFORM A "MASTER SCORING" ANALYSIS (STRICTLY FOLLOW THESE 3 CRITERIA):

        1. Profile Strength (40%): 
           - Criteria: Correctness and completeness of data.
           - Check: Does the candidate have "Certificates" or "Transcripts" mentioned in the text OR uploaded as files?
           - Uploaded Files List: ${certificateList}
           - Uploaded Files Content (Use this to verify skills/grades):
             ${certificateContents || "No text extracted from certificates."}
           - Logic: Give high score if project descriptions are detailed and certificates/transcripts are present.

        2. Skill Validation (20%):
           - Criteria: Evidence of skills in the resume and uploaded documents.
           - Logic: Evaluate the "Evidence Strength" of the skills found in the resume AND uploaded certificates/transcripts.
           - Verification: If a skill in the resume is supported by an uploaded certificate or a high grade in a transcript (from Uploaded Files Content), INCREASE this score significantly.
           - Penalty: If a skill is claimed but has no supporting project/experience or certificate, reduce this score.
           - Breakdown: Classify skill evidence as Beginner, Intermediate, or Advanced based on context.

        3. Job Matching (40%):
           - Criteria: Suitability for "${jobTitle}".
           - Logic: Perform a "Semantic Match" of courses, activities, and projects against the Job Description of a "${jobTitle}".
           - Coursework Check: Look for relevant course names and grades in the "Uploaded Files Content" (Transcripts) that match the job requirements.
           - Keyword Link: Match candidate skills to standard industry requirements for this role AND the company-defined required skills below.

        COMPANY REQUIRED SKILL PROFILE (STRICT SOURCE OF TRUTH):
        - Must-have skills for "${jobTitle}": ${
          jobProfile.mustHave.length > 0
            ? jobProfile.mustHave.join(", ")
            : "None specified"
        }
        - Nice-to-have skills for "${jobTitle}": ${
          jobProfile.niceToHave.length > 0
            ? jobProfile.niceToHave.join(", ")
            : "None specified"
        }

        You MUST use this skill profile when scoring "Job Matching" and "Skill Validation":
        - For each MUST-HAVE skill, check if there is strong, weak, or no evidence in:
          - Resume text
          - Uploaded certificate contents
        - Treat missing MUST-HAVE skills as a serious gap (lower Job Matching score).
        - NICE-TO-HAVE skills can increase the score but are not mandatory.

        SKILL EXTRACTION RULES (CRITICAL):
        - Identify 10 key skills strictly required for the role of "${jobTitle}".
        - Do NOT simply extract skills present in the resume. You must list skills that a "${jobTitle}" SHOULD have.
        - If the resume is for a different field (e.g., Resume is Software Engineer but Job is HR), list HR skills (e.g., Recruitment, Communication) and give them LOW scores because they are missing from the resume.
        - For each skill, provide a "score" (1-10) based on evidence in the resume.
        - Provide a short "reason" (max 15 words) for the score.
        - Classify each skill as "Hard Skill" or "Soft Skill".

        In addition, you MUST build an explicit skill-to-requirement match table:
        - For every skill in the COMPANY REQUIRED SKILL PROFILE, indicate:
          - "requiredLevel": "must-have" or "nice-to-have"
          - "matched": true if there is clear evidence, otherwise false
          - "evidence": very short explanation (max 15 words) or "-" if not matched.

        Resume Text:
        ${resumeText}

        Return the result as a JSON object with this exact structure:
        {
          "skills": [
            { "name": "Skill Name", "score": 8.5, "reason": "Reason string", "type": "Hard Skill" }
          ],
          "analysis": {
            "overallScore": 85,
            "breakdown": {
              "profileStrength": { "score": 80, "reason": "Brief explanation (mention certificates if present)" },
              "skillValidation": { "score": 90, "reason": "Brief explanation of evidence strength" },
              "jobMatch": { "score": 85, "reason": "Brief explanation of job fit" }
            },
            "jobSkillMatches": [
              {
                "skill": "React",
                "requiredLevel": "must-have",
                "matched": true,
                "evidence": "Built project using React in internship."
              }
            ],
            "feedback": {
              "strengths": ["Strength 1", "Strength 2"],
              "weaknesses": ["Weakness 1", "Weakness 2"],
              "improvements": ["Actionable tip 1", "Actionable tip 2"]
            }
          }
        }
        
        Only return the JSON object, no markdown.
      `;
    } else {
      prompt = `
        Suggest 10 key technical and soft skills for a "${jobTitle}" role.
        Give each skill a relevance score from 1 to 10 (representing importance).
        Return the result as a JSON object with a "skills" array, where each item has "name" (string), "score" (number), "reason" (string), and "type" (string: "Hard Skill" or "Soft Skill").
        
        Example output:
        {
          "skills": [
            { "name": "Python", "score": 9.0, "reason": "Core language for backend development.", "type": "Hard Skill" },
            { "name": "Teamwork", "score": 8.0, "reason": "Essential for collaborative environments.", "type": "Soft Skill" }
          ]
        }
        
        Only return the JSON object, no markdown.
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    try {
      const parsedData = parseGeminiJson(textResponse);

      // Save to database if resume text was analyzed
      if (resumeText && (req as AuthedRequest).user && (req as AuthedRequest).user?.role === 'CANDIDATE') {
        const userId = (req as AuthedRequest).user!.id;
        const candidate = await prisma.candidateProfile.findUnique({
          where: { userId }
        });

        if (candidate) {
          await prisma.resumeAnalysis.create({
            data: {
              candidateId: candidate.id,
              resumeText: resumeText,
              analysisResult: parsedData.analysis || {},
              skills: parsedData.skills || [],
              jobTitle: jobTitle
            }
          });
        }
      }

      return res.json(parsedData);
    } catch (e) {
      console.error("Failed to parse Gemini response for suggestions:", textResponse);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

  } catch (error: any) {
    console.error("AI Suggestion Error:", error);
    return res.status(500).json({ error: error.message || "AI Suggestion failed" });
  }
});

// New Endpoint: Get Analysis History
aiRouter.get("/history", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!candidate) {
      return res.status(404).json({ error: "Candidate profile not found" });
    }

    const history = await prisma.resumeAnalysis.findMany({
      where: { candidateId: candidate.id },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to last 20 analyses
    });

    return res.json({ history });
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return res.status(500).json({ error: "Failed to fetch history" });
  }
});

aiRouter.post("/suggest-jobs", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { resumeText } = req.body;
    const userId = req.user?.id;

    if (!resumeText && !userId) {
      return res.status(400).json({ error: "Resume text or user context is required" });
    }

    let candidateContext = "";
    let verificationData = {
      hasTranscript: false,
      certificateCount: 0,
      hasProjectDescription: false,
    };

    // 1. If we have a logged-in user, fetch their profile data
    if (userId) {
      const profile = await prisma.candidateProfile.findUnique({
        where: { userId },
        include: {
          WorkHistory: true,
          UserSkill: {
            include: {
              Skills: true
            }
          },
          CandidateUniversity: {
            include: {
              University: true
            }
          },
          CertificateFile: true,
          CandidateContactFile: true,
          ResumeAnalysis: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (profile) {
        // Use stored resume text if not provided in request
        if (!resumeText && profile.ResumeAnalysis.length > 0) {
          resumeText = profile.ResumeAnalysis[0].resumeText;
        }

        // Prepare Verification Data for AI Scoring
        const transcriptFile = profile.CandidateContactFile.find(f => 
          f.type === "OTHER" && (f.name.toLowerCase().includes("transcript") || f.name.toLowerCase().includes("grade"))
        );
        verificationData.hasTranscript = !!transcriptFile;
        verificationData.certificateCount = profile.CertificateFile.length;
        verificationData.hasProjectDescription = profile.WorkHistory.some(w => w.description && w.description.length > 20);

        candidateContext += `
        Candidate Profile Data:
        - Desired Position: ${profile.desiredPosition || "Not specified"}
        - Major: ${profile.major || "Not specified"}
        - Study Year: ${profile.studyYear || "Not specified"}
        - Bio: ${profile.bio || ""}
        
        Education:
        ${profile.CandidateUniversity.map(u => `- ${u.educationLevel} at ${u.University.name} (GPA: ${u.gpa || "N/A"})`).join("\n")}
        
        Work History:
        ${profile.WorkHistory.map(w => `- ${w.position} at ${w.companyName} (${w.description || ""})`).join("\n")}
        
        Skills (Self-Rated):
        ${profile.UserSkill.map(s => `- ${s.Skills.name} (Rating: ${s.rating || "?"}/10)`).join("\n")}
        
        Verification Status:
        - Has Transcript File: ${verificationData.hasTranscript}
        - Verified Certificates Count: ${verificationData.certificateCount}
        - Has Detailed Project Descriptions: ${verificationData.hasProjectDescription}
        `;
      }
    }

    // 2. Append resume text if provided
    if (resumeText) {
      candidateContext += `
      
      Resume Text Content:
      ${resumeText}
      `;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert AI Recruiter using a specific "Master Scoring" formula to match candidates to jobs.
      Analyze the candidate information and suggest 5 suitable job roles.

      SCORING LOGIC (The Master Scoring):
      1. Profile Strength (40%): 
         - Check if "Verification Status" indicates they have a transcript and certificates.
         - Check if project descriptions are detailed (consistency).
         - If Resume Text and Profile Data are consistent, give high marks here.
      2. Skill Validation (20%):
         - Use the Self-Rated scores as a baseline.
         - If the resume text supports the claimed skill rating (e.g. mentions advanced usage), keep the score high.
         - If there is a mismatch (claims 10/10 but resume is weak), apply a penalty.
      3. Job Matching (40%):
         - Semantic Match: Does their Major/Education + Work History fit the job?
         - Keyword Link: Do their skills match the job requirements?

      You also have access to a COMPANY SKILL LIBRARY that defines required skills per role.
      Use it as the reference for what skills each role SHOULD have:

      ${Object.entries(JOB_SKILL_PROFILES)
        .map(
          ([title, profile]) => `
      - ${title}:
        - must-have: ${profile.mustHave.join(", ")}
        - nice-to-have: ${profile.niceToHave.join(", ")}`
        )
        .join("\n")}

      When you propose a jobTitle:
      - Infer the closest matching entry from this library (ignore case).
      - Use the must-have skills to decide "matchingSkills" and "missingSkills".

      Candidate Information:
      ${candidateContext}

      For each job role, provide:
      1. Job Title (in English)
      2. Match Score (0-100 calculated using the 40/20/40 weighted logic above)
      3. Key Skills from their profile/resume that match this role (based on COMPANY SKILL LIBRARY)
      4. Missing Skills (if any) that would improve their chances (based on COMPANY SKILL LIBRARY)
      5. Brief reasoning why this role is a good fit (in Thai Language), mentioning which factors (Profile/Skill/Match) contributed most.

      Return the result as a JSON object with a "suggestions" array.
      
      Example output:
      {
        "suggestions": [
          {
            "jobTitle": "Frontend Developer",
            "matchScore": 88,
            "matchingSkills": ["React", "TypeScript", "Tailwind CSS"],
            "missingSkills": ["Next.js"],
            "reasoning": "คะแนนสูงจาก Profile Strength ที่มี Transcript และ Project ชัดเจน (40%) และสกิล React ที่ตรงกับงาน (40%) แต่หักคะแนนส่วน Skill Validation เล็กน้อยเนื่องจากยังขาดหลักฐานโปรเจกต์จริง"
          }
        ]
      }
      
      Only return the JSON object, no markdown.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    try {
      const parsedData = parseGeminiJson(textResponse);
      return res.json(parsedData);
    } catch (e) {
      console.error("Failed to parse Gemini response for job suggestions:", textResponse);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

  } catch (error: any) {
    console.error("AI Job Suggestion Error:", error);
    return res.status(500).json({ error: error.message || "AI Job Suggestion failed" });
  }
});
