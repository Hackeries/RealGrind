import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

function validateConfig() {
  const required = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  for (const key of required) {
    if (!process.env[key]) {
      console.error(`[v0] Missing Firebase config: ${key}`)
      return false
    }
  }
  return true
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

function initializeFirebaseWithRetry() {
  if (typeof window === "undefined") return

  let retryCount = 0
  const maxRetries = 3

  const tryInitialize = () => {
    try {
      if (!validateConfig()) {
        throw new Error("Invalid Firebase configuration")
      }

      console.log(`[v0] Initializing Firebase... (attempt ${retryCount + 1})`)

      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig)
        console.log("[v0] Firebase app initialized")
      } else {
        app = getApps()[0]
        console.log("[v0] Using existing Firebase app")
      }

      // Initialize services with error handling
      try {
        auth = getAuth(app)
        console.log("[v0] Firebase auth initialized")
      } catch (authError) {
        console.error("[v0] Firebase auth initialization failed:", authError)
        // Continue with other services even if auth fails
      }

      try {
        db = getFirestore(app)
        console.log("[v0] Firebase firestore initialized")
      } catch (dbError) {
        console.error("[v0] Firebase firestore initialization failed:", dbError)
      }

      try {
        storage = getStorage(app)
        console.log("[v0] Firebase storage initialized")
      } catch (storageError) {
        console.error("[v0] Firebase storage initialization failed:", storageError)
      }

      console.log("[v0] Firebase initialization completed")
    } catch (error) {
      console.error(`[v0] Firebase initialization error (attempt ${retryCount + 1}):`, error)

      if (retryCount < maxRetries - 1) {
        retryCount++
        console.log(`[v0] Retrying Firebase initialization in 1 second...`)
        setTimeout(tryInitialize, 1000)
      } else {
        console.error("[v0] Firebase initialization failed after all retries")
      }
    }
  }

  // Start initialization with a small delay to ensure DOM is ready
  setTimeout(tryInitialize, 100)
}

// Initialize Firebase when the module loads
if (typeof window !== "undefined") {
  initializeFirebaseWithRetry()
}

export const getFirebaseAuth = () => {
  if (!auth) {
    console.warn("[v0] Firebase auth not initialized")
    return null
  }
  return auth
}

export const getFirebaseDb = () => {
  if (!db) {
    console.warn("[v0] Firebase db not initialized")
    return null
  }
  return db
}

export const getFirebaseStorage = () => {
  if (!storage) {
    console.warn("[v0] Firebase storage not initialized")
    return null
  }
  return storage
}

export { auth, db, storage }
export default app
