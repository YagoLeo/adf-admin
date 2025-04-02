"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getFirebaseApp, getFirestoreDb } from "@/lib/firebase-client"

interface FirebaseContextType {
  isInitialized: boolean
  isError: boolean
  errorMessage: string | null
}

const FirebaseContext = createContext<FirebaseContextType>({
  isInitialized: false,
  isError: false,
  errorMessage: null,
})

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FirebaseContextType>({
    isInitialized: false,
    isError: false,
    errorMessage: null,
  })

  useEffect(() => {
    try {
      // 尝试初始化Firebase
      const app = getFirebaseApp()
      const db = getFirestoreDb()

      if (!app || !db) {
        setState({
          isInitialized: false,
          isError: true,
          errorMessage: "Firebase initialization failed. Please check your configuration.",
        })
        return
      }

      setState({
        isInitialized: true,
        isError: false,
        errorMessage: null,
      })
    } catch (error) {
      console.error("Firebase initialization error:", error)
      setState({
        isInitialized: false,
        isError: true,
        errorMessage: error instanceof Error ? error.message : "Unknown error initializing Firebase",
      })
    }
  }, [])

  return <FirebaseContext.Provider value={state}>{children}</FirebaseContext.Provider>
}

export function useFirebase() {
  return useContext(FirebaseContext)
}

