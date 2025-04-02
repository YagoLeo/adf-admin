import { LogisticsLedger } from "@/components/logistics-ledger"
import { LanguageProvider } from "@/components/language-provider"
import { FirebaseProvider } from "@/components/firebase-provider"

export default function Home() {
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

