/**
 * cleanup-orphaned-files.ts
 * ลบไฟล์ใน uploads/ ที่ไม่มีใน DB แล้ว
 *
 * วิธีรัน:
 *   cd backend
 *   npx tsx scripts/cleanup-orphaned-files.ts
 *
 * รัน dry-run (ดูอย่างเดียว ไม่ลบจริง):
 *   $env:DRY_RUN="true"; npx tsx scripts/cleanup-orphaned-files.ts
 * # เคลียร์ค่า DRY_RUN ก่อนรันจริง $env:DRY_RUN=""
 * 
 */

import prisma from "../src/utils/prisma";
import fs from "fs";
import path from "path";

const DRY_RUN = process.env.DRY_RUN === "true";
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

function getFilesInFolder(folder: string): string[] {
  const fullPath = path.join(UPLOADS_DIR, folder);
  if (!fs.existsSync(fullPath)) return [];
  return fs.readdirSync(fullPath).filter((f) => f !== ".gitkeep");
}

function deleteFile(folder: string, filename: string) {
  const fullPath = path.join(UPLOADS_DIR, folder, filename);
  if (DRY_RUN) {
    console.log(`  [DRY RUN] would delete: ${folder}/${filename}`);
  } else {
    fs.unlinkSync(fullPath);
    console.log(`  ✅ deleted: ${folder}/${filename}`);
  }
}

function extractFilename(url: string | null | undefined): string | null {
  if (!url) return null;
  return path.basename(url);
}

async function cleanup() {
  console.log(DRY_RUN ? "🔍 DRY RUN mode (ไม่ลบจริง)\n" : "🗑️  Running cleanup...\n");

  // ── profiles ──────────────────────────────────────────────
  console.log("📁 profiles/");
  const profileFiles = getFilesInFolder("profiles");
  const activeProfiles = await prisma.candidateProfile.findMany({
    select: { profileImage: true },
  });
  const activeProfileSet = new Set(
    activeProfiles.map((p) => extractFilename(p.profileImage)).filter(Boolean)
  );
  let count = 0;
  for (const file of profileFiles) {
    if (!activeProfileSet.has(file)) {
      deleteFile("profiles", file);
      count++;
    }
  }
  console.log(`  → ${count} orphaned file(s) found\n`);

  // ── certificates ──────────────────────────────────────────
  console.log("📁 certificates/");
  const certFiles = getFilesInFolder("certificates");
  const activeCerts = await prisma.certificateFile.findMany({
    select: { url: true },
  });
  const activeCertSet = new Set(
    activeCerts.map((c) => extractFilename(c.url)).filter(Boolean)
  );
  count = 0;
  for (const file of certFiles) {
    if (!activeCertSet.has(file)) {
      deleteFile("certificates", file);
      count++;
    }
  }
  console.log(`  → ${count} orphaned file(s) found\n`);

  // ── resumes ───────────────────────────────────────────────
  console.log("📁 resumes/");
  const resumeFiles = getFilesInFolder("resumes");
  const activeResumes = await prisma.candidateResume.findMany({
    select: { url: true },
  });
  const activeResumeSet = new Set(
    activeResumes.map((r) => extractFilename(r.url)).filter(Boolean)
  );
  count = 0;
  for (const file of resumeFiles) {
    if (!activeResumeSet.has(file)) {
      deleteFile("resumes", file);
      count++;
    }
  }
  console.log(`  → ${count} orphaned file(s) found\n`);

  // ── projects ──────────────────────────────────────────────
  console.log("📁 projects/");
  const projectFiles = getFilesInFolder("projects");
  const activeProjects = await prisma.userProjects.findMany({
    select: { fileUrl: true },
  });
  const activeProjectSet = new Set(
    activeProjects.map((p) => extractFilename(p.fileUrl)).filter(Boolean)
  );
  count = 0;
  for (const file of projectFiles) {
    if (!activeProjectSet.has(file)) {
      deleteFile("projects", file);
      count++;
    }
  }
  console.log(`  → ${count} orphaned file(s) found\n`);

  console.log("✨ Cleanup complete!");
  await prisma.$disconnect();
}

cleanup().catch((e) => {
  console.error("Error:", e);
  prisma.$disconnect();
  process.exit(1);
});