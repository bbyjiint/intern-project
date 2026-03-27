import fs from "fs";
import { createRequire } from "module";
import { GoogleGenAI } from "@google/genai";

console.log("🔥 NEW SDK PARSER LOADED");

const require = createRequire(import.meta.url);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // ── ลอง pdfjs-dist โดยตรง ─────────────────────────────────────────────────
  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs" as any);
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const textParts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str ?? "")
        .join(" ");
      textParts.push(pageText);
    }

    const text = textParts.join("\n");
    console.log("📝 pdfjs extracted length:", text.length);
    return text;
  } catch (e1) {
    console.log("⚠️ pdfjs failed, trying pdf-parse:", (e1 as any).message);
  }

  // ── fallback: pdf-parse ───────────────────────────────────────────────────
  try {
    const pdfParseLib = require("pdf-parse");
    const fn = typeof pdfParseLib === "function"
      ? pdfParseLib
      : pdfParseLib.default ?? pdfParseLib;
    const data = await fn(buffer);
    const text = data?.text ?? "";
    console.log("📝 pdf-parse extracted length:", text.length);
    return text;
  } catch (e2) {
    console.log("⚠️ pdf-parse failed:", (e2 as any).message);
  }

  return "";
}

export async function parseResume(filePath: string) {
  try {
    const buffer = fs.readFileSync(filePath);
    const text = await extractTextFromPDF(buffer);

    if (!text || text.length < 20) {
      console.error("❌ Could not extract text from PDF, length:", text.length);
      throw new Error("Failed to extract text from PDF");
    }

    const modelName = "gemini-2.5-flash";
    console.log("Using model:", modelName);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `
You are a professional resume parser.

STRICT OUTPUT RULES:
- Return ONLY valid JSON.
- No markdown, no explanation, no extra text.
- Must start with { and end with }.

Return this exact structure:
{
  "fullName": "",
  "email": "",
  "phoneNumber": "",
  "bio": "",
  "education": [],
  "skills": [],
  "projects": []
}

For "bio":
- Copy the PERSONAL PROFILE or summary section from the resume EXACTLY as written.
- If there is no personal profile section, write a 2-3 sentence summary based on the resume content.

For "projects", include ALL entries (work experience, internships, personal projects, university projects, freelance, etc.):
{
  "name": "project or work name",
  "role": "what the person did",
  "description": "description",
  "startDate": "YYYY-MM or month year or empty",
  "endDate": "YYYY-MM or month year or empty if current/ongoing"
}

For "education":
{
  "university": "university name",
  "educationLevel": "Bachelor or Master or PhD — infer from degree name",
  "degree": "degree name e.g. Bachelor of Engineering",
  "fieldOfStudy": "field of study e.g. Computer Engineering",
  "yearOfStudy": "current year of study — infer from resume text e.g. '4th Year', '3rd Year', 'Graduate'. If graduated or endYear is in the past, use 'Graduate'",
  "gpa": "GPA number as string or empty string if not found"
}

For "skills", return an array of objects (NOT strings). Each skill must have:
{
  "name": "skill name exactly as written in the resume",
  "category": "technical" or "business" — classify as follows:
    - "technical": programming languages, frameworks, tools, software, databases, cloud platforms, hardware, engineering, science, design tools, data analysis tools, etc.
    - "business": communication, teamwork, leadership, problem-solving, time management, adaptability, creativity, negotiation, presentation, interpersonal skills, critical thinking, decision-making, project management, customer service, emotional intelligence, conflict resolution, organization, collaboration, work ethic, attention to detail, etc.
  "level": always "beginner" for every skill — do not infer or change this value.
}

Resume:
${text}
`,
    });

    let rawText = response.text ?? "";
    console.log("🔥 RAW AI RESPONSE:", rawText.slice(0, 200));

    rawText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      rawText = rawText.substring(firstBrace, lastBrace + 1);
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ JSON parse failed:", rawText.slice(0, 200));
      parsedData = {};
    }

    // ── Fallbacks ─────────────────────────────────────────────────────────────
    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const fallbackEmail = emailMatch ? emailMatch[0] : "";

    const phoneMatch = text.match(/(\+?\d{1,3}[- ]?)?\d{8,10}/);
    const fallbackPhone = phoneMatch ? phoneMatch[0] : "";

    const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean);
    const fallbackName = lines.length > 0 && lines[0].length < 80 ? lines[0] : "";

    // ── Normalize skills — handle both old (string[]) and new (object[]) format
    const rawSkills = Array.isArray(parsedData.skills) ? parsedData.skills : [];
    const normalizedSkills = rawSkills.map((s: any) => {
      // Old format: skill was just a string
      if (typeof s === "string") {
        return { name: s, category: "technical", level: "beginner" };
      }
      // New format: already an object — ensure required fields have fallbacks
      return {
        name:     s.name     || "",
        category: s.category === "business" ? "business" : "technical",
        level:    "beginner",
      };
    }).filter((s: any) => s.name);

    // ── Normalize ─────────────────────────────────────────────────────────────
    const result = {
      fullName:    parsedData.fullName    || fallbackName  || "",
      email:       parsedData.email       || fallbackEmail || "",
      phoneNumber: parsedData.phoneNumber || fallbackPhone || "",
      bio:         parsedData.bio         || "",
      education:   Array.isArray(parsedData.education) ? parsedData.education : [],
      skills:      normalizedSkills,
      projects:    Array.isArray(parsedData.projects)  ? parsedData.projects  : [],
    };

    console.log("✅ FINAL PARSED DATA:", JSON.stringify(result).slice(0, 300));
    return result;

  } catch (error) {
    console.error("❌ parseResume error:", error);
    throw error;
  }
}