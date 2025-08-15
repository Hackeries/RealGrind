import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  console.log("[v0] Middleware running for:", request.nextUrl.pathname)

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase environment variables not available in middleware")
    // Skip auth checks if env vars not available
    return response
  }

  try {
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/onboarding", "/profile", "/contests", "/leaderboard"]
    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    // Auth routes that should redirect if already signed in
    const authRoutes = ["/auth/signin"]
    const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    const isHomePage = request.nextUrl.pathname === "/"

    console.log("[v0] Route analysis:", {
      pathname: request.nextUrl.pathname,
      isHomePage,
      isProtectedRoute,
      isAuthRoute,
      hasSession: !!session,
    })

    if (isHomePage) {
      console.log("[v0] Allowing access to homepage")
      return response
    }

    if (isProtectedRoute && !session) {
      console.log("[v0] Redirecting to signin - protected route without session")
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    if (isAuthRoute && session) {
      console.log("[v0] Redirecting to dashboard - auth route with session")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  } catch (error) {
    console.log("[v0] Middleware auth check failed:", error)
    // Continue without auth checks if there's an error
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (let them handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
