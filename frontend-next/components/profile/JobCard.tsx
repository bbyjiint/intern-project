import React from 'react';

// โครงสร้างข้อมูลที่จำลองให้คล้ายสิ่งที่ Backend น่าจะส่งมา
export interface JobPostData {
  id: string;
  jobTitle: string;
  companyName: string;
  companyEmail: string;
  companyLogo?: string; 
  location: string;
  workType: string;
  roleType: string;
  applicants: number;
  allowance: string;
  timeAgo?: string; // เปลี่ยนเป็น Optional เพราะหน้า AI Match ไม่มี TimeAgo
  status?: "Applied" | "Accept" | "Decline" | null; 
  isBookmarked?: boolean; 
  matchPercentage?: number; // เพิ่มสำหรับหน้า AI Match
}

interface JobCardProps {
  job: JobPostData;
  onBookmarkClick?: (id: string) => void;
  onMenuClick?: (id: string) => void;
  onClick?: (id: string) => void; 
  showActions?: boolean; // เพิ่ม Prop ว่าต้องการโชว์ปุ่ม Detail / Apply ไหม
}

export default function JobCard({ job, onBookmarkClick, onMenuClick, onClick, showActions = false }: JobCardProps) {
  // ฟังก์ชันแยกสีของ Tag รูปแบบการทำงาน
  const getWorkTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "hybrid":
        return "bg-[#3B82F6] text-white"; 
      case "on-site":
        return "bg-[#F59E0B] text-white"; 
      case "remote":
        return "bg-[#EF4444] text-white"; 
      default:
        return "bg-gray-400 text-white";
    }
  };

  // ฟังก์ชัน Render ป้ายสถานะแบบ Outline (ถ้ามีส่งมา)
  const renderStatusBadge = (status?: string | null) => {
    if (status === "Accept") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A] text-xs font-bold rounded-full">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
          </svg>
          Accept
        </span>
      );
    }
    if (status === "Decline") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444] text-xs font-bold rounded-full">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Decline
        </span>
      );
    }
    if (status === "Applied") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#F0F7FF] text-[#3B82F6] border border-[#3B82F6] text-xs font-bold rounded-full">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Applied
        </span>
      );
    }
    return null;
  };

  const renderCompanyLogo = () => {
    if (job.companyLogo && job.companyLogo !== "TRINITY" && job.companyLogo.startsWith("http")) {
      return (
        <img 
          src={job.companyLogo} 
          alt={`${job.companyName} logo`} 
          className="w-14 h-14 object-cover rounded-lg border border-gray-100"
        />
      );
    }

    return (
      <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <div className="w-8 h-8 relative flex items-end justify-center">
          <div className="absolute inset-0 bg-[#1C2D4F]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          <div className="absolute inset-[3px] bg-[#E31837]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          <span className="text-[4px] font-bold text-white z-10 mb-0.5">TRINITY</span>
        </div>
      </div>
    );
  };

  // คำนวณเส้นรอบวงสำหรับ Circular Progress (ถ้ามีค่า matchPercentage ส่งมา)
  const circumference = 100.5;
  const strokeDashoffset = job.matchPercentage !== undefined 
    ? circumference - (job.matchPercentage / 100) * circumference 
    : 0;

  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={() => onClick && onClick(job.id)}
    >
      {/* Top Row: Company Info & Match Percent / Status */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center space-x-4">
          {renderCompanyLogo()}
          <div>
            <h3 className="text-[17px] font-bold text-gray-900 leading-tight">
              {job.companyName}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {job.companyEmail}
            </p>
          </div>
        </div>
        
        {/* Right Corner (Status OR Match Percent) */}
        <div className="flex flex-col items-end space-y-2">
          
          {job.status && renderStatusBadge(job.status)}

          {/* AI Match Percentage Ring */}
          {job.matchPercentage !== undefined && !job.status && (
            <div className="relative w-[52px] h-[52px] flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#F59E0B]"
                  strokeWidth="3.5"
                  strokeDasharray={`${circumference}, ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-gray-800">
                {job.matchPercentage}%
              </span>
            </div>
          )}

          {onMenuClick && !job.matchPercentage && (
             <button 
              onClick={(e) => { e.stopPropagation(); onMenuClick(job.id); }}
              className="text-gray-300 hover:text-gray-500 transition-colors mt-1 pr-1"
             >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
               </svg>
             </button>
          )}
        </div>
      </div>

      {/* Middle Row: Job Title & Bookmark */}
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-[19px] font-bold text-black">
          {job.jobTitle}
        </h4>
        
        {/* Bookmark Icon */}
        {onBookmarkClick && ( 
          <button 
            onClick={(e) => { e.stopPropagation(); onBookmarkClick(job.id); }}
            className={`${job.isBookmarked ? 'text-gray-800' : 'text-gray-400'} hover:text-gray-800 transition-colors pr-1`}
          >
            <svg className={`w-6 h-6 ${job.isBookmarked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex space-x-2 mb-6">
        <span className={`text-[11px] font-semibold px-4 py-1.5 rounded-md ${getWorkTypeStyle(job.workType)}`}>
          {job.workType}
        </span>
        <span className="bg-[#E5E7EB] text-gray-700 text-[11px] font-semibold px-4 py-1.5 rounded-md">
          {job.roleType}
        </span>
      </div>

      {/* Job Details Grid */}
      <div className="space-y-3 mb-6 flex-1">
        <div className="grid grid-cols-[140px_1fr] items-start">
          <span className="text-gray-400 text-[15px]">Preferred</span>
          <span className="text-gray-600 text-[15px]">{job.location}</span>
        </div>
        <div className="grid grid-cols-[140px_1fr] items-center">
          <span className="text-gray-400 text-[15px] leading-tight">
            Number of<br />applicants
          </span>
          <span className="text-gray-600 text-[15px]">{job.applicants}</span>
        </div>
        <div className="grid grid-cols-[140px_1fr] items-start">
          <span className="text-gray-400 text-[15px]">Allowance</span>
          <span className="text-black text-[15px] font-bold">
            {job.allowance}
          </span>
        </div>
      </div>

      {/* Time Ago Footer (ถ้ามี) */}
      {job.timeAgo && !showActions && (
        <div className="text-right mt-auto pt-2 border-t border-transparent">
          <span className="text-[11px] text-gray-400 font-medium">
            {job.timeAgo}
          </span>
        </div>
      )}

      {/* Action Buttons Footer (สำหรับหน้า AI Match) */}
      {showActions && (
        <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-transparent">
          <button className="w-full py-2.5 bg-white border border-gray-300 rounded-lg text-gray-600 font-semibold text-[15px] hover:bg-gray-50 transition-colors">
            Detail
          </button>
          <button className="w-full py-2.5 bg-[#F8FAFC] border border-[#3B82F6] rounded-lg text-[#3B82F6] font-semibold text-[15px] hover:bg-blue-50 transition-colors">
            Apply
          </button>
        </div>
      )}
    </div>
  );
}