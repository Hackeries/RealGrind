import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let firebaseApp: any = null
let firebaseAuth: any = null

// Only initialize on client side
if (typeof window !== "undefined") {
  try {
    // Initialize Firebase app
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

    // Initialize auth - use a timeout to ensure Firebase is ready
    setTimeout(() => {
      try {
        firebaseAuth = getAuth(firebaseApp)
        console.log("[v0] Firebase auth initialized successfully")
      } catch (authError) {
        console.log("[v0] Auth initialization delayed, will retry on first use")
      }
    }, 100)
  } catch (error) {
    console.error("[v0] Firebase initialization failed:", error)
  }
}

export const getFirebaseAuth = () => {
  if (typeof window === "undefined") return null

  if (!firebaseAuth && firebaseApp) {
    try {
      firebaseAuth = getAuth(firebaseApp)
    } catch (error) {
      console.error("[v0] Failed to get auth:", error)
      return null
    }
  }

  return firebaseAuth
}

export const getGoogleProvider = () => {
  if (typeof window === "undefined") return null

  const provider = new GoogleAuthProvider()
  provider.addScope("email")
  provider.addScope("profile")
  return provider
}

export { firebaseApp as app, firebaseAuth as auth }
export default firebaseApp
