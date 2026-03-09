'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      
      <div className="flex-1">
        {/* Contact Information Section */}
        <section className="py-16 bg-black text-white">
          <div className="layout-container">
            <div className="max-w-3xl mx-auto">
              {/* Heading */}
              <h1 className="text-4xl md:text-5xl font-bold mb-16 text-center" style={{ color: '#0273B1' }}>
                ติดต่อเรา
              </h1>

              <div className="space-y-8">
                {/* Address */}
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 mt-1">
                    <svg 
                      className="w-7 h-7" 
                      style={{ color: '#0273B1' }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white leading-relaxed text-base">
                      132 อาคารสินธร ทาวเวอร์ 3 ชั้น 27 ถนนวิทยุ แขวนลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-5">
                  <div className="flex-shrink-0">
                    <svg 
                      className="w-7 h-7" 
                      style={{ color: '#0273B1' }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" 
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <a 
                      href="tel:022057041" 
                      className="text-white hover:text-[#0273B1] transition-colors text-base"
                    >
                      02 205 7041
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-5">
                  <div className="flex-shrink-0">
                    <svg 
                      className="w-7 h-7" 
                      style={{ color: '#0273B1' }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <a 
                      href="mailto:yanisa.ph@pi.financial" 
                      className="text-white hover:text-[#0273B1] transition-colors text-base"
                    >
                      yanisa.ph@pi.financial
                    </a>
                  </div>
                </div>

                {/* Contact Person */}
                <div className="flex items-start gap-5 pt-4">
                  <div className="flex-shrink-0">
                    <svg 
                      className="w-7 h-7" 
                      style={{ color: '#0273B1' }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-base">
                      ญาณิศา แผ่รุ่งเรื่อง (ผู้ช่วยกรรมการผู้จัดการ)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
