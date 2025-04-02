import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// 检查环境变量是否存在
const checkFirebaseConfig = () => {
  const requiredEnvVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  const missingEnvVars = requiredEnvVars.filter((varName) => {
    const value = process.env[varName]
    return !value || value.length === 0
  })

  if (missingEnvVars.length > 0) {
    console.error(`Missing Firebase environment variables: ${missingEnvVars.join(", ")}`)
    return false
  }
  return true
}

// 创建一个延迟初始化的函数
let firebaseApp
let firestoreDb

export function getFirebaseApp() {
  if (firebaseApp) return firebaseApp

  // if (!checkFirebaseConfig()) {
  //   console.error("Firebase configuration is incomplete")
  //   return null
  // }

  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    firebaseApp = initializeApp(firebaseConfig)
    return firebaseApp
  } catch (error) {
    console.error("Firebase initialization error:", error)
    return null
  }
}

export function getFirestoreDb() {
  if (firestoreDb) return firestoreDb

  const app = getFirebaseApp()
  if (!app) return null

  try {
    firestoreDb = getFirestore(app)
    return firestoreDb
  } catch (error) {
    console.error("Firestore initialization error:", error)
    return null
  }
}

