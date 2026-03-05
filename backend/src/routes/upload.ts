import { Router } from "express"
import multer from "multer"
import { randomUUID } from "crypto"
import prisma from "../utils/prisma"
import { type AuthedRequest } from "../middleware/auth"
import { verifyAuthToken } from "../utils/jwt"
import { AUTH_COOKIE_NAME } from "../utils/auth_cookie"

const router = Router()

console.log("UPLOAD ROUTE LOADED")

// ---------------- storage ----------------

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/resumes")
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + "-" + file.originalname
        console.log("file uploaded:", filename)
        cb(null, filename)
    }
})

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

// ---------------- upload resume ----------------

router.post(
    "/resume",
    (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000")
        res.header("Access-Control-Allow-Credentials", "true")
        next()
    },
    upload.single("file"),
    async (req: AuthedRequest, res) => {
        try {

            if (!req.file) {
                return res.status(400).json({
                    error: "No file uploaded"
                })
            }

            // -------- extract userId from cookie --------

            let userId: string | undefined = req.user?.id

            if (!userId) {
                const token =
                    req.cookies?.[AUTH_COOKIE_NAME] ||
                    req.headers?.authorization?.replace("Bearer ", "")

                if (token) {
                    try {
                        const payload = verifyAuthToken(token)
                        userId = payload.sub
                        console.log("userId recovered from token:", userId)
                    } catch (err) {
                        console.log("token verification failed")
                    }
                }
            }

            console.log("userId:", userId)

            if (!userId) {
                return res.status(401).json({
                    error: "Unauthorized"
                })
            }

            // -------- find or upsert candidate profile --------

            const candidate = await prisma.candidateProfile.upsert({
                where: { userId },
                update: {},
                create: {
                    id: randomUUID(),
                    userId,
                    updatedAt: new Date(),
                },
            })

            // -------- ลบ resume เก่าก่อน แล้วค่อย save ใหม่ --------

            await prisma.candidateResume.deleteMany({
                where: { candidateId: candidate.id }
            })

            const url = `/uploads/resumes/${req.file.filename}`

            const resume = await prisma.candidateResume.create({
                data: {
                    candidateId: candidate.id,
                    name: req.file.originalname,
                    url,
                    fileType: req.file.mimetype,
                    fileSize: req.file.size,
                    isPrimary: true
                }
            })

            console.log("resume saved:", resume.id)

            res.json({
                success: true,
                url,
                resume
            })

        } catch (err) {

            console.error("UPLOAD ERROR:", err)

            res.status(500).json({
                error: "Upload failed"
            })
        }
    }
)

export default router