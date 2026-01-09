export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">เว็บเด็กฝึกงาน</h3>
            <p className="text-gray-400">
              แพลตฟอร์มสำหรับการฝึกงานและการพัฒนาทักษะ
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">ลิงก์</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">หน้าแรก</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">เกี่ยวกับเรา</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">ติดต่อเรา</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">ติดต่อ</h3>
            <p className="text-gray-400">
              Email: contact@internwebsite.com
            </p>
            <p className="text-gray-400">
              Tel: 02-123-4567
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 เว็บเด็กฝึกงาน. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    </footer>
  )
}



