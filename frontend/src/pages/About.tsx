export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">เกี่ยวกับเรา</h1>
          <p className="text-xl text-gray-600">
            เรียนรู้เพิ่มเติมเกี่ยวกับเว็บเด็กฝึกงาน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">วิสัยทัศน์</h2>
            <p className="text-gray-600">
              เราเชื่อว่าการฝึกงานเป็นก้าวแรกที่สำคัญในการพัฒนาอาชีพ 
              เป้าหมายของเราคือการสร้างแพลตฟอร์มที่ช่วยให้นักศึกษาสามารถค้นหา
              และเข้าถึงโอกาสการฝึกงานที่ดีที่สุดได้อย่างง่ายดาย
            </p>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">พันธกิจ</h2>
            <p className="text-gray-600">
              เรามุ่งมั่นในการเชื่อมโยงนักศึกษากับองค์กรต่างๆ 
              และให้การสนับสนุนตลอดกระบวนการฝึกงาน 
              เพื่อให้แน่ใจว่าทุกคนจะได้รับประสบการณ์ที่มีคุณค่า
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">ทีมงาน</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                👤
              </div>
              <h3 className="font-semibold">ชื่อสมาชิก 1</h3>
              <p className="text-gray-600 text-sm">ตำแหน่ง</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                👤
              </div>
              <h3 className="font-semibold">ชื่อสมาชิก 2</h3>
              <p className="text-gray-600 text-sm">ตำแหน่ง</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                👤
              </div>
              <h3 className="font-semibold">ชื่อสมาชิก 3</h3>
              <p className="text-gray-600 text-sm">ตำแหน่ง</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



