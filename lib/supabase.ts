import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get user session
export const getUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}
