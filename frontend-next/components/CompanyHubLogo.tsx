'use client'

import Link from 'next/link'

interface CompanyHubLogoProps {
  href?: string
  textColor?: string
  dotColor?: string
  textSizeClassName?: string
  dotClassName?: string
  className?: string
}

export default function CompanyHubLogo({
  href = '/',
  textColor = '#1C2D4F',
  dotColor = '#3B82F6',
  textSizeClassName = 'text-2xl font-semibold tracking-tight',
  dotClassName = 'w-5 h-5 -left-1 top-1',
  className = '',
}: CompanyHubLogoProps) {
  return (
    <Link href={href} className={`relative flex items-center group ${className}`.trim()}>
      <span
        className={`absolute rounded-full z-0 transition-transform group-hover:scale-110 ${dotClassName}`}
        style={{ backgroundColor: dotColor }}
      />
      <span
        className={`relative z-10 pl-2 ${textSizeClassName}`}
        style={{ color: textColor }}
      >
        CompanyHub.
      </span>
    </Link>
  )
}
