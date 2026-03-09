"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import InternNavbar from "@/components/InternNavbar";

// 1. Interface สำหรับหน้า Detail (เตรียมพร้อมต่อ Backend)
interface JobDetailData {
  id: string;
  postedDate: string;
  jobTitle: string;
  companyName: string;
  companyEmail: string;
  companyLogo?: string;
  workType: string;
  roleType: string;
  positionsAvailable: number;
  jobDescription: string[];
  qualifications: string[];
  gpa: string;
  allowance: string;
  location: string;
  workingDaysHours: string;
  companyDescription: string;
  contactPhone: string;
  contactDepartment: string;
  address: string;
  mapEmbedUrl: string;
}

// 2. Mock Data (จำลองข้อมูลให้ตรงกับในรูป)
const mockJobDetail: JobDetailData = {
  id: "1",
  postedDate: "3 January 2026",
  jobTitle: "รับนักศึกษาฝึกงาน AI Engineer",
  companyName: "Trinity Securities Co., Ltd.",
  companyEmail: "info@trinitythai.com",
  workType: "Hybrid",
  roleType: "AI Developer",
  positionsAvailable: 3,
  jobDescription: [
    "ร่วมออกแบบและพัฒนาโมดูลด้านปัญญาประดิษฐ์ เพื่อประยุกต์ใช้ในโครงการของบริษัท",
    "วิเคราะห์และช่วยทีมในการเตรียมและจัดการชุดข้อมูล (Data Cleaning, Preprocessing)",
    "ทำ Web Scraping / Data Crawling เพื่อรวบรวมข้อมูลจากเว็บไซต์และ API",
    "สร้างและทดสอบโมเดล Machine Learning / Deep Learning สำหรับการประมวลผลภาพ เสียง หรือข้อความ",
  ],
  qualifications: [
    "นักศึกษาระดับปริญญาตรีสาขา Computer Science, Engineering, Data Science, AI หรือสาขาที่เกี่ยวข้อง",
    "มีพื้นฐานในการเขียนโปรแกรมภาษา Python และเข้าใจพื้นฐาน AI / ML",
    "เข้าใจพื้นฐานของ Machine Learning / Deep Learning",
    "เข้าใจหลักการทำงานของ NLP (Tokenization, Embedding, Sentiment Analysis เบื้องต้น)",
    "ค้นคว้าเทคโนโลยีใหม่ ๆ และสามารถ เรียนรู้ด้วยตนเอง (Self-learning)",
  ],
  gpa: "> 3.50",
  allowance: "5,000 - 7,000 THB",
  location: "Bangkok",
  workingDaysHours: "Monday–Friday, 9:30 AM – 4:00 PM",
  companyDescription:
    "Trinity Securities Co., Ltd. is a leading Thai securities company providing comprehensive financial and investment services. The company offers brokerage services, investment advisory, wealth management, and capital market solutions for individual and institutional clients.",
  contactPhone: "+66 2 343 9500",
  contactDepartment: "Human Resources Department",
  address:
    "90 Ratchadaphisek Road, 25th Floor, Lumphini, Pathum Wan, Bangkok 10330, Thailand",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.5946115984633!2d100.56066291527715!3d13.742962390352528!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29eef26f33273%3A0xc345f2bd6de02cf6!2sTrinity%20Securities%20Co.%2C%20Ltd.!5e0!3m2!1sen!2sth!4v1675234567890!5m2!1sen!2sth",
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id; // ดึง ID จาก URL (เช่น /intern/job/1)

  const [job, setJob] = useState<JobDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 3. จำลองการดึงข้อมูลจาก Backend
  useEffect(() => {
    const fetchJobDetail = async () => {
      // TODO: อนาคตให้ใช้ apiFetch ดึงข้อมูลจาก Backend โดยใช้ jobId
      // const response = await apiFetch(`/api/jobs/${jobId}`);
      
      // ตอนนี้ใช้ Mock Data ไปก่อน
      setTimeout(() => {
        setJob(mockJobDetail);
        setIsLoading(false);
      }, 500); // ดีเลย์จำลองการโหลด
    };

    fetchJobDetail();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
        <InternNavbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!job) return <div>Job not found</div>;

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
      <InternNavbar />

      {/* Main Container - ตรงกลางหน้าจอ */}
      <div className="layout-container layout-page">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-gray-600 font-bold text-[15px] mb-6 hover:text-black transition-colors"
        >
          &lt;&lt; Back
        </button>

        {/* 2 Columns Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* ================= LEFT COLUMN: Job Details ================= */}
          <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10 w-full">
            {/* Date */}
            <div className="flex items-center text-gray-500 mb-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">{job.postedDate}</span>
            </div>

            {/* Title & Company */}
            <h1 className="text-[28px] font-extrabold text-black mb-1">
              {job.jobTitle}
            </h1>
            <p className="text-gray-500 mb-6">{job.companyName}</p>

            {/* Tags */}
            <div className="flex gap-3 mb-8">
              <span className="bg-[#2563EB] text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                {job.workType}
              </span>
              <span className="bg-[#E2E8F0] text-gray-700 px-4 py-1.5 rounded-lg text-sm font-bold">
                {job.roleType}
              </span>
            </div>

            <h3 className="text-lg font-bold text-black mb-8">
              Number of positions available: {job.positionsAvailable}
            </h3>

            {/* Job Description */}
            <div className="mb-8">
              <h3 className="text-[17px] font-bold text-black mb-3">Job description</h3>
              <ul className="space-y-2">
                {job.jobDescription.map((desc, idx) => (
                  <li key={idx} className="text-gray-600 text-[15px] leading-relaxed flex items-start">
                    <span className="mr-2">-</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Applicant qualifications */}
            <div className="mb-8">
              <h3 className="text-[17px] font-bold text-black mb-3">Applicant qualifications</h3>
              <ul className="space-y-2">
                {job.qualifications.map((qual, idx) => (
                  <li key={idx} className="text-gray-600 text-[15px] leading-relaxed flex items-start">
                    <span className="mr-2">-</span>
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other Details (GPA, Allowance, etc.) */}
            <div className="space-y-6 mb-12">
              <div>
                <h3 className="text-[17px] font-bold text-black mb-1">GPA</h3>
                <p className="text-gray-600 text-[15px]">{job.gpa}</p>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-black mb-1">Allowance</h3>
                <p className="text-gray-600 text-[15px]">{job.allowance}</p>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-black mb-1">Preferred Location</h3>
                <p className="text-gray-600 text-[15px]">{job.location}</p>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-black mb-1">Working Days & Hours</h3>
                <p className="text-gray-600 text-[15px]">{job.workingDaysHours}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 border-t pt-8">
              <button
                onClick={() => router.back()}
                className="px-8 py-3 rounded-lg border-2 border-[#2563EB] text-[#2563EB] font-bold hover:bg-blue-50 transition-colors"
              >
                Back
              </button>
              <button className="px-8 py-3 rounded-lg bg-[#2563EB] text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors">
                &gt;&gt; Apply for this position
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Job Poster Info ================= */}
          <div className="flex-[1] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full sticky top-8">
            <h2 className="text-xl font-extrabold text-black text-center mb-6">Job Poster</h2>
            
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-[#F8F9FA] border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
                <div className="w-12 h-12 relative flex items-end justify-center">
                  <div className="absolute inset-0 bg-[#1C2D4F]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                  <div className="absolute inset-[3px] bg-[#E31837]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                  <span className="text-[6px] font-bold text-white z-10 mb-1">TRINITY</span>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-black">{job.companyName}</h3>
              <p className="text-sm text-gray-500">{job.companyEmail}</p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-8 text-center px-2">
              {job.companyDescription}
            </p>

            {/* Contact Info */}
            <div className="mb-8">
              <h4 className="text-[15px] font-bold text-black mb-4">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="w-5 h-5 text-[#2563EB] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {job.contactPhone}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <svg className="w-5 h-5 text-[#2563EB] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {job.contactDepartment}
                </div>
              </div>
            </div>

            {/* Address & Map */}
            <div>
              <h4 className="text-[15px] font-bold text-black mb-2">Address</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {job.address}
              </p>
              {/* Google Maps Embed Placeholder */}
              <div className="w-full h-48 bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                <iframe
                  src={job.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}