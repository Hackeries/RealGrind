import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Handle auth callback
  if (request.nextUrl.pathname === "/auth/callback") {
    const code = request.nextUrl.searchParams.get("code")
    if (code) {
      await supabase.auth.exchangeCodeForSession(code)
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }
  }

  // Protected routes logic
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth/")
  const isPublicRoute = request.nextUrl.pathname === "/"
  const isOnboarding = request.nextUrl.pathname === "/onboarding"

  if (!isAuthRoute && !isPublicRoute && !isOnboarding) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }
  }

  return supabaseResponse
}
