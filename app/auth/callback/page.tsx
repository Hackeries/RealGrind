"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebug = (message: string) => {
    console.log(`[v0] ${message}`)
    setDebugInfo((prev) => [...prev, message])
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const allParams = Object.fromEntries(searchParams.entries())
        addDebug(`Callback reached with URL params: ${JSON.stringify(allParams)}`)
        addDebug(`Current URL: ${window.location.href}`)

        const code = searchParams.get("code")
        const error_param = searchParams.get("error")
        const error_description = searchParams.get("error_description")
        const state = searchParams.get("state")

        addDebug(`OAuth params - code: ${!!code}, error: ${error_param}, state: ${state}`)

        if (error_param) {
          addDebug(`OAuth error: ${error_param} - ${error_description}`)
          setError(error_description || error_param)
          setTimeout(() => router.push("/auth/signin"), 3000)
          return
        }

        if (!code) {
          addDebug("No authorization code found in URL")
          setError("No authorization code received")
          setTimeout(() => router.push("/auth/signin"), 3000)
          return
        }

        addDebug("Exchanging code for session...")
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          addDebug(`Code exchange failed: ${exchangeError.message}`)
          setError(`Authentication failed: ${exchangeError.message}`)
          setTimeout(() => router.push("/auth/signin"), 3000)
          return
        }

        if (!data.session?.user) {
          addDebug("No user in session")
          setError("Failed to authenticate user")
          setTimeout(() => router.push("/auth/signin"), 3000)
          return
        }

        const user = data.session.user
        addDebug(`User authenticated: ${user.id} (${user.email})`)

        addDebug("Checking user profile in database...")
        const { data: existingUser, error: userError } = await supabase
          .from("users")
          .select("id, role, codeforces_handle, college_id")
          .eq("id", user.id)
          .single()

        if (userError && userError.code !== "PGRST116") {
          addDebug(`Database error: ${userError.message}`)
          setError("Database connection error")
          setTimeout(() => router.push("/auth/signin"), 3000)
          return
        }

        if (!existingUser) {
          addDebug("New user - creating profile record...")
          const newUser = {
            id: user.id,
            email: user.email,
            name:
              user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Unknown User",
            role: null, // Will be set in onboarding
            codeforces_handle: null,
            college_id: null,
          }

          const { error: insertError } = await supabase.from("users").insert(newUser)

          if (insertError) {
            addDebug(`User creation failed: ${insertError.message}`)
            setError("Failed to create user account")
            setTimeout(() => router.push("/auth/signin"), 3000)
            return
          }

          addDebug("New user created - redirecting to onboarding")
          router.push("/onboarding")
        } else {
          addDebug(`Existing user found - redirecting to dashboard`)
          router.push("/dashboard")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        addDebug(`Unexpected error: ${errorMessage}`)
        setError("An unexpected error occurred")
        setTimeout(() => router.push("/auth/signin"), 3000)
      }
    }

    addDebug("Auth callback component mounted")
    const currentPath = window.location.pathname
    if (currentPath === "/auth/callback") {
      const timer = setTimeout(handleAuthCallback, 100)
      return () => clearTimeout(timer)
    } else {
      addDebug("Not on callback route, redirecting to homepage")
      router.push("/")
    }
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4 text-4xl">❌</div>
          <p className="text-white mb-2 text-lg">Authentication failed</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <p className="text-gray-500 text-xs mb-4">Redirecting to sign in...</p>

          <details className="text-left text-xs text-gray-600 mt-4">
            <summary className="cursor-pointer mb-2">Debug Info</summary>
            <div className="bg-gray-900 p-2 rounded max-h-40 overflow-y-auto">
              {debugInfo.map((info, i) => (
                <div key={i} className="mb-1">
                  {info}
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-white mb-2">Completing sign in...</p>

        {debugInfo.length > 0 && (
          <details className="text-left text-xs text-gray-600 mt-4 max-w-md">
            <summary className="cursor-pointer mb-2">Debug Info</summary>
            <div className="bg-gray-900 p-2 rounded max-h-32 overflow-y-auto">
              {debugInfo.map((info, i) => (
                <div key={i} className="mb-1">
                  {info}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
