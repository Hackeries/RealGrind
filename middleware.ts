import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
    return response
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: {
          getItem: (key: string) => {
            return request.cookies.get(key)?.value
          },
          setItem: (key: string, value: string) => {
            response.cookies.set(key, value)
          },
          removeItem: (key: string) => {
            response.cookies.delete(key)
          },
        },
      },
    })

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    const protectedRoutes = ["/dashboard", "/onboarding", "/profile", "/contests", "/leaderboard"]
    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
    const authRoutes = ["/auth/signin"]
    const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
    const isHomePage = request.nextUrl.pathname === "/"

    console.log("[v0] Route analysis:", {
      pathname: request.nextUrl.pathname,
      isHomePage,
      isProtectedRoute,
      isAuthRoute,
      hasUser: !!user,
    })

    // Allow homepage access
    if (isHomePage) {
      console.log("[v0] Allowing access to homepage")
      return response
    }

    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !user) {
      console.log("[v0] Redirecting to signin - protected route without user")
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    if (user && isProtectedRoute) {
      const { data: profile } = await supabase
        .from("users")
        .select("role, codeforces_handle, college_id")
        .eq("id", user.id)
        .single()

      // Redirect to onboarding if profile incomplete (except if already on onboarding)
      if (!request.nextUrl.pathname.startsWith("/onboarding")) {
        if (!profile || !profile.role || !profile.codeforces_handle || !profile.college_id) {
          console.log("[v0] Redirecting to onboarding - incomplete profile")
          return NextResponse.redirect(new URL("/onboarding", request.url))
        }
      }

      // Redirect from dashboard to role-specific dashboard
      if (request.nextUrl.pathname === "/dashboard" && profile?.role) {
        const dashboardPath =
          profile.role === "admin"
            ? "/dashboard/admin"
            : profile.role === "organizer"
              ? "/dashboard/organizer"
              : "/dashboard/student"
        console.log(`[v0] Redirecting to role-specific dashboard: ${dashboardPath}`)
        return NextResponse.redirect(new URL(dashboardPath, request.url))
      }
    }

    // Redirect authenticated users from auth routes
    if (isAuthRoute && user) {
      console.log("[v0] Redirecting to dashboard - auth route with user")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  } catch (error) {
    console.log("[v0] Middleware auth check failed:", error)
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
