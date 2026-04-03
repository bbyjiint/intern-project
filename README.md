# เว็บเด็กฝึกงาน - Intern Website

แพลตฟอร์มหางานฝึกงานแบบ full-stack: ผู้สมัคร (intern) และบริษัทสมัคร/โพสต์งาน ดูผู้สมัคร บุ๊กมาร์ก ข้อความ และฟีเจอร์ช่วยค้นหา/วิเคราะห์งาน (เช่น AI job match) ตามที่มีในแอป

**สแตก:** Frontend เป็น **Next.js 14** + TypeScript + Tailwind CSS — Backend เป็น **Node.js + Express 5** + **Prisma 7** + PostgreSQL

## โครงสร้างโปรเจกต์

```
.
├── frontend-next/              # Next.js 14 + TypeScript + Tailwind CSS
├── backend/                    # Express + Prisma + PostgreSQL
├── docker-compose.yml          # postgres + backend + frontend (development)
├── sync-database.sh            # sync schema หลัง pull code ที่แก้ schema
├── reset-and-seed-database.sh  # ล้างข้อมูลผู้ใช้ + seed ข้อมูลทดสอบใหม่
├── open-prisma-studio.sh       # เปิด Prisma Studio เชื่อม DB ที่ localhost:5433
└── package.json                # root (shortcut รัน frontend)
```

## Quick Start (แนะนำ — Docker)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)

### สมาชิกทีมใหม่

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd intern-project
   ```

2. **ตั้งค่า `backend/.env`**

   สร้างไฟล์ `backend/.env` อย่างน้อยให้มีค่าเหล่านี้ (ปรับความลับให้เป็นของทีม):

   ```env
   JWT_SECRET="your-secret-key-change-this"
   CORS_ORIGIN="http://localhost:3000"
   FILE_STORAGE_PROVIDER="local"
   NODE_ENV="development"
   ```

   **หมายเหตุ Docker:** ใน `docker-compose.yml` ค่า **`DATABASE_URL` ถูกตั้งให้ชี้ไปที่ service `postgres` ภายใน network** โดยอัตโนมัติ — ไม่จำเป็นต้องใส่ `DATABASE_URL` ใน `.env` สำหรับการรันใน container (แต่ถ้าใส่ไว้ก็ไม่เป็นปัญหา; environment ใน Compose จะ override ตามที่กำหนด)

   หากต้องการหลาย origin สำหรับ CORS ให้คั่นด้วยจุลภาค เช่น `http://localhost:3000,http://127.0.0.1:3000`

   (Optional) สร้าง `frontend-next/.env.local` ถ้าต้องการ override API:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
   ```

3. **รันด้วย Docker**

   ```bash
   docker compose up --build
   # หรือรันเบื้องหลัง
   docker compose up -d --build
   ```

4. **สิ่งที่เกิดขึ้นอัตโนมัติเมื่อ backend container start**

   ตาม `docker-compose.yml` service `backend` จะรันตามลำดับ:

   `prisma db push` → `prisma generate` → `npm run dev`

   ดังนั้นโครงสร้างตารางจะถูก sync กับฐานข้อมูลเมื่อ container ขึ้น — **ไม่ต้องรัน `db push` มือทุกครั้ง** หากคุณแค่ restart backend หลัง pull

5. **ใส่ข้อมูลในฐานข้อมูล (ครั้งแรก / เมื่อต้องการข้อมูลทดสอบ)**

   - **ข้อมูลอ้างอิง + mock แบบครบชุด** — รันตามลำดับ (หรือดูรายละเอียดใน `TEAM_DATABASE_SYNC.md` / `PRISMA_NEON_GUIDE.md`):

     ```bash
     docker compose exec backend npx prisma db push --config=./prisma.config.ts
     docker compose exec backend npm run prisma:generate
     docker compose exec -T backend npm run seed:addresses-direct
     docker compose exec -T postgres psql -U postgres -d intern_website < backend/prisma/seed-universities.sql
     docker compose exec -T postgres psql -U postgres -d intern_website < backend/prisma/thai-university-name-seed.sql
     docker compose exec -T backend npm run seed:mock-data
     ```

   - **รีเซ็ตเฉพาะผู้ใช้/โพสต์ แล้ว seed mock ใหม่** (เก็บ skills, มหาวิทยาลัย, ที่อยู่ ฯลฯ ไว้):

     ```bash
     ./reset-and-seed-database.sh
     ```

     สคริปต์นี้ต้องการให้มีข้อมูลอ้างอิงในฐานอยู่แล้ว — ถ้ายังว่าง ให้รันขั้นตอน seed อ้างอิงด้านบนก่อน

6. **เข้าถึงบริการ**

   - **Frontend:** http://localhost:3000  
   - **Backend API:** http://localhost:5001  
   - **Health:** http://localhost:5001/api/health  
   - **PostgreSQL (จากเครื่อง host):** `localhost:5433` (ค่า default ใน Compose; เปลี่ยนได้ด้วย `POSTGRES_PORT`)  
   - **Prisma Studio:** รันจากเครื่อง host — `./open-prisma-studio.sh` แล้วเปิด http://localhost:5555 (ต้อง `npm install` ใน `backend/` บนเครื่องก่อน ครั้งแรก)

---

## Sync database หลัง pull code ที่แก้ `schema.prisma`

เมื่อ pull code ที่มีการเปลี่ยน schema:

### วิธีที่ 1: สคริปต์ (แนะนำ)

```bash
./sync-database.sh
```

จะทำ: `prisma db push` → `prisma generate` → `docker compose restart backend`

### วิธีที่ 2: Restart backend อย่างเดียว

หลัง pull ถ้า container ยังรันอยู่ การ **`docker compose restart backend`** มักเพียงพอ เพราะ entrypoint ของ backend รัน `db push` + `generate` ทุกครั้งที่ start

### วิธีที่ 3: รันคำสั่งเอง

```bash
docker compose exec backend npx prisma db push --config=./prisma.config.ts --accept-data-loss
docker compose exec backend npm run prisma:generate
docker compose restart backend
```

รายละเอียดเพิ่ม: [TEAM_DATABASE_SYNC.md](./TEAM_DATABASE_SYNC.md)

---

## Docker — คำสั่งที่ใช้บ่อย

```bash
docker compose up -d
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose restart backend
docker compose down
docker compose down -v          # ลบ volume ฐานข้อมูลด้วย
docker compose up --build
```

**Prisma (ใน container backend):**

```bash
docker compose exec backend npm run prisma:generate
docker compose exec backend npm run prisma:migrate
docker compose exec backend npm run prisma:studio
```

**เข้า shell ใน container:**

```bash
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec postgres psql -U postgres -d intern_website
```

**ปรับ port (optional):** ตั้งค่า env เช่น `FRONTEND_PORT`, `BACKEND_PORT`, `POSTGRES_PORT` ก่อน `docker compose up` (ดู `docker-compose.yml`)

---

## Team / Git

Default branch ของทีมใช้ **`dev`** — ปรับคำสั่งให้ตรงกับ remote จริง:

```bash
git pull origin dev
git checkout -b feature/your-feature-name
# ... develop & test (เช่น docker compose up)
git push origin feature/your-feature-name
```

**ควร commit:** โค้ด, config, `backend/prisma/schema.prisma`, migration ใต้ `backend/prisma/migrations/`, SQL seed, เอกสารที่เกี่ยวข้อง

**ไม่ควร commit:** `node_modules/`, `.env`, `dist/`, `.next/`, ไฟล์ใน `backend/uploads/` (ข้อมูลผู้ใช้)

**เมื่อสร้าง migration:**

```bash
docker compose exec backend npm run prisma:migrate
git add backend/prisma/migrations/
git commit -m "Add migration: describe change"
```

---

## ติดตั้งแบบ local (ไม่ใช้ Docker)

ต้องการ: Node.js 20+, PostgreSQL 16+, npm

**Backend**

```bash
cd backend
npm install
# สร้าง DB intern_website แล้วตั้ง DATABASE_URL ใน backend/.env ให้ชี้ localhost
npm run prisma:generate
npm run prisma:migrate   # หรือ db push ตาม workflow ทีม
npm run dev              # port 5001
```

**Frontend**

```bash
cd frontend-next
npm install
# optional: frontend-next/.env.local → NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
npm run dev              # port 3000
```

**จาก root:** `npm run dev` จะรัน dev server ของ `frontend-next` เท่านั้น (ต้องรัน backend แยก)

---

## Authentication

- JWT ส่งผ่าน **HTTP-only cookie** ชื่อ `auth`
- Frontend ไม่เก็บ token ใน `localStorage` / `sessionStorage`
- เรียก API แบบมี cookie ใช้ `credentials: "include"` (หรือเทียบเท่าใน client ที่ใช้)

---

## Scripts สรุป

| ที่ | คำสั่ง |
|-----|--------|
| Root | `npm run dev` / `npm run build` → ชี้ไปที่ `frontend-next` |
| `backend/` | `dev`, `build`, `start`, `prisma:*`, `seed:addresses-direct`, `seed:users`, `seed:mock-data` |
| `frontend-next/` | `dev`, `build`, `start`, `lint` |

---

## เทคโนโลยี

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS  
- **Backend:** Node.js 20, Express 5, Prisma 7, PostgreSQL  
- **DevOps:** Docker, Docker Compose  

---

## File storage

- **Local (dev):** `FILE_STORAGE_PROVIDER=local` — ไฟล์ใต้ `backend/uploads/` เสิร์ฟผ่าน `/uploads`  
- **S3 (production):** `FILE_STORAGE_PROVIDER=s3` + ตั้งค่า credentials ตามที่ backend รองรับ  

**ตัวอย่าง API ที่เกี่ยวกับไฟล์ผู้สมัคร**

- Resumes: `GET/POST /api/candidates/resumes`, `DELETE .../resumes/:id`  
- Certificates: `GET/POST /api/candidates/certificates`, `DELETE .../certificates/:id`  

(ขนาดไฟล์และชนิดไฟล์ตามที่ validate ใน backend)

---

## Troubleshooting

**Port ชนกัน:** เปลี่ยน `FRONTEND_PORT` / `BACKEND_PORT` / `POSTGRES_PORT` หรือปิด process ที่ใช้ port นั้น

**Backend ไม่ขึ้น:** `docker compose logs backend` แล้วลอง `docker compose exec backend npm run prisma:generate` และ `docker compose up --build backend`

**DB ต่อไม่ติด:** `docker compose ps`, `docker compose logs postgres`, `docker compose restart postgres`

**Frontend ต่อ API ไม่ได้:** ตรวจ `CORS_ORIGIN` และ `curl http://localhost:5001/api/health`

---

## เอกสารเพิ่มเติม

- [TEAM_DATABASE_SYNC.md](./TEAM_DATABASE_SYNC.md) — sync DB หลัง pull  
- [PRISMA_NEON_GUIDE.md](./PRISMA_NEON_GUIDE.md) — Neon / production  
- [PRESENTATION_SCRIPT_BACKEND.md](./PRESENTATION_SCRIPT_BACKEND.md) — สคริปต์นำเสนอ backend (ถ้าใช้)

---

## License

MIT

---

## Quick reference

```bash
docker compose up -d
docker compose logs -f
docker compose down
./sync-database.sh
./reset-and-seed-database.sh
docker compose exec backend npm run prisma:generate
```
