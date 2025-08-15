import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export function createServerClient() {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set")
    return null
  }

  const cookieStore = cookies()

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          return cookieStore.get(key)?.value
        },
        setItem: (key: string, value: string) => {
          cookieStore.set(key, value)
        },
        removeItem: (key: string) => {
          cookieStore.delete(key)
        },
      },
    },
  })
}

export async function getAuthenticatedUser() {
  const supabase = createServerClient()
  if (!supabase) return { user: null, profile: null }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) return { user: null, profile: null }

  // Get user profile from database
  const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

  return { user, profile: profileError ? null : profile }
}
