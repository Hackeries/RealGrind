import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const CACHE_DURATION = 300 // 5 minutes cache to reduce API calls
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // Start with 1 second

let cachedStats: any = null
let lastFetch = 0

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (response.ok) {
        return response
      }

      // Don't retry on client errors (4xx), only server errors (5xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error ${response.status}: ${response.statusText}`)
      }

      if (attempt === retries) {
        throw new Error(`Server error ${response.status}: ${response.statusText}`)
      }

      console.log(`[v0] Attempt ${attempt + 1} failed with ${response.status}, retrying...`)
    } catch (error) {
      if (attempt === retries) {
        throw error
      }

      const delay = RETRY_DELAY * Math.pow(2, attempt)
      console.log(`[v0] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("Max retries exceeded")
}

async function fetchCodeforcesData() {
  const [contestsResponse, problemsResponse] = await Promise.all([
    fetchWithRetry("https://codeforces.com/api/contest.list?gym=false", {
      headers: {
        "User-Agent": "RealGrind-Platform/1.0",
        Accept: "application/json",
      },
    }),
    fetchWithRetry("https://codeforces.com/api/problemset.problems", {
      headers: {
        "User-Agent": "RealGrind-Platform/1.0",
        Accept: "application/json",
      },
    }),
  ])

  const [contestsData, problemsData] = await Promise.all([contestsResponse.json(), problemsResponse.json()])

  const activeContests =
    contestsData.result?.filter((contest: any) => contest.phase === "BEFORE" || contest.phase === "CODING").length || 0

  const totalProblems = problemsData.result?.problems?.length || 0

  return { totalProblems, activeContests }
}

export async function GET() {
  try {
    // Check cache first to avoid rate limiting
    const now = Date.now()
    if (cachedStats && now - lastFetch < CACHE_DURATION * 1000) {
      return NextResponse.json({ ...cachedStats, cached: true })
    }

    console.log("[v0] Starting real data fetch from database and Codeforces API")

    const [{ data: totalUsersData }, { data: todaySubmissionsData }, { data: topUserData }, codeforcesData] =
      await Promise.allSettled([
        // Get total registered users count
        supabase
          .from("users")
          .select("id", { count: "exact", head: true }),

        // Get submissions from today by registered users
        supabase
          .from("submissions")
          .select("id", { count: "exact", head: true })
          .gte("submitted_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
          .eq("status", "ACCEPTED"),

        // Get user with highest current rating
        supabase
          .from("users")
          .select("codeforces_handle")
          .not("codeforces_handle", "is", null)
          .limit(100), // Get top 100 to check their current ratings

        // Fetch Codeforces API data
        fetchCodeforcesData(),
      ])

    // Process database results
    const totalUsers = totalUsersData?.count || 0
    const problemsSolvedToday = todaySubmissionsData?.count || 0

    // Get current ratings for top users
    let topUserRating = 0
    let topUserHandle = "N/A"

    if (topUserData && topUserData.length > 0) {
      const userHandles = topUserData.map((u) => u.codeforces_handle).filter(Boolean)

      if (userHandles.length > 0) {
        try {
          const ratingsResponse = await fetchWithRetry(
            `https://codeforces.com/api/user.info?handles=${userHandles.join(";")}`,
            {
              headers: {
                "User-Agent": "RealGrind-Platform/1.0",
                Accept: "application/json",
              },
            },
          )

          const ratingsData = await ratingsResponse.json()
          if (ratingsData.status === "OK") {
            const topUser = ratingsData.result.reduce((max: any, user: any) =>
              (user.rating || 0) > (max.rating || 0) ? user : max,
            )
            topUserRating = topUser.rating || 0
            topUserHandle = topUser.handle || "N/A"
          }
        } catch (error) {
          console.log("[v0] Failed to fetch user ratings, using database count")
        }
      }
    }

    // Process Codeforces API results
    let totalProblems = 8500 // fallback
    let activeContests = 0 // fallback

    if (codeforcesData.status === "fulfilled") {
      totalProblems = codeforcesData.value.totalProblems
      activeContests = codeforcesData.value.activeContests
    }

    const stats = {
      totalProblems,
      problemsSolvedToday,
      activeContests,
      topUserRating,
      topUserHandle,
      totalUsers,
      realData: true,
    }

    // Cache the results
    cachedStats = stats
    lastFetch = now

    console.log("[v0] Successfully fetched real stats:", stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Database/API error:", error)

    if (cachedStats) {
      console.log("[v0] Returning stale cached data due to error")
      return NextResponse.json({
        ...cachedStats,
        cached: true,
        stale: true,
        error: "Using cached data due to temporary unavailability",
      })
    }

    return NextResponse.json(
      {
        error: "Unable to fetch live statistics. Please try again later.",
        totalProblems: 0,
        problemsSolvedToday: 0,
        activeContests: 0,
        topUserRating: 0,
        topUserHandle: "N/A",
      },
      { status: 503 },
    )
  }
}
