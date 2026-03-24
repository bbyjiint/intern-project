'use client'

import { useState } from 'react' // เพิ่ม useState
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
// สมมติว่าไฟล์ Modal อยู่ในโฟลเดอร์ components/auth หรือที่เดียวกับ Navbar
import LoginModal from '@/components/LoginModal' 
import RegisterModal from '@/components/RegisterModal'

export default function AboutPage() {
  // 1. เพิ่ม State สำหรับเปิด-ปิด Modal
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* 2. จัดการ Props ให้ Navbar และ Modals */}
      <Navbar 
        onLoginClick={() => setIsLoginModalOpen(true)} 
        onRegisterClick={() => setIsRegisterModalOpen(true)} 
      />
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSignUpClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="bg-cover bg-center bg-no-repeat min-h-[300px] sm:h-[400px] text-white py-12 sm:py-16 relative flex items-center"
          style={{
            backgroundImage: "url('/image/abousimg.png')"
          }}
        >
          {/* Overlay สำหรับมือถือให้อ่านข้อความง่ายขึ้น */}
          <div className="absolute inset-0 bg-black/30 sm:bg-transparent"></div>
          
          <div className="layout-container relative z-10 w-full">
            <div className="flex flex-col justify-center items-center text-center px-4">
              <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-8 mt-2 sm:mt-5 text-shadow">เกี่ยวกับเรา</h1>
              <div className="max-w-4xl font-bold mt-2">
                <p className="text-sm sm:text-[17px] leading-relaxed">
                  พวกเราเชื่อมั่นว่าทุกคนควรสามารถลงทุนในหลักทรัพย์มากมายหลากหลายประเภท
                </p>
                <p className="text-sm sm:text-[17px] leading-relaxed">
                  ตามที่ต้องการได้อย่างสะดวกสบายเพื่อไล่ตามความฝันและบรรลุเป้าหมายทางการเงินที่ได้ตั้งใจไว้
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ข้อมูลบริษัท Section */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="layout-container px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Team Photo Card */}
              <div className="relative order-2 lg:order-1">
                <div className="w-full h-[300px] sm:h-[500px] rounded-3xl bg-gray-200 relative overflow-hidden shadow-xl">
                  <Image
                    src="/image/3pyimg.png"
                    alt="Team"
                    fill
                    className="object-cover rounded-3xl"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              
              {/* Right Side - Company Info */}
              <div className="order-1 lg:order-2 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">ข้อมูลบริษัท</h2>
                <div className="space-y-4 text-gray-800 leading-relaxed text-sm sm:text-[17px] font-normal">
                  <p>
                    บริษัทหลักทรัพย์ พาย หรือ Pi Securities เป็นผู้ให้บริการด้านการลงทุนชั้นนำของประเทศไทยมาอย่างยาวนานกว่า 50 ปี 
                    เราเป็นสมาชิกหมายเลข 3 ของตลาดหลักทรัพย์แห่งประเทศไทย (SET) 
                    และอยู่ภายใต้การกำกับดูแลของสำนักงานคณะกรรมการกำกับหลักทรัพย์และตลาดหลักทรัพย์ (ก.ล.ต.)
                  </p>
                  <p>
                    โดยเราเป็นผู้ออกแบบและพัฒนาแอปพลิเคชัน Pi Financial ที่อำนวยความสะดวกในการซื้อขายแลกเปลี่ยนหลักทรัพย์หลากหลายประเภทในตลาดทั่วโลกได้อย่างง่ายดายและปลอดภัย 
                    เพื่อช่วยให้นักลงทุนทุก ๆ คนมีพอร์ตที่เติบโตงอกเงยและประสบความสำเร็จด้านการเงินตามที่ตัวเองตั้งเป้าไว้ได้ง่ายขึ้นกว่าเดิม
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* วิสัยทัศน์ Section */}
        <section className="py-12 sm:py-16 bg-black text-white relative overflow-hidden">
          <div className="layout-container relative flex flex-col lg:flex-row items-center justify-between px-4">
            {/* ฝั่งข้อความ */}
            <div className="w-full lg:w-1/2 mb-10 lg:mb-0 text-center lg:text-left z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">วิสัยทัศน์</h2>
              <p className="text-sm sm:text-[17px] leading-relaxed font-normal max-w-lg mx-auto lg:mx-0">
                สร้างสังคมไทยให้เป็นสังคมทางการเงินที่แข็งแกร่ง 
                และเท่าเทียมเพื่อให้ทุกคนสามารถเข้าถึงบริการทางการลงทุนได้ง่ายและ 
                มีประสิทธิภาพ 
                สามารถไปถึงเป้าหมายความมั่งคั่งตามที่ได้วางแผนไว้
              </p>
            </div>
            
            {/* ฝั่งรูปภาพ */}
            <div className="relative w-full lg:w-1/2 h-[250px] sm:h-[400px] flex items-center justify-center">
              {/* รูปเหรียญ (Coin) */}
              <img
                src="/image/coinremovebg-preview.png"
                alt="coin"
                className="absolute top-[-50px] sm:top-[-160px] right-[-20px] sm:right-[-40px] w-[600px] sm:w-[1500px] max-w-none z-0 object-contain opacity-50 sm:opacity-100"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              
              {/* รูปทีม */}
              <div className="w-full lg:w-[780px] h-full sm:h-[380px] bg-gray-200 rounded-3xl z-10 relative overflow-hidden lg:ml-20">
                <img
                  src="/image/upscalemediapiimg.png"
                  alt="team"
                  className="w-full h-full object-cover rounded-3xl"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* พันธกิจ Section */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="layout-container px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Meeting Photo */}
              <div className="relative">
                <div className="w-full aspect-video sm:aspect-[16/9] bg-gray-200 rounded-3xl overflow-hidden shadow-lg">
                  <img
                    src="/image/upscaleteam1img (1).jpeg"
                    alt="team1"
                    className="w-full h-full object-cover rounded-3xl"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              </div>
              
              {/* Right Side - Mission Content */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold mb-6 text-black">พันธกิจ</h2>
                <div className="space-y-4 text-gray-900 leading-relaxed text-sm sm:text-[17px] font-normal">
                  <p>
                    เปิดโอกาสให้ทุกคนสามารถเข้าถึงการลงทุนในหลักทรัพย์หลากหลายประเภทในตลาดทุนสำคัญทั่วโลกได้แบบไร้ขีดจำกัด 
                    พร้อมนำเสนอสาระความรู้ทางการเงินที่เข้าใจง่ายจากผู้เชี่ยวชาญตัวจริงในอุตสาหกรรม
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}