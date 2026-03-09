# Database Setup Guide

## Why Database Data Doesn't Sync via GitHub

**Important:** Database data is stored in Docker volumes, which are **local to each machine** and **NOT included in git repositories**.

- Each device has its own separate database
- Docker volumes are stored on your local filesystem
- Only code, migrations, and seed scripts are in git
- This is **normal and expected behavior** for development

## Setting Up Database on a New Device

When you clone the project on a new device, you need to:

1. **Set up the database schema** (create tables)
2. **Populate initial data** (using seed scripts)

### Step 1: Start Docker Containers

```bash
docker compose up -d
```

### Step 2: Create Database Schema

```bash
# Option A: Use db push (quick, for development - syncs schema directly)
docker compose exec backend npx prisma db push --config=./prisma.config.ts

# Option B: Use migrations (better for production - applies migration history)
docker compose exec backend npx prisma migrate deploy --config=./prisma.config.ts

# IMPORTANT: After schema changes, always regenerate Prisma Client
docker compose exec backend npm run prisma:generate
```

**When pulling new code with schema changes:**
- Always run `prisma db push` (or `migrate deploy`) to sync your database
- Always run `prisma:generate` to update the Prisma Client
- Restart the backend container if it's running

### Step 3: Seed Initial Data

Run these commands in order:

```bash
# 1. Seed addresses (provinces, districts, subdistricts)
docker compose exec postgres psql -U postgres -d intern_website -f /app/prisma/seed-provinces.sql
docker compose exec postgres psql -U postgres -d intern_website -f /app/prisma/seed-districts-part1.sql
docker compose exec postgres psql -U postgres -d intern_website -f /app/prisma/seed-districts-part2.sql
docker compose exec postgres psql -U postgres -d intern_website -f /app/prisma/seed-districts-part3.sql
docker compose exec postgres psql -U postgres -d intern_website -f /app/prisma/seed-districts-part4.sql
docker compose exec postgres psql -U postgres -d intern_website -f /app/prisma/seed-districts-part5.sql
docker compose exec postgres psql -U postgres -d intern_website -f /app/prisma/seed-districts-part6.sql

# 2. Seed universities
docker compose exec postgres psql -U postgres -d intern_website -f /app/prisma/seed-universities.sql

# 3. Seed skills
docker compose exec postgres psql -U postgres -d intern_website -f /app/prisma/skill-seed.sql

# 4. Seed test users (optional - creates sample users for testing)
docker compose exec backend npm run seed:users
```

**Note:** The SQL files need to be copied into the container first, or you can run them from your local machine.

## Alternative: Using Seed Scripts from Host

If the SQL files aren't in the container, copy them first:

```bash
# Copy SQL files to container
docker cp backend/prisma/seed-provinces.sql intern-postgres:/tmp/
docker cp backend/prisma/seed-universities.sql intern-postgres:/tmp/
docker cp backend/prisma/skill-seed.sql intern-postgres:/tmp/

# Then run them
docker compose exec postgres psql -U postgres -d intern_website -f /tmp/seed-provinces.sql
docker compose exec postgres psql -U postgres -d intern_website -f /tmp/seed-universities.sql
docker compose exec postgres psql -U postgres -d intern_website -f /tmp/skill-seed.sql
```

## Quick Setup Script

Create a file `setup-database.sh` in the project root:

```bash
#!/bin/bash
echo "🌱 Setting up database..."

# Create schema
echo "📊 Creating database schema..."
docker compose exec backend npx prisma db push --config=./prisma.config.ts

# Seed data
echo "🌱 Seeding provinces..."
docker compose exec -T postgres psql -U postgres -d intern_website < backend/prisma/seed-provinces.sql

echo "🌱 Seeding universities..."
docker compose exec -T postgres psql -U postgres -d intern_website < backend/prisma/seed-universities.sql

echo "🌱 Seeding skills..."
docker compose exec -T postgres psql -U postgres -d intern_website < backend/prisma/skill-seed.sql

echo "✅ Database setup complete!"
```

## Sharing Real Data Between Devices

If you need to share **actual user data** (not just seed data) between devices:

### Option 1: Database Dump & Restore

**On Device 1 (export):**
```bash
docker compose exec postgres pg_dump -U postgres intern_website > database-backup.sql
# Commit this file to git (if it's not too large) or share via other means
```

**On Device 2 (import):**
```bash
docker compose exec -T postgres psql -U postgres -d intern_website < database-backup.sql
```

### Option 2: Use a Shared Database (Production)

For production or team collaboration, use a **shared database**:
- AWS RDS
- Supabase
- Neon
- Railway
- Any cloud PostgreSQL service

Update `DATABASE_URL` in `backend/.env` to point to the shared database.

## Best Practices

1. **Development:** Each developer has their own local database
2. **Testing:** Use seed scripts to create consistent test data
3. **Production:** Use a shared, managed database service
4. **Migrations:** Always commit migration files to git
5. **Seed Scripts:** Keep seed scripts in git for reproducible setups

## Troubleshooting

**Database is empty after pulling code:**
- This is normal! Run the setup steps above.

**Can't connect to database:**
- Make sure containers are running: `docker compose ps`
- Check database logs: `docker compose logs postgres`

**Seed scripts fail:**
- Make sure schema is created first (`prisma db push`)
- Check that SQL files exist in `backend/prisma/`
