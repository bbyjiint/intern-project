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
  textSizeClassName = 'text-[32px] font-semibold tracking-[-0.04em]',
  dotClassName = 'h-[20px] w-[20px] -left-[12px] top-[1px]',
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
