'use client'

import { useState } from 'react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoginModal from '@/components/LoginModal'
import RegisterModal from '@/components/RegisterModal'

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-white transition-colors dark:bg-[#0B1C2C]">
      <Navbar onLoginClick={() => setIsLoginModalOpen(true)} onRegisterClick={() => setIsRegisterModalOpen(true)} />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSignUpClick={() => setIsRegisterModalOpen(true)}
      />
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />
      <main className="flex-grow">
       
      {/* Hero Section */}
      <section className="bg-white py-10 transition-colors dark:bg-[#0B1C2C] lg:py-20">
        <div className="layout-container">
          {/* ปรับตรงนี้: flex-col-reverse จะทำให้ Text ขึ้นก่อน Image ในมือถือ */}
          <div className="flex flex-col-reverse items-center gap-10 lg:grid lg:grid-cols-2 lg:gap-24">
            
            {/* Left Side - Text Content */}
            <div className="space-y-6 text-center lg:text-left lg:max-w-[460px] lg:space-y-8">
              <p className="text-lg text-[#A9B4CD] transition-colors dark:text-[#8A94A6] lg:text-[28px] lg:leading-none">
                Welcome...
              </p>
              <h1 className="text-3xl font-bold leading-tight text-[#1C2D4F] transition-colors dark:text-white lg:text-[62px]">
                Your future start here
              </h1>
              <p className="mx-auto lg:mx-0 max-w-[430px] text-base leading-relaxed text-[#A9B4CD] transition-colors dark:text-[#B0B8C1] lg:text-[18px]">
                Connecting companies with top talent, and students with career-building opportunities
              </p>
              <div className="pt-4 lg:pt-0">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="w-full sm:w-auto inline-flex min-w-[160px] items-center justify-center rounded-md px-8 py-4 text-base font-medium text-white transition-colors"
                  style={{ backgroundColor: '#2F80ED' }}
                >
                  Start here
                </button>
              </div>
            </div>

            {/* Right Side - MacBook Image */}
            <div className="w-full flex items-center justify-center lg:justify-end">
              <div className="w-[85%] max-w-[400px] lg:max-w-[560px] lg:w-full">
                <Image
                  src="/15_ Macbook Pro Mockup Front view.png"
                  alt="MacBook Pro Mockup"
                  width={1200}
                  height={800}
                  className="w-full h-auto drop-shadow-2xl"
                  priority
                  style={{ objectFit: 'contain' }}
                />
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

