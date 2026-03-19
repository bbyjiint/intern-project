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
        className="absolute rounded-full z-0 transition-transform group-hover:scale-110 w-5 h-5 -left-1 top-1"
        style={{ backgroundColor: '#3276FA' }}
      />
      <span
        className="relative z-10 pl-2 text-2xl font-semibold tracking-tight"
        style={{ color: '#FFFFFF' }}
      >
        CompanyHub.
      </span>
    </Link>
  )
}
