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

async function testSuggestJobs() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env");
    return;
  }
  
  console.log(`🔑 Found API Key: ${apiKey.slice(0, 5)}...`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const resumeText = `
    Jane Doe
    Software Engineer
    
    Experience:
    - Frontend Developer at Tech Co (2020-Present): Built React applications, used TypeScript and Tailwind CSS.
    - Junior Web Dev at Startup Inc (2018-2020): Worked with HTML, CSS, JavaScript, and jQuery.
    
    Skills:
    - JavaScript, TypeScript, React, Next.js
    - HTML, CSS, Tailwind CSS
    - Git, GitHub
    - Node.js (Basic)
    
    Education:
    - BS in Computer Science, University of Tech
  `;

  const prompt = `
      Analyze the following resume text and suggest 5 suitable job roles for this candidate.
      For each job role, provide:
      1. Job Title
      2. Match Score (percentage from 0 to 100)
      3. Key Skills from resume that match this role
      4. Missing Skills (if any) that would improve their chances
      5. Brief reasoning why this role is a good fit

      Resume Text:
      ${resumeText}

      Return the result as a JSON object with a "suggestions" array.
      
      Example output:
      {
        "suggestions": [
          {
            "jobTitle": "Frontend Developer",
            "matchScore": 95,
            "matchingSkills": ["React", "TypeScript", "Tailwind CSS"],
            "missingSkills": ["Next.js"],
            "reasoning": "Strong experience in building responsive UIs and using modern JavaScript frameworks."
          }
        ]
      }
      
      Only return the JSON object, no markdown.
    `;

  console.log("🤖 Sending prompt to Gemini...");
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    console.log("✅ Response received:");
    console.log(textResponse);
    
    // Test parsing
    const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
      const parsed = JSON.parse(cleanJson);
      console.log("✅ Parsed JSON successfully:", parsed.suggestions.length, "suggestions");
    } catch (e) {
      console.error("❌ JSON Parse Error:", e);
    }
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

testSuggestJobs();
