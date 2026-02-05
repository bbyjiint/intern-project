np# เว็บเด็กฝึกงาน - Intern Website

เว็บแอปพลิเคชันสำหรับการฝึกงานที่สร้างด้วย **Next.js 14** + TypeScript + Tailwind CSS สำหรับ Frontend

## 📍 ตำแหน่งโปรเจกต์

⚠️ **สำคัญ**: โปรเจกต์อยู่ที่ `intern-project/` (ไม่ใช่ root directory)  
ต้อง `cd intern-project` ก่อนรันคำสั่ง npm

## 🏗️ โครงสร้างโปรเจกต์

```
.
├── frontend/          # React + Vite + TypeScript + Tailwind CSS
├── backend/           # Node.js + Express + Prisma + PostgreSQL
└── package.json       # Root package.json สำหรับจัดการ workspaces
```

## การติดตั้ง

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า Database

1. สร้าง PostgreSQL database
2. คัดลอกไฟล์ `.env.example` เป็น `.env` ในโฟลเดอร์ `backend/`
3. แก้ไข `DATABASE_URL` ในไฟล์ `.env` ให้ตรงกับ database ของคุณ

```env
DATABASE_URL="postgresql://user:password@localhost:5432/intern_website?schema=public"
```

### 3. รัน Prisma Migrations

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

## การรันโปรเจกต์

## Note: Authentication (production-standard)

- Backend จะตั้งค่า JWT ลงใน **HTTP-only cookie** (ชื่อ cookie: `auth`)  
  Frontend **ไม่อ่าน/ไม่เก็บ JWT** ใน `localStorage`/`sessionStorage`
- ทุก request ที่ต้อง auth จะพึ่งพา cookie ที่ browser ส่งให้อัตโนมัติ (`fetch` ใช้ `credentials: "include"`)
- ข้อดี: login จะ **sync ทุกแท็บ** และลดความเสี่ยงจาก XSS (เพราะ JS อ่าน token ไม่ได้)
- Logout จะเรียก `POST /api/auth/logout` เพื่อ clear cookie
- (Optional) “Remember me” จะตั้ง cookie ให้เป็น persistent (ประมาณ 30 วัน); ถ้าไม่เลือกจะเป็น session cookie

### รัน Frontend และ Backend พร้อมกัน

```bash
npm run dev
```

### รันแยกกัน

**Frontend:**
```bash
npm run dev:frontend
```

**Backend:**
```bash
npm run dev:backend
```

## สคริปต์ที่มีให้

### Root Level
- `npm run dev` - รัน frontend และ backend พร้อมกัน
- `npm run build` - Build ทั้ง frontend และ backend

### Frontend
- `npm run dev` - รัน development server (port 3000)
- `npm run build` - Build สำหรับ production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - รัน development server (port 5000)
- `npm run build` - Build TypeScript
- `npm run start` - รัน production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - เปิด Prisma Studio

## เทคโนโลยีที่ใช้

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- TypeScript

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/users` - ดึงข้อมูล users
- `POST /api/users` - สร้าง user ใหม่

## License

MIT



