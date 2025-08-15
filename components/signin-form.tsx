"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "@/lib/firebase/auth"
import { useRouter } from "next/navigation"
import { Chrome } from "lucide-react"
import { useAuth } from "@/components/providers"
import { syncFirebaseUser } from "@/lib/auth"

export default function SignInForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  React.useEffect(() => {
    if (user) {
      syncFirebaseUser(user)
        .then(() => {
          router.push("/onboarding")
        })
        .catch((error) => {
          console.error("Failed to sync user:", error)
        })
    }
  }, [user, router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const { user, error } = await signInWithGoogle()

      if (error) {
        console.error("Error signing in:", error)
      }
      // User state will be handled by the useEffect above
    } catch (error) {
      console.error("Unexpected error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to RealGrind</h1>
        <p className="text-gray-400 text-lg">Sign in to start your competitive programming journey</p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-6 text-lg rounded-lg h-[60px] flex items-center justify-center gap-3"
        >
          <Chrome className="h-6 w-6" />
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>
      </div>
    </div>
  )
}
