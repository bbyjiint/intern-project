#!/bin/bash
# Reset User Data and Seed Fresh Test Data
# This script clears all user-related data while preserving reference data
# (Skills, Universities, Addresses, etc.)

set -e

echo "🔄 RESETTING USER DATA AND SEEDING FRESH TEST DATA"
echo "===================================================="
echo ""

# Check if containers are running
if ! docker compose ps | grep -q "intern-postgres.*Up"; then
    echo "❌ PostgreSQL container is not running!"
    echo "Starting containers..."
    docker compose up -d postgres
    sleep 3
fi

if ! docker compose ps | grep -q "intern-backend.*Up"; then
    echo "Starting backend container..."
    docker compose up -d backend
    sleep 3
fi

echo "🗑️  Step 1: Clearing all user-related data..."
echo ""

# Clear user-related data in the correct order (respecting foreign keys)
docker compose exec -T postgres psql -U postgres -d intern_website <<'EOF'
-- Disable foreign key checks temporarily for faster deletion
SET session_replication_role = 'replica';

-- Clear messages and conversations first (deepest in dependency tree)
TRUNCATE TABLE "Message" CASCADE;
TRUNCATE TABLE "Conversation" CASCADE;

-- Clear job-related data
TRUNCATE TABLE "JobApplication" CASCADE;
TRUNCATE TABLE "ScreeningQuestionChoice" CASCADE;
TRUNCATE TABLE "ScreeningQuestion" CASCADE;
TRUNCATE TABLE "JobPost" CASCADE;
TRUNCATE TABLE "JobBookmark" CASCADE;
TRUNCATE TABLE "JobIgnore" CASCADE;

-- Clear bookmarks
TRUNCATE TABLE "Bookmark" CASCADE;

-- Clear candidate-related data
TRUNCATE TABLE "UserProjects" CASCADE;
TRUNCATE TABLE "CandidateContactFile" CASCADE;
TRUNCATE TABLE "CertificateFile" CASCADE;
TRUNCATE TABLE "UserSkill" CASCADE;
TRUNCATE TABLE "WorkHistory" CASCADE;
TRUNCATE TABLE "CandidateUniversity" CASCADE;

-- Clear company-related data
TRUNCATE TABLE "CompanyPhone" CASCADE;
TRUNCATE TABLE "CompanyEmail" CASCADE;

-- Clear profiles
TRUNCATE TABLE "CandidateProfile" CASCADE;
TRUNCATE TABLE "CompanyProfile" CASCADE;

-- Clear users (this will cascade to profiles if foreign keys are set up)
TRUNCATE TABLE "User" CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';
EOF

echo "   ✅ User data cleared"
echo ""

echo "✅ Step 2: Verifying reference data is preserved..."
echo ""

# Verify reference data still exists
REFERENCE_COUNTS=$(docker compose exec -T postgres psql -U postgres -d intern_website -t -c "
SELECT 
    'Skills' as table_name,
    COUNT(*)::text as count
FROM \"Skills\"
UNION ALL
SELECT 
    'Universities',
    COUNT(*)::text
FROM \"University\"
UNION ALL
SELECT 
    'Provinces',
    COUNT(*)::text
FROM \"Province\"
UNION ALL
SELECT 
    'Districts',
    COUNT(*)::text
FROM \"District\"
UNION ALL
SELECT 
    'Subdistricts',
    COUNT(*)::text
FROM \"Subdistrict\"
UNION ALL
SELECT 
    'Faculties',
    COUNT(*)::text
FROM \"Faculty\";
")

echo "$REFERENCE_COUNTS"
echo ""

# Check if we have enough reference data
SKILLS_COUNT=$(docker compose exec -T postgres psql -U postgres -d intern_website -t -c "SELECT COUNT(*) FROM \"Skills\";" | tr -d ' ')
UNIVERSITIES_COUNT=$(docker compose exec -T postgres psql -U postgres -d intern_website -t -c "SELECT COUNT(*) FROM \"University\";" | tr -d ' ')

if [ "$SKILLS_COUNT" -lt 10 ]; then
    echo "⚠️  Warning: Only $SKILLS_COUNT skills found. Seeding may create additional skills."
fi

if [ "$UNIVERSITIES_COUNT" -lt 5 ]; then
    echo "⚠️  Warning: Only $UNIVERSITIES_COUNT universities found. Seeding may create additional universities."
fi

echo ""
echo "🌱 Step 3: Seeding fresh test users..."
echo ""

# Run the seed script
docker compose exec backend npm run seed:users

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Step 4: Verifying seeded data..."
    echo ""
    
    # Show summary of seeded data
    docker compose exec -T postgres psql -U postgres -d intern_website -c "
    SELECT 
        'Users' as metric,
        COUNT(*)::text as count
    FROM \"User\"
    UNION ALL
    SELECT 
        'Candidate Profiles',
        COUNT(*)::text
    FROM \"CandidateProfile\"
    UNION ALL
    SELECT 
        'Company Profiles',
        COUNT(*)::text
    FROM \"CompanyProfile\"
    UNION ALL
    SELECT 
        'Job Posts',
        COUNT(*)::text
    FROM \"JobPost\"
    UNION ALL
    SELECT 
        'Candidates with Education',
        COUNT(DISTINCT \"candidateId\")::text
    FROM \"CandidateUniversity\"
    UNION ALL
    SELECT 
        'Candidates with Skills',
        COUNT(DISTINCT \"candidateId\")::text
    FROM \"UserSkill\"
    UNION ALL
    SELECT 
        'Candidates with Experience',
        COUNT(DISTINCT \"candidateId\")::text
    FROM \"WorkHistory\";
    "
    
    echo ""
    echo "🔄 Restarting backend to pick up new data..."
    docker compose restart backend
    
    echo ""
    echo "✅ DATABASE RESET AND SEED COMPLETE!"
    echo ""
    echo "📋 Test User Credentials:"
    echo "   All users have password: password123"
    echo ""
    echo "   Candidate users:"
    docker compose exec -T postgres psql -U postgres -d intern_website -c "
    SELECT 
        u.email,
        cp.\"fullName\" as name,
        cp.\"desiredPosition\" as position
    FROM \"User\" u
    JOIN \"CandidateProfile\" cp ON u.id = cp.\"userId\"
    WHERE u.role = 'CANDIDATE'
    LIMIT 5;
    " || echo "   (No candidates found)"
    
    echo ""
    echo "   Company users:"
    docker compose exec -T postgres psql -U postgres -d intern_website -c "
    SELECT 
        u.email,
        comp.\"companyName\" as company
    FROM \"User\" u
    JOIN \"CompanyProfile\" comp ON u.id = comp.\"userId\"
    WHERE u.role = 'COMPANY'
    LIMIT 5;
    " || echo "   (No companies found)"
    
    echo ""
    echo "🌐 Access the website at: http://localhost:3000"
    echo ""
else
    echo ""
    echo "❌ Seeding failed! Please check the error messages above."
    exit 1
fi
