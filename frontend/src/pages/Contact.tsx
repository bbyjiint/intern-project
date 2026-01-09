import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
    alert('ขอบคุณสำหรับข้อความของคุณ!')
    setFormData({ name: '', email: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">ติดต่อเรา</h1>
          <p className="text-xl text-gray-600">
            เรายินดีรับฟังความคิดเห็นและคำถามจากคุณ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-6">ข้อมูลติดต่อ</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">ที่อยู่</h3>
                <p className="text-gray-600">
                  123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพมหานคร 10110
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">อีเมล</h3>
                <p className="text-gray-600">contact@internwebsite.com</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">โทรศัพท์</h3>
                <p className="text-gray-600">02-123-4567</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">เวลาทำการ</h3>
                <p className="text-gray-600">จันทร์ - ศุกร์: 09:00 - 18:00 น.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-6">ส่งข้อความ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  ข้อความ
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                ส่งข้อความ
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}



