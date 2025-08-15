import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = async () => {
  if (!auth) {
    return { user: null, error: "Firebase auth not initialized" }
  }

  try {
    const result = await signInWithPopup(auth, googleProvider)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) {
    return { user: null, error: "Firebase auth not initialized" }
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signUpWithEmail = async (email: string, password: string) => {
  if (!auth) {
    return { user: null, error: "Firebase auth not initialized" }
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const signOut = async () => {
  if (!auth) {
    return { error: "Firebase auth not initialized" }
  }

  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn("[v0] Firebase auth not initialized, skipping auth state listener")
    // Return a no-op unsubscribe function
    return () => {}
  }

  try {
    return onAuthStateChanged(auth, callback)
  } catch (error) {
    console.error("[v0] Error setting up auth state listener:", error)
    // Return a no-op unsubscribe function
    return () => {}
  }
}

export { auth }
