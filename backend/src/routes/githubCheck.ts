import express from "express";
import { Router } from "express";
import prisma from "../utils/prisma";

export const githubRouter = Router();

interface GitHubUserResponse {
  login: string;
  public_repos: number;
  html_url: string;
  message?: string; // เผื่อกรณี GitHub ส่ง error message กลับมา
}

// ฟังก์ชันแยก Username ออกจาก URL ของ GitHub
const extractGithubUsername = (url: string): string | null => {
  try {
    // ลบช่องว่าง และ slash ตัวสุดท้ายออก (ถ้ามี)
    const cleanUrl = url.trim().replace(/\/$/, "");
    const regex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)$/i;
    const match = cleanUrl.match(regex);
    
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

// API สำหรับตรวจสอบ GitHub Link
githubRouter.post("/verify-github", async (req, res) => {
  const { githubUrl, projectId } = req.body;

  if (!githubUrl) {
    return res.status(400).json({ success: false, message: "กรุณาส่ง GitHub URL" });
  }

  // 1. ตรวจสอบว่า URL ถูกต้อง และดึง Username ออกมา
  const username = extractGithubUsername(githubUrl);
  if (!username) {
    return res.status(400).json({ 
      success: false, 
      message: "รูปแบบ GitHub URL ไม่ถูกต้อง (ต้องเป็น github.com/username)" 
    });
  }

  try {
    // 2. เรียกใช้ GitHub API (แบบ Public ไม่ต้องใช้ Token)
    // หมายเหตุ: GitHub จำกัด Rate Limit สำหรับคนไม่ใส่ Token ไว้ที่ 60 ครั้ง/ชั่วโมง
    // ถ้าใช้เยอะ แนะนำให้แนบ headers: { Authorization: `token YOUR_GITHUB_TOKEN` }
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        "User-Agent": "Intern-Verification-System" // GitHub บังคับให้ใส่ User-Agent
      }
    });

    // 3. ตรวจว่า Account เข้าถึงได้ไหม (Public ไหม)
    if (response.status === 404) {
      return res.json({ 
        success: false, 
        message: "ไม่พบบัญชีนี้ หรือบัญชีถูกตั้งเป็น Private" 
      });
    }

    if (!response.ok) {
      return res.status(500).json({ 
        success: false, 
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อกับ GitHub API" 
      });
    }

    const data = (await response.json()) as GitHubUserResponse;

    if (data.public_repos > 0) {
      
      // ตรวจสอบผ่านปุ๊บ ให้อัปเดต DB ทันที
      if (projectId) {
        await prisma.userProjects.update({
          where: { id: projectId },
          data: { githubVerified: true }
        });
      }

      return res.json({ 
        success: true, 
        message: "ตรวจสอบผ่าน (Verified)",
        data: { 
           username: data.login, 
           publicRepos: data.public_repos, 
           profileUrl: data.html_url 
        }
      });
    } else {
      return res.status(400).json({ success: false, message: "ไม่มี Public Repo" });
    }

  } catch (error: unknown) {
    console.error("GitHub Verification Error:", error instanceof Error ? error.message : error);
    return res.status(500).json({ success: false, message: "ระบบตรวจสอบขัดข้อง" });
  }
});