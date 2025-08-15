"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error during auth callback:", error)
          setError(error.message)
          setTimeout(() => router.push("/auth/signin"), 3000)
          return
        }

        if (data.session?.user) {
          const { data: existingUser, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("id", data.session.user.id)
            .single()

          if (userError && userError.code !== "PGRST116") {
            console.error("Error checking user:", userError)
          }

          if (!existingUser) {
            const { error: insertError } = await supabase.from("users").insert({
              id: data.session.user.id,
              email: data.session.user.email,
              name: data.session.user.user_metadata?.full_name || data.session.user.email?.split("@")[0],
              avatar_url: data.session.user.user_metadata?.avatar_url,
              role: "student",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

            if (insertError) {
              console.error("Error creating user:", insertError)
            }

            router.push("/onboarding")
          } else {
            router.push("/dashboard")
          }
        } else {
          setError("No session found")
          setTimeout(() => router.push("/auth/signin"), 3000)
        }
      } catch (err) {
        console.error("Unexpected error in auth callback:", err)
        setError("An unexpected error occurred")
        setTimeout(() => router.push("/auth/signin"), 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <div className="text-red-500 mb-4">❌</div>
          <p className="text-white mb-2">Authentication failed</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-2">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-white">Completing sign in...</p>
      </div>
    </div>
  )
}
