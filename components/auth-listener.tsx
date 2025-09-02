"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthListener() {
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event, session?.user?.email)

      if (event === "SIGNED_IN" && session?.user) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id, role, codeforces_handle, college_id")
          .eq("id", session.user.id)
          .single()

        if (!existingUser) {
          console.log("[v0] New user, redirecting to onboarding")
          router.push("/onboarding")
        } else {
          console.log("[v0] Existing user, redirecting based on role")
          if (existingUser.role === "admin") {
            router.push("/dashboard/admin")
          } else {
            router.push("/dashboard")
          }
        }
      }

      if (event === "SIGNED_OUT") {
        console.log("[v0] User signed out, redirecting to landing page")
        router.push("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
