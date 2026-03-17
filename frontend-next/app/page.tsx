'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoginModal from '@/components/LoginModal'
import RegisterModal from '@/components/RegisterModal'

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#121316' }}>
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
        <section className="py-16 lg:py-24" style={{ backgroundColor: '#121316' }}>
          <div className="layout-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Left Side - Text Content */}
              <div className="space-y-6 lg:space-y-8">
                <p className="text-lg lg:text-xl" style={{ color: '#0273B1' }}>Welcome...</p>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1]" style={{ color: '#FFFFFF' }}>
                  Your future start here
                </h1>
                <p className="text-base lg:text-lg leading-relaxed max-w-xl" style={{ color: '#8CA2C0' }}>
                  Connecting companies with top talent, and students with career-building opportunities
                </p>
                <div>
                  <Link
                    href="/login"
                    className="inline-block text-white px-8 py-3 rounded-md transition-colors font-medium text-base"
                    style={{ 
                      backgroundColor: '#0273B1',
                      border: '1px solid #486284'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0284CC';
                      e.currentTarget.style.borderColor = '#0284CC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0273B1';
                      e.currentTarget.style.borderColor = '#486284';
                    }}
                  >
                    Start here
                  </Link>
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

