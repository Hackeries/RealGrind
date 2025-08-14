"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Chrome } from "lucide-react"

export default function SignInForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Error signing in:", error.message)
      }
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
