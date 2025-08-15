import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export function createServerClient() {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set")
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}
