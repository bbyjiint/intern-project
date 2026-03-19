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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
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
        <section className="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors">
          <div className="layout-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Left Side - Text Content */}
              <div className="space-y-6 lg:space-y-8">
                <p className="text-lg lg:text-xl text-[#A9B4CD] dark:text-gray-400 transition-colors">Welcome...</p>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] text-[#1C2D4F] dark:text-white transition-colors">
                  Your future start here
                </h1>
                <p className="text-base lg:text-lg leading-relaxed max-w-xl text-[#A9B4CD] dark:text-gray-300 transition-colors">
                  Connecting companies with top talent, and students with career-building opportunities
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="inline-block text-white px-8 py-3 rounded-md transition-colors font-medium text-base"
                    style={{ backgroundColor: '#0273B1' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#025a8f'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0273B1'}
                  >
                    Start here
                  </button>
                </div>
              </div>

              {/* Right Side - MacBook Image */}
              <div className="flex justify-end items-center">
                <div className="w-full max-w-4xl">
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

