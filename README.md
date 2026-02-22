# เว็บเด็กฝึกงาน - Intern Website

เว็บแอปพลิเคชันสำหรับการฝึกงานที่สร้างด้วย **Next.js 14** + TypeScript + Tailwind CSS สำหรับ Frontend และ **Node.js + Express + Prisma** สำหรับ Backend

## 🏗️ โครงสร้างโปรเจกต์

```
.
├── frontend-next/     # Next.js 14 + TypeScript + Tailwind CSS
├── backend/           # Node.js + Express + Prisma + PostgreSQL
├── docker-compose.yml # Docker configuration สำหรับ development
└── package.json       # Root package.json
```

## 🚀 Quick Start (แนะนำ - ใช้ Docker)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/Mac)
- [Git](https://git-scm.com/)

### สำหรับสมาชิกทีมใหม่

1. **Clone repository**
   ```bash
   git clone https://github.com/your-org/intern-project.git
   cd intern-project
   ```

2. **ตั้งค่า Environment Variables**

   สร้างไฟล์ `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@postgres:5432/intern_website?schema=public"
   JWT_SECRET="your-secret-key-change-this"
   CORS_ORIGIN="http://localhost:3000"
   FILE_STORAGE_PROVIDER="local"
   NODE_ENV="development"
   ```

   (Optional) สร้างไฟล์ `frontend-next/.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   ```

3. **รันด้วย Docker**
   ```bash
   # Build และ start ทุก services
   docker compose up --build

   # หรือรันใน background
   docker compose up -d
   ```

4. **Generate Prisma Client** (ครั้งแรกเท่านั้น)
   ```bash
   docker compose exec backend npm run prisma:generate
   ```

5. **เข้าถึง Services**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **API Health Check**: http://localhost:5000/api/health
   - **PostgreSQL**: localhost:5433

✅ **เสร็จแล้ว!** ทุกอย่างควรทำงานแล้ว

---

## 🐳 Docker Commands

### การใช้งานพื้นฐาน

```bash
# Start ทุก services
docker compose up -d

# ดู logs
docker compose logs -f

# ดู logs ของ service เฉพาะ
docker compose logs -f backend
docker compose logs -f frontend

# Restart service
docker compose restart backend

# Stop ทุก services
docker compose down

# Stop และลบข้อมูล database
docker compose down -v

# Rebuild หลังจากเปลี่ยน Dockerfile หรือ dependencies
docker compose up --build
```

### Prisma Commands

```bash
# Generate Prisma Client
docker compose exec backend npm run prisma:generate

# Run migrations
docker compose exec backend npm run prisma:migrate

# เปิด Prisma Studio (Database GUI)
docker compose exec backend npm run prisma:studio
```

### การเข้าไปใน Container

```bash
# เข้าไปใน backend container
docker compose exec backend sh

# เข้าไปใน frontend container
docker compose exec frontend sh

# เข้าไปใน database
docker compose exec postgres psql -U postgres -d intern_website
```

---

## 👥 Team Collaboration

### Git Workflow

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes และ test**
   ```bash
   docker compose up
   # Test your changes
   ```

4. **Commit และ push**
   ```bash
   git add .
   git commit -m "Add: description of changes"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request บน GitHub**

### สิ่งที่ควร Commit

✅ **DO Commit:**
- Source code
- Configuration files (`package.json`, `docker-compose.yml`, etc.)
- Database schema (`prisma/schema.prisma`)
- SQL seed files
- Documentation

❌ **DON'T Commit:**
- `node_modules/`
- `.env` files
- `dist/`, `.next/`
- `uploads/` (user files)

### Database Migrations

เมื่อมีการเปลี่ยน schema:

1. **Update `prisma/schema.prisma`**
2. **Create migration**
   ```bash
   docker compose exec backend npm run prisma:migrate
   ```
3. **Commit migration files**
   ```bash
   git add prisma/migrations/
   git commit -m "Add: migration for new table"
   ```

เมื่อ teammate เพิ่ม migration:

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```
2. **Apply migrations**
   ```bash
   docker compose exec backend npm run prisma:migrate
   ```

📖 **ดูรายละเอียดเพิ่มเติม**: [TEAM_COLLABORATION.md](./TEAM_COLLABORATION.md)

---

## 📦 การติดตั้งแบบ Local (ไม่ใช้ Docker)

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm หรือ yarn

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup database**
   ```bash
   # สร้าง database
   createdb intern_website
   
   # หรือใช้ psql
   psql -U postgres
   CREATE DATABASE intern_website;
   ```

3. **Setup environment**
   ```bash
   # สร้างไฟล์ backend/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/intern_website?schema=public"
   JWT_SECRET="your-secret-key"
   CORS_ORIGIN="http://localhost:3000"
   FILE_STORAGE_PROVIDER="local"
   ```

4. **Generate Prisma Client และ run migrations**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start backend**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend-next
   npm install
   ```

2. **Setup environment** (optional)
   ```bash
   # สร้างไฟล์ frontend-next/.env.local
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   ```

3. **Start frontend**
   ```bash
   npm run dev
   ```

---

## 🔐 Authentication

- Backend ใช้ **HTTP-only cookies** สำหรับ JWT (ชื่อ cookie: `auth`)
- Frontend **ไม่เก็บ JWT** ใน `localStorage`/`sessionStorage`
- ทุก request ใช้ `credentials: "include"` เพื่อส่ง cookie อัตโนมัติ
- ข้อดี: login sync ทุกแท็บ และลดความเสี่ยงจาก XSS

---

## 📝 Scripts

### Root Level
- `docker compose up` - Start ทุก services ด้วย Docker

### Backend (`backend/`)
- `npm run dev` - Development server (port 5000)
- `npm run build` - Build TypeScript
- `npm run start` - Production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - เปิด Prisma Studio

### Frontend (`frontend-next/`)
- `npm run dev` - Development server (port 3000)
- `npm run build` - Build สำหรับ production
- `npm run start` - Production server
- `npm run lint` - Run ESLint

---

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 18** - UI library

### Backend
- **Node.js 20** - Runtime
- **Express** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📁 File Storage

โปรเจกต์รองรับการเก็บไฟล์ 2 แบบ:

### Local Storage (Development)
- ไฟล์เก็บใน `backend/uploads/`
- ตั้งค่า `FILE_STORAGE_PROVIDER=local` ใน `.env`
- Serve ผ่าน `/uploads` endpoint

### S3 Storage (Production)
- ใช้ AWS S3 หรือ S3-compatible
- ตั้งค่า `FILE_STORAGE_PROVIDER=s3` และใส่ credentials

### API Endpoints

**Resumes:**
- `GET /api/candidates/resumes` - ดึงรายการ resumes
- `POST /api/candidates/resumes` - อัปโหลด resume (PDF, max 15MB)
- `DELETE /api/candidates/resumes/:id` - ลบ resume

**Certificates:**
- `GET /api/candidates/certificates` - ดึงรายการ certificates
- `POST /api/candidates/certificates` - อัปโหลด certificate (PDF/images, max 10MB)
- `DELETE /api/candidates/certificates/:id` - ลบ certificate

---

## 🐛 Troubleshooting

### Port already in use
```bash
# เปลี่ยน port ใน docker-compose.yml หรือหยุด service ที่ใช้ port อยู่
```

### Backend won't start
```bash
# Check logs
docker compose logs backend

# Generate Prisma Client
docker compose exec backend npm run prisma:generate

# Rebuild
docker compose up --build backend
```

### Database connection error
```bash
# Check if postgres is running
docker compose ps

# Check database logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

### Frontend can't connect to backend
```bash
# Check CORS settings
# ใน backend/.env ต้องมี:
CORS_ORIGIN=http://localhost:3000

# Check if backend is running
curl http://localhost:5000/api/health
```

---

## 📚 Documentation

- [DOCKER_EXPLAINED.md](./DOCKER_EXPLAINED.md) - คำอธิบาย Docker ในโปรเจกต์
- [DOCKER_FRONTEND_SETUP.md](./DOCKER_FRONTEND_SETUP.md) - Frontend containerization
- [TEAM_COLLABORATION.md](./TEAM_COLLABORATION.md) - Team workflow และ best practices
- [frontend-next/DESIGN_SYSTEM.md](./frontend-next/DESIGN_SYSTEM.md) - Design system

---

## 📞 Getting Help

- Check logs: `docker compose logs`
- Read documentation files
- Ask team on Slack/Discord
- Check GitHub Issues

---

## 📄 License

MIT

---

## 🎯 Quick Reference

```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Rebuild after changes
docker compose up --build

# Prisma commands
docker compose exec backend npm run prisma:generate
docker compose exec backend npm run prisma:migrate
docker compose exec backend npm run prisma:studio
```

**Happy Coding! 🚀**