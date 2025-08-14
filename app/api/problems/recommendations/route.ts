import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { codeforcesAPI } from "@/lib/codeforces-api"
import { CacheManager } from "@/lib/redis"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!user.codeforcesHandle) {
      return NextResponse.json({ error: "Codeforces handle not verified" }, { status: 400 })
    }

    // Check cache first
    const cacheKey = CacheManager.getRecommendationKey(user.id)
    const cached = await CacheManager.get<any[]>(cacheKey)

    if (cached) {
      return NextResponse.json({
        recommendations: cached,
        count: cached.length,
        personalized: true,
        cached: true,
        message: "Recommendations loaded from cache",
      })
    }

    // Get user's current rating
    const userStats = await codeforcesAPI.getUserStats(user.codeforcesHandle)
    const userRating = userStats.currentRating || 800

    // Define rating range
    const ratingMin = Math.max(800, userRating - 100)
    const ratingMax = userRating + 200

    // Get user's solved problems
    const solvedKey = CacheManager.getUserSolvedKey(user.codeforcesHandle)
    let solvedProblems = new Set<string>()

    const cachedSolved = await CacheManager.get<string[]>(solvedKey)
    if (cachedSolved) {
      solvedProblems = new Set(cachedSolved)
    } else {
      const submissions = await codeforcesAPI.getUserSubmissions(user.codeforcesHandle)
      const solved = submissions
        .filter((s) => s.verdict === "OK")
        .map((s) => `${s.problem.contestId}-${s.problem.index}`)

      solvedProblems = new Set(solved)
      await CacheManager.set(solvedKey, Array.from(solvedProblems), { ttl: 3600 })
    }

    // Get problems from Codeforces
    const problemsData = await codeforcesAPI.getProblems()
    const candidates = problemsData.problems.filter((problem) => {
      const problemKey = `${problem.contestId}-${problem.index}`
      return (
        !solvedProblems.has(problemKey) && problem.rating && problem.rating >= ratingMin && problem.rating <= ratingMax
      )
    })

    // Apply tag diversity and scoring
    const recommendations = []
    const tagCount: Record<string, number> = {}
    const userTags = Object.keys(userStats.tagDistribution)

    // Sort by rating for balanced difficulty progression
    candidates.sort((a, b) => (a.rating || 0) - (b.rating || 0))

    for (const problem of candidates) {
      if (recommendations.length >= 10) break

      // Check tag diversity (max 2 per tag)
      const canAdd = problem.tags.every((tag) => (tagCount[tag] || 0) < 2)

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
        const hasNewTag = problem.tags.some((tag) => !userTags.includes(tag))
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
        problem.tags.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      }
    }

    // Add one daily challenge (rating +250)
    const challengeRating = userRating + 250
    const challengeCandidates = problemsData.problems.filter((problem) => {
      const problemKey = `${problem.contestId}-${problem.index}`
      return !solvedProblems.has(problemKey) && problem.rating && Math.abs(problem.rating - challengeRating) <= 50
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
    await CacheManager.set(cacheKey, recommendations, { ttl: 24 * 60 * 60 })

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
      { error: error instanceof Error ? error.message : "Failed to generate recommendations" },
      { status: 500 },
    )
  }
}
