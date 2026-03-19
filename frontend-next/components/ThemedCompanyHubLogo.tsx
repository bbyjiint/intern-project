'use client'

import { useEffect, useState } from 'react'
import CompanyHubLogo from './CompanyHubLogo'
import CompanyHubLogoDark from './CompanyHubLogoDark'
import { useTheme } from './ThemeProvider'

interface ThemedCompanyHubLogoProps {
  href?: string
  className?: string
}

export default function ThemedCompanyHubLogo({
  href = '/',
  className = '',
}: ThemedCompanyHubLogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <CompanyHubLogo href={href} className={className} />
  }

  if (theme === 'dark') {
    return <CompanyHubLogoDark href={href} className={className} />
  }

  return <CompanyHubLogo href={href} className={className} />
}
