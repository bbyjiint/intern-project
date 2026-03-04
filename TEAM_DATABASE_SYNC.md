

## เมื่อไหร่ที่ต้อง sync database?

**ทุกครั้งที่ pull code ใหม่ที่มีการเปลี่ยนแปลง database schema** เช่น:
- เพิ่ม column ใหม่ (เช่น `dateOfBirth`)
- เพิ่ม table ใหม่
- แก้ไข field types
- เพิ่ม/ลบ relations

## วิธี Sync Database (เลือกวิธีใดก็ได้)

### ⭐ วิธีที่ 1: ใช้ Script (แนะนำ - ง่ายที่สุด)

```bash
./sync-database.sh
```

Script นี้จะทำทุกอย่างให้อัตโนมัติ:
1. ✅ Sync schema กับ database
2. ✅ Regenerate Prisma Client
3. ✅ Restart backend

### วิธีที่ 2: รันคำสั่งเอง

```bash
# 1. Sync schema กับ database
docker compose exec backend npx prisma db push --config=./prisma.config.ts --accept-data-loss

# 2. Regenerate Prisma Client (สำคัญมาก!)
docker compose exec backend npm run prisma:generate

# 3. Restart backend
docker compose restart backend
```

### วิธีที่ 3: ใช้ npm script (ถ้ามี)

```bash
cd backend
npm run sync:db  # (ถ้ามี script นี้)
```

## Checklist สำหรับ Team Members

เมื่อ pull code ใหม่:

- [ ] ตรวจสอบว่า Docker containers กำลังรัน (`docker compose ps`)
- [ ] รัน `./sync-database.sh` หรือคำสั่ง sync database
- [ ] ตรวจสอบว่า backend ทำงานปกติ (ดู logs: `docker compose logs backend`)
- [ ] ทดสอบ API endpoints ที่เกี่ยวข้อง

## ปัญหาที่พบบ่อย

### ❌ Error: "Container is not running"
**แก้ไข:**
```bash
docker compose up -d
```

### ❌ Error: "Unknown field X for include statement"
**แก้ไข:** 
- ต้องรัน `prisma:generate` หลังจาก `db push`
- Restart backend container

### ❌ Error: "Column does not exist"
**แก้ไข:**
- ตรวจสอบว่า schema.prisma ถูก pull มาแล้ว
- รัน `prisma db push` อีกครั้ง

### ❌ Data หายไป?
**ไม่ต้องกังวล!** `prisma db push` จะไม่ลบข้อมูลเดิม (ยกเว้น column ที่ถูกลบ)
- ถ้า column ถูกลบ ข้อมูลใน column นั้นจะหายไป (แต่ table อื่นๆ ปลอดภัย)
- ถ้า table ถูกลบ table นั้นจะหายไป (แต่ table อื่นๆ ปลอดภัย)

## ตัวอย่าง: เมื่อมีคนเพิ่ม field ใหม่

สมมติว่าเพื่อนเพิ่ม `dateOfBirth` field ใน `CandidateProfile`:

1. **Pull code:**
   ```bash
   git pull origin main
   ```

2. **Sync database:**
   ```bash
   ./sync-database.sh
   ```

3. **ตรวจสอบ:**
   ```bash
   # ดู logs ว่า backend ทำงานปกติ
   docker compose logs backend
   ```

4. **เสร็จแล้ว!** 🎉

## คำถาม?

ถ้ามีปัญหา:
1. ตรวจสอบว่า Docker containers กำลังรัน
2. ดู logs: `docker compose logs backend`
3. ถามใน team chat หรือสร้าง issue
