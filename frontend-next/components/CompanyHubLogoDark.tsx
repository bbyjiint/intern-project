'use client'

import Link from 'next/link'

interface CompanyHubLogoDarkProps {
  href?: string
  className?: string
}

/** Same geometry as CompanyHubLogo — disc offset to the left of “C”; for dark headers. */
export default function CompanyHubLogoDark({
  href = '/',
  className = '',
}: CompanyHubLogoDarkProps) {
  const wordClass =
    'text-[17px] font-black leading-none tracking-tighter sm:text-2xl'

  return (
    <Link
      href={href}
      aria-label="CompanyHub home"
      className={`group relative inline-flex items-center gap-0 pl-2.5 transition-all duration-300 sm:pl-0 ${className}`.trim()}
    >
      <span className="relative inline-flex shrink-0 items-center justify-center">
        <span
          aria-hidden
          className="absolute left-0 top-1/2 z-0 h-[18px] w-[18px] origin-center -translate-x-[58%] -translate-y-1/2 rounded-full bg-blue-500 opacity-90 shadow-sm transition-transform duration-300 group-hover:scale-125 sm:h-6 sm:w-6"
        />
        <span className={`relative z-10 text-white ${wordClass}`}>C</span>
      </span>
      <span className={`relative z-10 text-white ${wordClass}`}>
        ompanyHub<span className="text-blue-400">.</span>
      </span>
    </Link>
  )
}
