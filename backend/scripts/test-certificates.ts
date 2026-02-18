import { GoogleGenerativeAI } from "@google/generative-ai";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(dotEnvPath = resolve(process.cwd(), ".env")) {
  if (!existsSync(dotEnvPath)) return;
  const content = readFileSync(dotEnvPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq <= 0) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

async function testCertificates() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env");
    return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-2.5-flash as recently updated
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const jobTitle = "Frontend Developer";
  const resumeText = `
    Jane Doe
    Software Engineer
    
    Skills:
    - React (Basic knowledge)
    - JavaScript
  `;

  // Scenario 1: No Certificates
  console.log("\n🧪 Scenario 1: Resume ONLY (No Certificates)");
  await runAnalysis(model, jobTitle, resumeText, [], "");

  // Scenario 2: With Certificates
  console.log("\n🧪 Scenario 2: Resume + React Certificate");
  const certList = ["React_Mastery_Certificate.pdf"];
  const certContent = "Certificate of Completion. This certifies that Jane Doe has successfully completed the Advanced React & Redux Masterclass. Grade: A+.";
  await runAnalysis(model, jobTitle, resumeText, certList, certContent);
}

async function runAnalysis(model: any, jobTitle: string, resumeText: string, certificates: string[], certificateContents: string) {
    const certificateList = certificates.length > 0 ? certificates.join(", ") : "None";
    
    const prompt = `
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
           - Keyword Link: Match candidate skills to standard industry requirements for this role.

        SKILL EXTRACTION RULES (CRITICAL):
        - Identify key skills strictly required for the role of "${jobTitle}".
        - For each skill, provide a "score" (1-10) based on evidence in the resume.
        - Provide a short "reason" (max 15 words) for the score.
        
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
              "profileStrength": { "score": 80, "reason": "Brief explanation" },
              "skillValidation": { "score": 90, "reason": "Brief explanation" },
              "jobMatch": { "score": 85, "reason": "Brief explanation" }
            }
          }
        }
        
        Only return the JSON object, no markdown.
      `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        
        // Find React score
        const reactSkill = parsed.skills.find((s: any) => s.name.toLowerCase().includes("react"));
        
        console.log("---------------------------------------------------");
        console.log(`📊 Analysis Result:`);
        console.log(`   Profile Strength Score: ${parsed.analysis.breakdown.profileStrength.score}/100`);
        console.log(`   Skill Validation Score: ${parsed.analysis.breakdown.skillValidation.score}/100`);
        if (reactSkill) {
            console.log(`   👉 'React' Skill Score: ${reactSkill.score}/10`);
            console.log(`   Reason: ${reactSkill.reason}`);
        } else {
            console.log(`   👉 'React' Skill not found in top skills.`);
        }
        console.log(`   Reason for Skill Validation: ${parsed.analysis.breakdown.skillValidation.reason}`);
        console.log("---------------------------------------------------");

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

testCertificates();
