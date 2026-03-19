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
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B1C2C] transition-colors">
      <Navbar onLoginClick={() => setIsLoginModalOpen(true)} />
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
        <section className="bg-white py-16 transition-colors dark:bg-[#0B1C2C] lg:py-20">
          <div className="layout-container">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
              {/* Left Side - Text Content */}
              <div className="space-y-6 lg:max-w-[460px] lg:space-y-8">
                <p className="text-lg text-[#A9B4CD] transition-colors dark:text-[#8A94A6] lg:text-[28px] lg:leading-none">Welcome...</p>
                <h1 className="text-4xl font-bold leading-[1.05] text-[#1C2D4F] transition-colors dark:text-white lg:text-[62px]">
                  Your future start here
                </h1>
                <p className="max-w-[430px] text-base leading-relaxed text-[#A9B4CD] transition-colors dark:text-[#B0B8C1] lg:text-[18px]">
                  Connecting companies with top talent, and students with career-building opportunities
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="inline-flex min-w-[105px] items-center justify-center rounded-md px-6 py-3 text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: '#2F80ED' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C6ED5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2F80ED'}
                  >
                    Start here
                  </button>
                </div>
              </div>

              {/* Right Side - MacBook Image */}
              <div className="flex items-center justify-end">
                <div className="w-full max-w-[520px] lg:max-w-[560px]">
                  <Image
                    src="/15_ Macbook Pro Mockup Front view.png"
                    alt="MacBook Pro Mockup"
                    width={1200}
                    height={800}
                    className="w-full h-auto"
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

