'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { apiFetch } from '@/lib/api'

export default function InternDashboardPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await apiFetch<{ user: { email: string } | null }>(`/api/auth/me`)
        setEmail(data.user?.email ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      }
    })()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar onLoginClick={() => {}} />
      <main className="flex-grow max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Intern Dashboard</h1>
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <p className="text-gray-700">Signed in as: {email ?? 'Unknown'}</p>
        )}
      </main>
      <Footer />
    </div>
  )
}

