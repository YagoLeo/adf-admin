'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogisticsLedger } from "@/components/logistics-ledger"
import { LanguageProvider } from "@/components/language-provider"
import { FirebaseProvider } from "@/components/firebase-provider"

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const userRole = localStorage.getItem('userRole')
    if (!userRole) {
      router.push('/login')
    }
  }, [router, mounted])

  if (!mounted) {
    return null
  }

  return (
    <LanguageProvider>
      <FirebaseProvider>
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <LogisticsLedger />
        </main>
      </FirebaseProvider>
    </LanguageProvider>
  )
}

