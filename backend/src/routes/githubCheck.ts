import { Router } from "express";
import prisma from "../utils/prisma";

export const githubRouter = Router();

// ดึง username และ repo จาก URL
const extractGithubInfo = (url: string): { username: string; repo: string } | null => {
  try {
    const cleanUrl = url.trim().replace(/\/$/, "");
    // รองรับ github.com/username/repo เท่านั้น (ต้องมี repo)
    const repoRegex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9_.-]+)$/i;
    const match = cleanUrl.match(repoRegex);
    if (match) return { username: match[1], repo: match[2] };
    return null;
  } catch {
    return null;
  }
};

githubRouter.post("/verify-github", async (req, res) => {
  const { githubUrl, projectId } = req.body;

  if (!githubUrl) {
    return res.status(400).json({ success: false, message: "กรุณาส่ง GitHub URL" });
  }

  // ต้องเป็น repo URL เท่านั้น
  const info = extractGithubInfo(githubUrl);
  if (!info) {
    return res.status(400).json({
      success: false,
      message: "รูปแบบ URL ไม่ถูกต้อง (ต้องเป็น github.com/username/repo-name)",
    });
  }

  const GITHUB_HEADERS: Record<string, string> = {
    "User-Agent": "Intern-Verification-System",
    Accept: "application/vnd.github+json",
  };

  // ดึง project startDate / endDate จาก DB เพื่อเช็คช่วงเวลา
  let projectStartDate: Date | null = null;
  let projectEndDate: Date | null = null;

  if (projectId) {
    try {
      const proj = await prisma.userProjects.findUnique({
        where: { id: projectId },
        select: { startDate: true, endDate: true },
      });
      if (proj) {
        projectStartDate = proj.startDate ? new Date(proj.startDate) : null;
        projectEndDate = proj.endDate ? new Date(proj.endDate) : null;
      }
    } catch {
      // ไม่มี project ก็ข้ามไป
    }
  }

  try {
    // ── 1. เช็ค Repo exist & public ──────────────────────────
    const repoRes = await fetch(
      `https://api.github.com/repos/${info.username}/${info.repo}`,
      { headers: GITHUB_HEADERS }
    );

    if (repoRes.status === 404) {
      return res.json({
        success: false,
        message: "ไม่พบ Repository นี้ หรือถูกตั้งเป็น Private",
        checks: { repoExists: false, hasCommitsInPeriod: false, hasEnoughCommits: false },
      });
    }

    if (!repoRes.ok) {
      return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อกับ GitHub API" });
    }

    const repoData = await repoRes.json() as any;

    if (repoData.private) {
      return res.json({
        success: false,
        message: "Repository นี้เป็น Private ไม่สามารถตรวจสอบได้",
        checks: { repoExists: true, hasCommitsInPeriod: false, hasEnoughCommits: false },
      });
    }

    // ── 2 & 3. เช็ค Commits ในช่วงเวลา + จำนวน ≥ 3 ──────────
    // ถ้าไม่มีวันที่ project → เช็คแค่ว่ามี commits ≥ 3 ทั้งหมด
    let commitsUrl = `https://api.github.com/repos/${info.username}/${info.repo}/commits?per_page=100`;

    if (projectStartDate) {
      commitsUrl += `&since=${projectStartDate.toISOString()}`;
    }
    if (projectEndDate) {
      // endDate + 1 วัน เพื่อให้นับวันสุดท้ายด้วย
      const endPlusOne = new Date(projectEndDate);
      endPlusOne.setDate(endPlusOne.getDate() + 1);
      commitsUrl += `&until=${endPlusOne.toISOString()}`;
    }

    const commitsRes = await fetch(commitsUrl, { headers: GITHUB_HEADERS });
    let commitCount = 0;
    let hasCommitsInPeriod = false;

    if (commitsRes.ok) {
      const commits = await commitsRes.json() as any[];
      commitCount = Array.isArray(commits) ? commits.length : 0;
      hasCommitsInPeriod = commitCount > 0;
    }

    const hasEnoughCommits = commitCount >= 3;

    // ── ตัดสินผล ─────────────────────────────────────────────
    const checks = {
      repoExists: true,
      hasCommitsInPeriod,
      hasEnoughCommits,
    };

    // ผ่านถ้า: repo public + มี commits ในช่วงเวลา + commits ≥ 3
    const hasPeriod = projectStartDate || projectEndDate;
    const passed =
      checks.repoExists &&
      (hasPeriod ? checks.hasCommitsInPeriod : true) &&
      checks.hasEnoughCommits;

    if (passed) {
      if (projectId) {
        await prisma.userProjects.update({
          where: { id: projectId },
          data: { githubVerified: true },
        });
      }

      return res.json({
        success: true,
        message: "ตรวจสอบผ่าน (Verified)",
        checks,
        data: {
          repoName: repoData.name,
          repoUrl: repoData.html_url,
          commitCount,
        },
      });
    } else {
      // บอกให้ชัดว่าล้มเหลวเพราะอะไร
      let failReason = "";
      if (hasPeriod && !checks.hasCommitsInPeriod) {
        failReason = `ไม่พบ commits ในช่วงเวลาที่กำหนด (${projectStartDate?.toLocaleDateString("th-TH") ?? ""} - ${projectEndDate?.toLocaleDateString("th-TH") ?? ""})`;
      } else if (!checks.hasEnoughCommits) {
        failReason = `จำนวน commits น้อยเกินไป (พบ ${commitCount} commits, ต้องการอย่างน้อย 3)`;
      }

      return res.json({
        success: false,
        message: failReason || "ตรวจสอบไม่ผ่าน",
        checks,
        data: { commitCount },
      });
    }
  } catch (error: unknown) {
    console.error("GitHub Verification Error:", error instanceof Error ? error.message : error);
    return res.status(500).json({ success: false, message: "ระบบตรวจสอบขัดข้อง" });
  }
});