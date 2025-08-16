import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { codeforcesAPI } from "@/lib/codeforces-api"
import { CacheManager } from "@/lib/redis"

export const dynamic = "force-dynamic"

async function withRetry<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }

      const delay = Math.pow(2, attempt) * 1000
      console.log(`[v0] Recommendations retry attempt ${attempt + 1} after ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error("Max retries exceeded")
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    if (!user.codeforcesHandle) {
      return NextResponse.json({ error: "Codeforces handle not verified" }, { status: 400 })
    }

    // Check cache first
    const cacheKey = CacheManager.getRecommendationKey(user.id)
    let cached

    try {
      cached = await CacheManager.get<any[]>(cacheKey)
      if (cached) {
        return NextResponse.json({
          recommendations: cached,
          count: cached.length,
          personalized: true,
          cached: true,
          message: "Recommendations loaded from cache",
        })
      }
    } catch (cacheError) {
      console.error("Cache read error:", cacheError)
      // Continue without cache
    }

    let userStats, solvedProblems, problemsData

    try {
      // Get user's current rating with retry
      userStats = await withRetry(() => codeforcesAPI.getUserStats(user.codeforcesHandle))
    } catch (error) {
      console.error("Failed to get user stats:", error)
      // Use fallback rating based on user's stored rating
      userStats = {
        currentRating: user.current_rating || 800,
        tagDistribution: {},
      }
    }

    const userRating = userStats.currentRating || user.current_rating || 800

    // Define rating range
    const ratingMin = Math.max(800, userRating - 100)
    const ratingMax = userRating + 200

    // Get user's solved problems with caching and retry
    const solvedKey = CacheManager.getUserSolvedKey(user.codeforcesHandle)
    solvedProblems = new Set<string>()

    try {
      const cachedSolved = await CacheManager.get<string[]>(solvedKey)
      if (cachedSolved) {
        solvedProblems = new Set(cachedSolved)
      } else {
        const submissions = await withRetry(() => codeforcesAPI.getUserSubmissions(user.codeforcesHandle))
        const solved = submissions
          .filter((s) => s.verdict === "OK" && s.problem)
          .map((s) => `${s.problem.contestId}-${s.problem.index}`)

        solvedProblems = new Set(solved)

        try {
          await CacheManager.set(solvedKey, Array.from(solvedProblems), { ttl: 3600 })
        } catch (cacheError) {
          console.error("Cache write error:", cacheError)
        }
      }
    } catch (error) {
      console.error("Failed to get solved problems:", error)
      // Continue with empty set - will show all problems as recommendations
    }

    try {
      // Get problems from Codeforces with retry
      problemsData = await withRetry(() => codeforcesAPI.getProblems())
    } catch (error) {
      console.error("Failed to get problems:", error)
      return NextResponse.json(
        {
          error: "Unable to fetch problems from Codeforces",
          details: "Please try again later",
          fallback: true,
        },
        { status: 503 },
      )
    }

    if (!problemsData?.problems || !Array.isArray(problemsData.problems)) {
      return NextResponse.json(
        {
          error: "Invalid problems data received",
          details: "Please try again later",
        },
        { status: 503 },
      )
    }

    const candidates = problemsData.problems.filter((problem) => {
      const problemKey = `${problem.contestId}-${problem.index}`
      return (
        problem.rating && problem.rating >= ratingMin && problem.rating <= ratingMax && !solvedProblems.has(problemKey)
      )
    })

    // Apply tag diversity and scoring
    const recommendations = []
    const tagCount: Record<string, number> = {}
    const userTags = Object.keys(userStats.tagDistribution || {})

    // Sort by rating for balanced difficulty progression
    candidates.sort((a, b) => (a.rating || 0) - (b.rating || 0))

    for (const problem of candidates) {
      if (recommendations.length >= 10) break

      // Check tag diversity (max 2 per tag)
      const canAdd = problem.tags?.every((tag) => (tagCount[tag] || 0) < 2) ?? true

      if (canAdd) {
        let reason = "Perfect for your current skill level"
        let difficulty: "easy" | "medium" | "hard" = "medium"

        const ratingDiff = (problem.rating || 0) - userRating
        if (ratingDiff < -50) {
          difficulty = "easy"
          reason = "Good for building confidence and speed"
        } else if (ratingDiff > 100) {
          difficulty = "hard"
          reason = "Challenge problem to push your limits"
        }

        // Check for new tags
        const hasNewTag = problem.tags?.some((tag) => !userTags.includes(tag)) ?? false
        if (hasNewTag) {
          reason += " (explores new topics)"
        }

        recommendations.push({
          problem,
          reason,
          difficulty,
          estimatedTime: Math.max(30, Math.min(120, ((problem.rating || 800) - 800) / 10)),
        })

        // Update tag counts
        problem.tags?.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      }
    }

    // Add one daily challenge (rating +250)
    const challengeRating = userRating + 250
    const challengeCandidates = problemsData.problems.filter((problem) => {
      const problemKey = `${problem.contestId}-${problem.index}`
      return problem.rating && Math.abs(problem.rating - challengeRating) <= 50 && !solvedProblems.has(problemKey)
    })

    if (challengeCandidates.length > 0) {
      const challenge = challengeCandidates[Math.floor(Math.random() * challengeCandidates.length)]
      recommendations.push({
        problem: challenge,
        reason: "Daily challenge - significantly harder than your usual range",
        difficulty: "hard" as const,
        estimatedTime: 90,
        isChallenge: true,
      })
    }

    // Cache recommendations for 24 hours
    try {
      await CacheManager.set(cacheKey, recommendations, { ttl: 24 * 60 * 60 })
    } catch (cacheError) {
      console.error("Cache write error:", cacheError)
    }

    return NextResponse.json({
      recommendations,
      count: recommendations.length,
      personalized: true,
      cached: false,
      userRating,
      ratingRange: [ratingMin, ratingMax],
      message: "Personalized recommendations generated successfully",
    })
  } catch (error) {
    console.error("Recommendations API error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate recommendations",
        details: "Please try again later or contact support if the issue persists",
      },
      { status: 500 },
    )
  }
}
