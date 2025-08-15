import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
    // Let the callback page handle the redirect logic
    return NextResponse.redirect(new URL("/auth/callback", request.url))
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const protectedRoutes = ["/dashboard", "/onboarding", "/profile", "/contests", "/leaderboard"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  const authRoutes = ["/auth/signin"]
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  const isHomePage = request.nextUrl.pathname === "/"

  if (isHomePage) {
    return res
  }

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return res
}
