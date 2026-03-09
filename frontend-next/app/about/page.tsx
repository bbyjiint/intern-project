'use client'

import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <div className="flex-1">
        {/* Hero Section */}
        <section 
          className="bg-cover bg-center bg-no-repeat h-[400px] text-white py-16 relative"
          style={{
            backgroundImage: "url('/image/abousimg.png')"
          }}
        >
          <div className="layout-container relative z-10">
            <div className="flex flex-col justify-center items-center text-center">
              <h1 className="text-5xl font-bold mb-8 mt-5">เกี่ยวกับเรา</h1>
              <div className="max-w-4xl font-bold mt-2">
                <p className="text-[17px] leading-relaxed">
                  พวกเราเชื่อมั่นว่าทุกคนควรสามารถลงทุนในหลักทรัพย์มากมายหลากหลายประเภท
                </p>
                <p className="text-[17px] leading-relaxed">
                  ตามที่ต้องการได้อย่างสะดวกสบายเพื่อไล่ตามความฝันและบรรลุเป้าหมายทางการเงินที่ได้ตั้งใจไว้
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ข้อมูลบริษัท Section */}
        <section className="py-16 bg-white">
          <div className="layout-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pr-5">
              {/* Left Side - Team Photo Card */}
              <div className="relative mr-5">
                <div className="w-full h-[500px] rounded-3xl bg-gray-200 relative overflow-hidden">
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
              <div className="ml-5">
                <h2 className="text-4xl font-bold mb-6 text-gray-800">ข้อมูลบริษัท</h2>
                <div className="space-y-4 text-gray-800 leading-relaxed text-[17px] font-normal">
                  <p>
                    บริษัทหลักทรัพย์ พาย หรือ Pi Securities <br /> เป็นผู้ให้บริการด้านการลงทุนชั้นนำของประเทศไทยมาอย่างยาวนานกว่า 50 ปี 
                    เราเป็นสมาชิกหมายเลข 3 <br /> ของตลาดหลักทรัพย์แห่งประเทศไทย (SET) <br />
                    และอยู่ภายใต้การกำกับดูแลของสำนักงานคณะกรรมการกำกับหลักทรัพย์และตลาดหลักทรัพย์ (ก.ล.ต.) <br />
                  </p>
                  <p>
                    โดยเราเป็นผู้ออกแบบและพัฒนาแอปพลิเคชัน Pi Financial <br /> ที่อำนวยความสะดวกในการซื้อขายแลกเปลี่ยนหลักทรัพย์หลากหลายประเภทในตลาดทั่วโลกได้อย่างง่าย <br />
                    ดายและปลอดภัย 
                    เพื่อช่วยให้นักลงทุนทุก ๆ <br /> คนมีพอร์ตที่เติบโตงอกเงยและประสบความสำเร็จด้านการเงินตามที่ตัวเองตั้งเป้าไว้ได้ง่ายขึ้นกว่าเดิม <br />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* วิสัยทัศน์ Section */}
        <section className="py-16 bg-black text-white relative overflow-visible">
          <div className="layout-container relative flex items-center justify-between">
            {/* ฝั่งข้อความ */}
            <div className="w-full lg:w-1/2 mb-10">
              <h2 className="text-4xl font-bold mb-4">วิสัยทัศน์</h2>
              <p className="text-[17px] leading-relaxed font-normal">
                สร้างสังคมไทยให้เป็นสังคมทางการเงินที่แข็งแกร่ง <br />
                และเท่าเทียมเพื่อให้ทุกคนสามารถเข้าถึงบริการทางการลงทุนได้ง่ายและ <br />
                มีประสิทธิภาพ 
                สามารถไปถึงเป้าหมายความมั่งคั่งตามที่ได้วางแผนไว้
              </p>
            </div>
            
            <div className="relative w-full lg:w-1/2 h-[400px] mt-10 lg:mt-0 overflow-visible">
              <img
                src="/image/coinremovebg-preview.png"
                alt="coin"
                className="absolute top-[-160px] right-[-40px] w-[1500px] z-0 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              
              <div className="w-[780px] h-[380px] bg-gray-200 rounded-3xl z-10 relative overflow-hidden ml-20 mb-10">
                <img
                  src="/image/upscalemediapiimg.png"
                  alt="team"
                  className="w-full h-full object-cover rounded-3xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* พันธกิจ Section */}
        <section className="py-16 bg-gray-50 min-h-[600px]">
          <div className="layout-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Meeting Photo */}
              <div className="relative">
                <div className="rounded-2xl p-6 relative">
                  <div className="w-full h-full rounded-xl relative aspect-video bg-gray-200">
                    <img
                      src="/image/upscaleteam1img (1).jpeg"
                      alt="team1"
                      className="w-full h-full object-cover rounded-3xl"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Right Side - Mission Content */}
              <div>
                <h2 className="text-3xl font-bold mb-6 text-black">พันธกิจ</h2>
                <div className="space-y-4 text-gray-900 leading-relaxed text-[17px] font-normal">
                  <p>
                    เปิดโอกาสให้ทุกคนสามารถเข้าถึงการลงทุนในหลักทรัพย์หลากหลาย <br />ประเภทในตลาดทุนสำคัญทั่วโลกได้แบบไร้ขีดจำกัด <br />
                    พร้อมนำเสนอสาระความรู้ทางการเงินที่เข้าใจง่ายจากผู้เชี่ยวชาญตัว <br />จริงในอุตสาหกรรม
                  </p>
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
