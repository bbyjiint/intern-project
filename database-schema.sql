--
-- PostgreSQL database dump
--

\restrict lc3INzYcIgIsg6VXv6Nug6mhRaCUaRyzBVOE5hvfcAlezgO0mPITIE9K0g5Xabl

-- Dumped from database version 16.12
-- Dumped by pg_dump version 16.12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AllowancePeriod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AllowancePeriod" AS ENUM (
    'MONTH',
    'WEEK',
    'DAY'
);


--
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ApplicationStatus" AS ENUM (
    'NEW',
    'SHORTLISTED',
    'REVIEWED',
    'REJECTED'
);


--
-- Name: AuthProvider; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AuthProvider" AS ENUM (
    'LOCAL',
    'GOOGLE',
    'LINE',
    'FACEBOOK'
);


--
-- Name: CandidateFileType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CandidateFileType" AS ENUM (
    'RESUME',
    'PORTFOLIO',
    'OTHER'
);


--
-- Name: EducationLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EducationLevel" AS ENUM (
    'BACHELOR',
    'MASTERS',
    'PHD'
);


--
-- Name: JobPostState; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."JobPostState" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'CLOSED'
);


--
-- Name: JobPostStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."JobPostStatus" AS ENUM (
    'URGENT',
    'NOT_URGENT'
);


--
-- Name: QuestionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QuestionType" AS ENUM (
    'TEXT',
    'MULTIPLE_CHOICE'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'CANDIDATE',
    'COMPANY'
);


--
-- Name: WorkplaceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WorkplaceType" AS ENUM (
    'ON_SITE',
    'HYBRID',
    'REMOTE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Bookmark; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Bookmark" (
    id uuid NOT NULL,
    "companyId" uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CandidateContactFile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CandidateContactFile" (
    id uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    type public."CandidateFileType" DEFAULT 'OTHER'::public."CandidateFileType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CandidatePreferredProvince; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CandidatePreferredProvince" (
    id uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    "provinceId" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CandidateProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CandidateProfile" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "fullName" text,
    "contactEmail" character varying(255),
    "phoneNumber" character varying(32),
    "desiredPosition" text,
    bio text,
    "profileImage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    description text,
    "preferredPositions" text[] DEFAULT '{}'::text[],
    "dateOfBirth" timestamp(3) without time zone
);


--
-- Name: CandidateResume; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CandidateResume" (
    id uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    "fileSize" integer,
    "fileType" text,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CandidateUniversity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CandidateUniversity" (
    id uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    "universityId" uuid NOT NULL,
    "educationLevel" public."EducationLevel" NOT NULL,
    "degreeName" text,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    gpa double precision,
    "isCurrent" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "universityFacultyId" uuid
);


--
-- Name: CertificateFile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CertificateFile" (
    id uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    type text,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CompanyEmail; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CompanyEmail" (
    id uuid NOT NULL,
    "companyId" uuid NOT NULL,
    email character varying(255) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CompanyPhone; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CompanyPhone" (
    id uuid NOT NULL,
    "companyId" uuid NOT NULL,
    phone character varying(32) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CompanyProfile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CompanyProfile" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "companyName" text NOT NULL,
    about text,
    location text,
    province text,
    "logoURL" text,
    "recruiterName" text,
    "recruiterPosition" text,
    "registrationNum" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Conversation" (
    id uuid NOT NULL,
    "companyId" uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: District; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."District" (
    id uuid NOT NULL,
    "provinceId" uuid NOT NULL,
    name text NOT NULL,
    thname text,
    code text,
    "postalCode" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Faculty; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Faculty" (
    id uuid NOT NULL,
    name text NOT NULL,
    thname text,
    code text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: JobApplication; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JobApplication" (
    id uuid NOT NULL,
    "jobPostId" uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    status public."ApplicationStatus" DEFAULT 'NEW'::public."ApplicationStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: JobBookmark; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JobBookmark" (
    id uuid NOT NULL,
    "jobPostId" uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: JobIgnore; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JobIgnore" (
    id uuid NOT NULL,
    "jobPostId" uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: JobPost; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JobPost" (
    id uuid NOT NULL,
    "companyId" uuid NOT NULL,
    "jobTitle" text NOT NULL,
    "locationProvince" text,
    "locationDistrict" text,
    "jobType" text,
    "workplaceType" public."WorkplaceType" DEFAULT 'ON_SITE'::public."WorkplaceType" NOT NULL,
    allowance double precision,
    "allowancePeriod" public."AllowancePeriod",
    "noAllowance" boolean DEFAULT false NOT NULL,
    "jobPostStatus" public."JobPostStatus" DEFAULT 'NOT_URGENT'::public."JobPostStatus" NOT NULL,
    "jobDescription" text,
    "jobSpecification" text,
    "rejectionMessage" text,
    state public."JobPostState" DEFAULT 'DRAFT'::public."JobPostState" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Message" (
    id uuid NOT NULL,
    "conversationId" uuid NOT NULL,
    "senderId" uuid NOT NULL,
    "senderRole" public."UserRole" NOT NULL,
    text text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Province; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Province" (
    id uuid NOT NULL,
    name text NOT NULL,
    thname text,
    code text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ScreeningQuestion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ScreeningQuestion" (
    id uuid NOT NULL,
    "jobPostId" uuid NOT NULL,
    question text NOT NULL,
    "questionType" public."QuestionType" DEFAULT 'TEXT'::public."QuestionType" NOT NULL,
    "idealAnswer" text,
    "automaticRejection" boolean DEFAULT false NOT NULL,
    "order" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ScreeningQuestionChoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ScreeningQuestionChoice" (
    id uuid NOT NULL,
    "questionId" uuid NOT NULL,
    choice text NOT NULL,
    "order" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Skills" (
    id uuid NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Subdistrict; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Subdistrict" (
    id uuid NOT NULL,
    "districtId" uuid NOT NULL,
    name text NOT NULL,
    thname text,
    code text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: University; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."University" (
    id uuid NOT NULL,
    name text NOT NULL,
    code text,
    province text,
    country text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    thname text
);


--
-- Name: UniversityFaculty; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UniversityFaculty" (
    id uuid NOT NULL,
    "universityId" uuid NOT NULL,
    "facultyId" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    email character varying(255) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authProvider" public."AuthProvider" DEFAULT 'LOCAL'::public."AuthProvider" NOT NULL,
    "lineUserID" text,
    password text,
    "passwordReset" text,
    role public."UserRole",
    "socialID" text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: UserProjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserProjects" (
    id uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    description text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: UserSkill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserSkill" (
    id uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    "skillId" uuid NOT NULL,
    rating integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: WorkHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WorkHistory" (
    id uuid NOT NULL,
    "candidateId" uuid NOT NULL,
    "companyName" text NOT NULL,
    "position" text NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Bookmark Bookmark_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Bookmark"
    ADD CONSTRAINT "Bookmark_pkey" PRIMARY KEY (id);


--
-- Name: CandidateContactFile CandidateContactFile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidateContactFile"
    ADD CONSTRAINT "CandidateContactFile_pkey" PRIMARY KEY (id);


--
-- Name: CandidatePreferredProvince CandidatePreferredProvince_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidatePreferredProvince"
    ADD CONSTRAINT "CandidatePreferredProvince_pkey" PRIMARY KEY (id);


--
-- Name: CandidateProfile CandidateProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidateProfile"
    ADD CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY (id);


--
-- Name: CandidateResume CandidateResume_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidateResume"
    ADD CONSTRAINT "CandidateResume_pkey" PRIMARY KEY (id);


--
-- Name: CandidateUniversity CandidateUniversity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidateUniversity"
    ADD CONSTRAINT "CandidateUniversity_pkey" PRIMARY KEY (id);


--
-- Name: CertificateFile CertificateFile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CertificateFile"
    ADD CONSTRAINT "CertificateFile_pkey" PRIMARY KEY (id);


--
-- Name: CompanyEmail CompanyEmail_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CompanyEmail"
    ADD CONSTRAINT "CompanyEmail_pkey" PRIMARY KEY (id);


--
-- Name: CompanyPhone CompanyPhone_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CompanyPhone"
    ADD CONSTRAINT "CompanyPhone_pkey" PRIMARY KEY (id);


--
-- Name: CompanyProfile CompanyProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CompanyProfile"
    ADD CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: District District_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."District"
    ADD CONSTRAINT "District_pkey" PRIMARY KEY (id);


--
-- Name: Faculty Faculty_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Faculty"
    ADD CONSTRAINT "Faculty_pkey" PRIMARY KEY (id);


--
-- Name: JobApplication JobApplication_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobApplication"
    ADD CONSTRAINT "JobApplication_pkey" PRIMARY KEY (id);


--
-- Name: JobBookmark JobBookmark_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobBookmark"
    ADD CONSTRAINT "JobBookmark_pkey" PRIMARY KEY (id);


--
-- Name: JobIgnore JobIgnore_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobIgnore"
    ADD CONSTRAINT "JobIgnore_pkey" PRIMARY KEY (id);


--
-- Name: JobPost JobPost_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobPost"
    ADD CONSTRAINT "JobPost_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: Province Province_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Province"
    ADD CONSTRAINT "Province_pkey" PRIMARY KEY (id);


--
-- Name: ScreeningQuestionChoice ScreeningQuestionChoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ScreeningQuestionChoice"
    ADD CONSTRAINT "ScreeningQuestionChoice_pkey" PRIMARY KEY (id);


--
-- Name: ScreeningQuestion ScreeningQuestion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ScreeningQuestion"
    ADD CONSTRAINT "ScreeningQuestion_pkey" PRIMARY KEY (id);


--
-- Name: Skills Skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Skills"
    ADD CONSTRAINT "Skills_pkey" PRIMARY KEY (id);


--
-- Name: Subdistrict Subdistrict_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subdistrict"
    ADD CONSTRAINT "Subdistrict_pkey" PRIMARY KEY (id);


--
-- Name: UniversityFaculty UniversityFaculty_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UniversityFaculty"
    ADD CONSTRAINT "UniversityFaculty_pkey" PRIMARY KEY (id);


--
-- Name: University University_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."University"
    ADD CONSTRAINT "University_pkey" PRIMARY KEY (id);


--
-- Name: UserProjects UserProjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserProjects"
    ADD CONSTRAINT "UserProjects_pkey" PRIMARY KEY (id);


--
-- Name: UserSkill UserSkill_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSkill"
    ADD CONSTRAINT "UserSkill_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WorkHistory WorkHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkHistory"
    ADD CONSTRAINT "WorkHistory_pkey" PRIMARY KEY (id);


--
-- Name: Bookmark_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Bookmark_candidateId_idx" ON public."Bookmark" USING btree ("candidateId");


--
-- Name: Bookmark_companyId_candidateId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Bookmark_companyId_candidateId_key" ON public."Bookmark" USING btree ("companyId", "candidateId");


--
-- Name: Bookmark_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Bookmark_companyId_idx" ON public."Bookmark" USING btree ("companyId");


--
-- Name: CandidateContactFile_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CandidateContactFile_candidateId_idx" ON public."CandidateContactFile" USING btree ("candidateId");


--
-- Name: CandidatePreferredProvince_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CandidatePreferredProvince_candidateId_idx" ON public."CandidatePreferredProvince" USING btree ("candidateId");


--
-- Name: CandidatePreferredProvince_candidateId_provinceId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CandidatePreferredProvince_candidateId_provinceId_key" ON public."CandidatePreferredProvince" USING btree ("candidateId", "provinceId");


--
-- Name: CandidatePreferredProvince_provinceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CandidatePreferredProvince_provinceId_idx" ON public."CandidatePreferredProvince" USING btree ("provinceId");


--
-- Name: CandidateProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CandidateProfile_userId_key" ON public."CandidateProfile" USING btree ("userId");


--
-- Name: CandidateResume_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CandidateResume_candidateId_idx" ON public."CandidateResume" USING btree ("candidateId");


--
-- Name: CandidateResume_isPrimary_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CandidateResume_isPrimary_idx" ON public."CandidateResume" USING btree ("isPrimary");


--
-- Name: CandidateUniversity_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CandidateUniversity_candidateId_idx" ON public."CandidateUniversity" USING btree ("candidateId");


--
-- Name: CandidateUniversity_universityFacultyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CandidateUniversity_universityFacultyId_idx" ON public."CandidateUniversity" USING btree ("universityFacultyId");


--
-- Name: CandidateUniversity_universityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CandidateUniversity_universityId_idx" ON public."CandidateUniversity" USING btree ("universityId");


--
-- Name: CertificateFile_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CertificateFile_candidateId_idx" ON public."CertificateFile" USING btree ("candidateId");


--
-- Name: CompanyEmail_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CompanyEmail_companyId_idx" ON public."CompanyEmail" USING btree ("companyId");


--
-- Name: CompanyPhone_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "CompanyPhone_companyId_idx" ON public."CompanyPhone" USING btree ("companyId");


--
-- Name: CompanyProfile_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CompanyProfile_userId_key" ON public."CompanyProfile" USING btree ("userId");


--
-- Name: Conversation_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_candidateId_idx" ON public."Conversation" USING btree ("candidateId");


--
-- Name: Conversation_companyId_candidateId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Conversation_companyId_candidateId_key" ON public."Conversation" USING btree ("companyId", "candidateId");


--
-- Name: Conversation_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_companyId_idx" ON public."Conversation" USING btree ("companyId");


--
-- Name: Conversation_updatedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_updatedAt_idx" ON public."Conversation" USING btree ("updatedAt");


--
-- Name: District_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "District_code_idx" ON public."District" USING btree (code);


--
-- Name: District_provinceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "District_provinceId_idx" ON public."District" USING btree ("provinceId");


--
-- Name: District_provinceId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "District_provinceId_name_key" ON public."District" USING btree ("provinceId", name);


--
-- Name: Faculty_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Faculty_code_key" ON public."Faculty" USING btree (code);


--
-- Name: Faculty_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Faculty_name_key" ON public."Faculty" USING btree (name);


--
-- Name: Faculty_thname_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Faculty_thname_key" ON public."Faculty" USING btree (thname);


--
-- Name: JobApplication_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobApplication_candidateId_idx" ON public."JobApplication" USING btree ("candidateId");


--
-- Name: JobApplication_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobApplication_createdAt_idx" ON public."JobApplication" USING btree ("createdAt");


--
-- Name: JobApplication_jobPostId_candidateId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "JobApplication_jobPostId_candidateId_key" ON public."JobApplication" USING btree ("jobPostId", "candidateId");


--
-- Name: JobApplication_jobPostId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobApplication_jobPostId_idx" ON public."JobApplication" USING btree ("jobPostId");


--
-- Name: JobApplication_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobApplication_status_idx" ON public."JobApplication" USING btree (status);


--
-- Name: JobBookmark_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobBookmark_candidateId_idx" ON public."JobBookmark" USING btree ("candidateId");


--
-- Name: JobBookmark_jobPostId_candidateId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "JobBookmark_jobPostId_candidateId_key" ON public."JobBookmark" USING btree ("jobPostId", "candidateId");


--
-- Name: JobBookmark_jobPostId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobBookmark_jobPostId_idx" ON public."JobBookmark" USING btree ("jobPostId");


--
-- Name: JobIgnore_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobIgnore_candidateId_idx" ON public."JobIgnore" USING btree ("candidateId");


--
-- Name: JobIgnore_jobPostId_candidateId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "JobIgnore_jobPostId_candidateId_key" ON public."JobIgnore" USING btree ("jobPostId", "candidateId");


--
-- Name: JobIgnore_jobPostId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobIgnore_jobPostId_idx" ON public."JobIgnore" USING btree ("jobPostId");


--
-- Name: JobPost_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobPost_companyId_idx" ON public."JobPost" USING btree ("companyId");


--
-- Name: JobPost_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobPost_createdAt_idx" ON public."JobPost" USING btree ("createdAt");


--
-- Name: JobPost_state_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "JobPost_state_idx" ON public."JobPost" USING btree (state);


--
-- Name: Message_conversationId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_conversationId_createdAt_idx" ON public."Message" USING btree ("conversationId", "createdAt");


--
-- Name: Message_conversationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_conversationId_idx" ON public."Message" USING btree ("conversationId");


--
-- Name: Message_senderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Message_senderId_idx" ON public."Message" USING btree ("senderId");


--
-- Name: Province_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Province_code_idx" ON public."Province" USING btree (code);


--
-- Name: Province_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Province_code_key" ON public."Province" USING btree (code);


--
-- Name: Province_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Province_name_key" ON public."Province" USING btree (name);


--
-- Name: Province_thname_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Province_thname_key" ON public."Province" USING btree (thname);


--
-- Name: ScreeningQuestionChoice_questionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ScreeningQuestionChoice_questionId_idx" ON public."ScreeningQuestionChoice" USING btree ("questionId");


--
-- Name: ScreeningQuestionChoice_questionId_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ScreeningQuestionChoice_questionId_order_idx" ON public."ScreeningQuestionChoice" USING btree ("questionId", "order");


--
-- Name: ScreeningQuestion_jobPostId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ScreeningQuestion_jobPostId_idx" ON public."ScreeningQuestion" USING btree ("jobPostId");


--
-- Name: ScreeningQuestion_jobPostId_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ScreeningQuestion_jobPostId_order_idx" ON public."ScreeningQuestion" USING btree ("jobPostId", "order");


--
-- Name: Skills_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Skills_name_key" ON public."Skills" USING btree (name);


--
-- Name: Subdistrict_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Subdistrict_code_idx" ON public."Subdistrict" USING btree (code);


--
-- Name: Subdistrict_districtId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Subdistrict_districtId_idx" ON public."Subdistrict" USING btree ("districtId");


--
-- Name: Subdistrict_districtId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Subdistrict_districtId_name_key" ON public."Subdistrict" USING btree ("districtId", name);


--
-- Name: UniversityFaculty_facultyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UniversityFaculty_facultyId_idx" ON public."UniversityFaculty" USING btree ("facultyId");


--
-- Name: UniversityFaculty_universityId_facultyId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UniversityFaculty_universityId_facultyId_key" ON public."UniversityFaculty" USING btree ("universityId", "facultyId");


--
-- Name: UniversityFaculty_universityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UniversityFaculty_universityId_idx" ON public."UniversityFaculty" USING btree ("universityId");


--
-- Name: University_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "University_code_idx" ON public."University" USING btree (code);


--
-- Name: University_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "University_name_key" ON public."University" USING btree (name);


--
-- Name: University_thname_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "University_thname_key" ON public."University" USING btree (thname);


--
-- Name: UserProjects_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserProjects_candidateId_idx" ON public."UserProjects" USING btree ("candidateId");


--
-- Name: UserSkill_candidateId_skillId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserSkill_candidateId_skillId_key" ON public."UserSkill" USING btree ("candidateId", "skillId");


--
-- Name: UserSkill_skillId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "UserSkill_skillId_idx" ON public."UserSkill" USING btree ("skillId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_socialID_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_socialID_key" ON public."User" USING btree ("socialID");


--
-- Name: WorkHistory_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WorkHistory_candidateId_idx" ON public."WorkHistory" USING btree ("candidateId");


--
-- Name: Bookmark Bookmark_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Bookmark"
    ADD CONSTRAINT "Bookmark_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Bookmark Bookmark_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Bookmark"
    ADD CONSTRAINT "Bookmark_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."CompanyProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CandidateContactFile CandidateContactFile_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidateContactFile"
    ADD CONSTRAINT "CandidateContactFile_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CandidatePreferredProvince CandidatePreferredProvince_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidatePreferredProvince"
    ADD CONSTRAINT "CandidatePreferredProvince_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CandidatePreferredProvince CandidatePreferredProvince_provinceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidatePreferredProvince"
    ADD CONSTRAINT "CandidatePreferredProvince_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES public."Province"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CandidateProfile CandidateProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidateProfile"
    ADD CONSTRAINT "CandidateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CandidateResume CandidateResume_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidateResume"
    ADD CONSTRAINT "CandidateResume_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CandidateUniversity CandidateUniversity_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidateUniversity"
    ADD CONSTRAINT "CandidateUniversity_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CandidateUniversity CandidateUniversity_universityFacultyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidateUniversity"
    ADD CONSTRAINT "CandidateUniversity_universityFacultyId_fkey" FOREIGN KEY ("universityFacultyId") REFERENCES public."UniversityFaculty"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CandidateUniversity CandidateUniversity_universityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CandidateUniversity"
    ADD CONSTRAINT "CandidateUniversity_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES public."University"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CertificateFile CertificateFile_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CertificateFile"
    ADD CONSTRAINT "CertificateFile_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompanyEmail CompanyEmail_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CompanyEmail"
    ADD CONSTRAINT "CompanyEmail_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."CompanyProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompanyPhone CompanyPhone_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CompanyPhone"
    ADD CONSTRAINT "CompanyPhone_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."CompanyProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CompanyProfile CompanyProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CompanyProfile"
    ADD CONSTRAINT "CompanyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."CompanyProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: District District_provinceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."District"
    ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES public."Province"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JobApplication JobApplication_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobApplication"
    ADD CONSTRAINT "JobApplication_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JobApplication JobApplication_jobPostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobApplication"
    ADD CONSTRAINT "JobApplication_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES public."JobPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JobBookmark JobBookmark_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobBookmark"
    ADD CONSTRAINT "JobBookmark_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JobBookmark JobBookmark_jobPostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobBookmark"
    ADD CONSTRAINT "JobBookmark_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES public."JobPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JobIgnore JobIgnore_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobIgnore"
    ADD CONSTRAINT "JobIgnore_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JobIgnore JobIgnore_jobPostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobIgnore"
    ADD CONSTRAINT "JobIgnore_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES public."JobPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: JobPost JobPost_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JobPost"
    ADD CONSTRAINT "JobPost_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."CompanyProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Message Message_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."Conversation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ScreeningQuestionChoice ScreeningQuestionChoice_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ScreeningQuestionChoice"
    ADD CONSTRAINT "ScreeningQuestionChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."ScreeningQuestion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ScreeningQuestion ScreeningQuestion_jobPostId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ScreeningQuestion"
    ADD CONSTRAINT "ScreeningQuestion_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES public."JobPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subdistrict Subdistrict_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subdistrict"
    ADD CONSTRAINT "Subdistrict_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public."District"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UniversityFaculty UniversityFaculty_facultyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UniversityFaculty"
    ADD CONSTRAINT "UniversityFaculty_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES public."Faculty"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UniversityFaculty UniversityFaculty_universityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UniversityFaculty"
    ADD CONSTRAINT "UniversityFaculty_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES public."University"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserProjects UserProjects_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserProjects"
    ADD CONSTRAINT "UserProjects_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserSkill UserSkill_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSkill"
    ADD CONSTRAINT "UserSkill_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserSkill UserSkill_skillId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSkill"
    ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES public."Skills"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WorkHistory WorkHistory_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkHistory"
    ADD CONSTRAINT "WorkHistory_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public."CandidateProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict lc3INzYcIgIsg6VXv6Nug6mhRaCUaRyzBVOE5hvfcAlezgO0mPITIE9K0g5Xabl

