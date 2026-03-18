'use client'

import Link from 'next/link'

interface CompanyHubLogoProps {
  href?: string
  className?: string
}

export default function CompanyHubLogo({
  href = '/',
  className = '',
}: CompanyHubLogoProps) {
  return (
    <Link 
      href={href} 
      className={`relative flex items-center group transition-all duration-300 ${className}.trim()`}
    >
      <span
        className="absolute rounded-full z-0 transition-transform duration-300 group-hover:scale-125 w-6 h-6 -left-1.5 top-0.5 bg-blue-500 dark:bg-blue-600 opacity-90 dark:opacity-100 shadow-sm dark:shadow-blue-500/20"
      />

      <span
        className="relative z-10 pl-3 text-2xl font-black tracking-tighter text-[#1C2D4F] dark:text-white transition-colors duration-300"
      >
        CompanyHub<span className="text-blue-600 dark:text-blue-400">.</span>
      </span>
    </Link>
  )
}