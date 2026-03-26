'use client'

import Link from 'next/link'

interface CompanyHubLogoDarkProps {
  href?: string
  className?: string
}

export default function CompanyHubLogoDark({
  href = '/',
  className = '',
}: CompanyHubLogoDarkProps) {
  return (
    <Link href={href} className={`relative flex items-center group ${className}`.trim()}>
      <span
        className="absolute z-0 h-4 w-4 -left-0.5 top-1 rounded-full transition-transform group-hover:scale-110 md:h-5 md:w-5 md:-left-1 md:top-1"
        style={{ backgroundColor: '#2F80ED' }}
      />
      <span
        className="relative z-10 pl-1.5 text-lg font-semibold tracking-tight md:pl-2 md:text-2xl"
        style={{ color: '#FFFFFF' }}
      >
        CompanyHub.
      </span>
    </Link>
  )
}
