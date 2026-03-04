# Backend API Analysis Report
## Missing Functions According to Frontend

Generated: Analysis of frontend API calls vs backend implementations

---

## 📊 Executive Summary

This report analyzes all API endpoints called by the frontend and compares them with what's implemented in the backend. Missing endpoints are identified and prioritized.

**Total Frontend API Calls Found:** ~50+ endpoints  
**Total Backend Endpoints Implemented:** ~45+ endpoints  
**Missing Critical Endpoints:** 2 (AI endpoints only)  
**Method/Parameter Mismatches:** 1 (applicant status update)  
**Overall Coverage:** ~95%

---

## ✅ IMPLEMENTED ENDPOINTS

### Authentication (`/api/auth`)
- ✅ `POST /api/auth/login`
- ✅ `POST /api/auth/register`
- ✅ `POST /api/auth/logout`
- ✅ `GET /api/auth/me`
- ✅ `GET /api/auth/session`
- ✅ `GET /api/auth/me/role`
- ✅ `GET /api/auth/{provider}/start` (Google, LINE)
- ✅ `GET /api/auth/{provider}/callback`

### Candidates (`/api/candidates`)
- ✅ `GET /api/candidates` (list all)
- ✅ `GET /api/candidates/profile`
- ✅ `PUT /api/candidates/profile`
- ✅ `GET /api/candidates/certificates`
- ✅ `POST /api/candidates/certificates`
- ✅ `DELETE /api/candidates/certificates/:id`
- ✅ `POST /api/candidates/resumes`

### Profiles (`/api`)
- ✅ `GET /api/candidates/profile`
- ✅ `PUT /api/candidates/profile`
- ✅ `GET /api/companies/profile`
- ✅ `PUT /api/companies/profile`

### Job Posts (`/api/job-posts`)
- ✅ `GET /api/job-posts/public`
- ✅ `POST /api/job-posts`
- ✅ `GET /api/job-posts/:id`
- ✅ `PUT /api/job-posts/:id`
- ✅ `DELETE /api/job-posts/:id`
- ✅ `GET /api/job-posts/:id/applicants`
- ✅ `POST /api/job-posts/:id/apply`
- ✅ `PUT /api/job-posts/:id/applicants/:applicantId` (update status)

### Intern Routes (`/api/intern`)
- ✅ `GET /api/intern/job-bookmarks`
- ✅ `POST /api/intern/job-bookmarks/:jobPostId`
- ✅ `DELETE /api/intern/job-bookmarks/:jobPostId`
- ✅ `GET /api/intern/job-bookmarks/jobs`
- ✅ `GET /api/intern/job-ignored`
- ✅ `POST /api/intern/job-ignored/:jobPostId`
- ✅ `DELETE /api/intern/job-ignored/:jobPostId`
- ✅ `GET /api/intern/applications`

### Messages (`/api/messages`)
- ✅ `GET /api/messages/conversations`
- ✅ `POST /api/messages/conversations`
- ✅ `GET /api/messages/conversations/:conversationId/messages`
- ✅ `POST /api/messages/conversations/:conversationId/messages`
- ✅ `GET /api/messages/unread-count`

### Bookmarks (`/api/bookmarks`)
- ✅ `GET /api/bookmarks`
- ✅ `GET /api/bookmarks/:candidateId`
- ✅ `POST /api/bookmarks/:candidateId`
- ✅ `DELETE /api/bookmarks/:candidateId`

### Universities (`/api/universities`)
- ✅ `GET /api/universities`

### Skills (`/api/skills`)
- ✅ `GET /api/skills`

### Addresses (`/api/addresses`)
- ✅ `GET /api/addresses/provinces`
- ✅ `GET /api/addresses/districts?provinceId=:id`
- ✅ `GET /api/addresses/subdistricts?districtId=:id`

---

## ❌ MISSING ENDPOINTS

### 🔴 CRITICAL - High Priority

#### 1. AI Endpoints (`/api/ai`)
**Status:** ❌ **NOT IMPLEMENTED**

Frontend calls:
- `GET /api/ai/job-matches` - Get AI-recommended job matches for candidate
- `POST /api/ai/analyze-resume` - Analyze resume text and extract skills

**Impact:** 
- Job matching feature won't work
- Resume analysis feature won't work

**Files Affected:**
- `frontend-next/app/intern/job-match/page.tsx` (line 81)
- `frontend-next/app/intern/ai-analysis/page.tsx` (line 384)

**Recommendation:** Create `backend/src/routes/ai.ts` with these endpoints

---

#### 2. Candidate Experience Endpoints (`/api/candidates/experience`)
**Status:** ✅ **IMPLEMENTED** (Verified in candidates.ts lines 658, 692)

Frontend calls:
- ✅ `POST /api/candidates/experience` - Create new work experience
- ✅ `PUT /api/candidates/experience/:id` - Update existing work experience
- ⚠️ `DELETE /api/candidates/experience/:id` - Delete work experience (needs verification)

**Files Affected:**
- `frontend-next/components/profile/ExperienceModal.tsx` (lines 98, 104)

**Note:** DELETE endpoint may be missing - needs verification

---

#### 3. Candidate Education Endpoints (`/api/candidates/education`)
**Status:** ✅ **IMPLEMENTED** (Verified in candidates.ts lines 535, 591)

Frontend calls:
- ✅ `POST /api/candidates/education` - Create new education entry
- ✅ `PUT /api/candidates/education/:id` - Update existing education entry
- ⚠️ `DELETE /api/candidates/education/:id` - Delete education entry (needs verification)

**Files Affected:**
- `frontend-next/components/profile/EducationModal.tsx` (lines 130, 136)

**Note:** DELETE endpoint may be missing - needs verification

---

#### 4. Candidate Projects Endpoints (`/api/candidates/projects`)
**Status:** ✅ **IMPLEMENTED** (Verified in candidates.ts lines 421, 453, 499)

Frontend calls:
- ⚠️ `GET /api/candidates/projects` - Get all projects (covered by profile endpoint)
- ✅ `POST /api/candidates/projects` - Create new project
- ✅ `PUT /api/candidates/projects/:id` - Update existing project
- ✅ `DELETE /api/candidates/projects/:id` - Delete project

**Files Affected:**
- `frontend-next/components/profile-setup/Step2BackgroundExperience.tsx` (lines 57, 81, 105)
- `frontend-next/app/intern/project/page.tsx` (uses profile endpoint)

**Note:** GET endpoint uses `/api/candidates/profile` which includes projects

---

### 🟡 MEDIUM Priority

#### 5. Certificate Upload Endpoint
**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

Frontend calls:
- `POST /api/candidates/certificates` - Upload certificate (with FormData)

**Current Status:** 
- Endpoint exists but might need FormData handling verification
- Frontend uses `fetch` directly instead of `apiFetch` for file upload (line 175 in certificates/page.tsx)

**Files Affected:**
- `frontend-next/app/intern/certificates/page.tsx` (line 175)

**Recommendation:** Verify FormData handling in existing endpoint

---

#### 6. Resume Upload Endpoint
**Status:** ⚠️ **NEEDS VERIFICATION**

Frontend calls:
- `POST /api/candidates/resumes` - Upload resume (with FormData, type: 'RESUME')

**Files Affected:**
- `frontend-next/components/profile-setup/Step0UploadResume.tsx` (line 61)

**Recommendation:** Verify endpoint handles FormData correctly

---

### 🟢 LOW Priority / Nice to Have

#### 7. Job Post Applicant Status Update
**Status:** ⚠️ **METHOD MISMATCH**

Frontend calls:
- `PUT /api/job-posts/:jobPostId/applicants/:applicantId` - Update application status

Backend implements:
- `PATCH /api/job-posts/:id/applicants/:applicationId` - Update application status (line 747 in job-posts.ts)

**Issue:** Frontend uses PUT but backend uses PATCH. Also parameter name differs (`applicantId` vs `applicationId`).

**Files Affected:**
- `frontend-next/app/employer/job-post/applicants/[id]/page.tsx` (lines 173, 185)

**Recommendation:** Either:
1. Change backend to use PUT and match parameter name, OR
2. Update frontend to use PATCH and correct parameter name

---

## 📝 DETAILED ENDPOINT BREAKDOWN

### Frontend API Calls by Category

#### Authentication (8 calls)
1. ✅ `POST /api/auth/login`
2. ✅ `POST /api/auth/register`
3. ✅ `POST /api/auth/logout`
4. ✅ `GET /api/auth/me`
5. ✅ `GET /api/auth/session`
6. ✅ `GET /api/auth/me/role`
7. ✅ `GET /api/auth/google/start`
8. ✅ `GET /api/auth/line/start`

#### Candidate Profile (15+ calls)
1. ✅ `GET /api/candidates/profile`
2. ✅ `PUT /api/candidates/profile` (multiple times in EditProfileDrawer)
3. ❌ `POST /api/candidates/experience`
4. ❌ `PUT /api/candidates/experience/:id`
5. ❌ `POST /api/candidates/education`
6. ❌ `PUT /api/candidates/education/:id`
7. ❌ `GET /api/candidates/projects`
8. ❌ `POST /api/candidates/projects`
9. ❌ `PUT /api/candidates/projects/:id`
10. ❌ `DELETE /api/candidates/projects/:id`
11. ✅ `GET /api/candidates/certificates`
12. ✅ `POST /api/candidates/certificates`
13. ✅ `DELETE /api/candidates/certificates/:id`
14. ✅ `POST /api/candidates/resumes`

#### Company Profile (2 calls)
1. ✅ `GET /api/companies/profile`
2. ✅ `PUT /api/companies/profile`

#### Job Posts (8+ calls)
1. ✅ `GET /api/job-posts/public`
2. ✅ `POST /api/job-posts`
3. ✅ `GET /api/job-posts/:id`
4. ✅ `PUT /api/job-posts/:id`
5. ✅ `DELETE /api/job-posts/:id`
6. ✅ `GET /api/job-posts/:id/applicants`
7. ✅ `POST /api/job-posts/:id/apply`
8. ⚠️ `PUT /api/job-posts/:id/applicants/:applicantId` (needs verification)

#### Intern Features (8 calls)
1. ✅ `GET /api/intern/job-bookmarks`
2. ✅ `POST /api/intern/job-bookmarks/:jobPostId`
3. ✅ `DELETE /api/intern/job-bookmarks/:jobPostId`
4. ✅ `GET /api/intern/job-bookmarks/jobs`
5. ✅ `GET /api/intern/job-ignored`
6. ✅ `POST /api/intern/job-ignored/:jobPostId`
7. ✅ `DELETE /api/intern/job-ignored/:jobPostId`
8. ✅ `GET /api/intern/applications`

#### Messages (5 calls)
1. ✅ `GET /api/messages/conversations`
2. ✅ `POST /api/messages/conversations`
3. ✅ `GET /api/messages/conversations/:conversationId/messages`
4. ✅ `POST /api/messages/conversations/:conversationId/messages`
5. ✅ `GET /api/messages/unread-count`

#### Bookmarks (4 calls)
1. ✅ `GET /api/bookmarks`
2. ✅ `GET /api/bookmarks/:candidateId`
3. ✅ `POST /api/bookmarks/:candidateId`
4. ✅ `DELETE /api/bookmarks/:candidateId`

#### Reference Data (5 calls)
1. ✅ `GET /api/universities`
2. ✅ `GET /api/skills`
3. ✅ `GET /api/addresses/provinces`
4. ✅ `GET /api/addresses/districts`
5. ✅ `GET /api/addresses/subdistricts`

#### AI Features (2 calls)
1. ❌ `GET /api/ai/job-matches`
2. ❌ `POST /api/ai/analyze-resume`

---

## 🎯 PRIORITY RECOMMENDATIONS

### Priority 1: Critical Missing Features
1. **AI Endpoints** - Job matching and resume analysis are core features
2. **Experience CRUD** - Users need to manage work experience
3. **Education CRUD** - Users need to manage education
4. **Projects CRUD** - Users need to manage projects

### Priority 2: Verification Needed
1. Verify certificate upload handles FormData
2. Verify resume upload handles FormData
3. Verify applicant status update endpoint

### Priority 3: Enhancements
1. Add DELETE endpoints for experience/education if needed
2. Consider pagination for large lists
3. Add search/filter parameters where missing

---

## 📋 IMPLEMENTATION CHECKLIST

### To Implement:

- [ ] Create `backend/src/routes/ai.ts`
  - [ ] `GET /api/ai/job-matches` - Return job matches based on candidate profile
  - [ ] `POST /api/ai/analyze-resume` - Analyze resume text, extract skills
  - [ ] Register route in `server.ts`: `app.use("/api/ai", aiRouter);`

- [ ] Add DELETE endpoints (if needed):
  - [ ] `DELETE /api/candidates/experience/:id` - Delete work experience
  - [ ] `DELETE /api/candidates/education/:id` - Delete education entry

- [ ] Fix method/parameter mismatch:
  - [ ] Either change backend `PATCH /api/job-posts/:id/applicants/:applicationId` to `PUT /api/job-posts/:id/applicants/:applicantId`
  - [ ] OR update frontend to use `PATCH` and parameter name `applicationId`

- [ ] Verify existing endpoints:
  - [ ] `POST /api/candidates/certificates` - FormData handling (uses multer, should be fine)
  - [ ] `POST /api/candidates/resumes` - FormData handling (uses multer, should be fine)

- [ ] Register new routes in `backend/src/utils/server.ts`:
  - [ ] `app.use("/api/ai", aiRouter);`

---

## 🔍 NOTES

1. **Bulk vs Individual Operations**: The frontend has both bulk operations (via `/api/candidates/profile` PUT) and individual CRUD operations. The individual operations provide better UX for adding/editing single items.

2. **AI Endpoints**: These are likely placeholders or require external AI service integration. Consider:
   - Using a resume parsing library
   - Implementing basic keyword matching for job matches
   - Or integrating with an AI service API

3. **FormData Handling**: Some endpoints use `fetch` directly instead of `apiFetch` for file uploads. This is fine, but ensure backend handles multipart/form-data correctly.

4. **Error Handling**: Frontend has fallbacks (localStorage) for some features, but proper backend endpoints are still needed.

---

## 📊 Statistics

- **Total Frontend API Calls:** ~50+
- **Implemented Backend Endpoints:** ~45+
- **Missing Critical Endpoints:** 2 (AI endpoints)
- **Method/Parameter Mismatches:** 1 (applicant status update)
- **Needs Verification:** 2 (DELETE endpoints for experience/education)
- **Coverage:** ~95%

---

## 🚀 Next Steps

1. **Immediate**: Implement AI endpoints (even if basic/stub implementations)
   - Can start with simple keyword matching for job matches
   - Can use basic text parsing for resume analysis
2. **High Priority**: Fix applicant status update method/parameter mismatch
3. **Medium Priority**: Add DELETE endpoints for experience/education if needed
4. **Low Priority**: Verify file upload endpoints work correctly with FormData

---

*Report generated by analyzing frontend API calls and comparing with backend route implementations.*
