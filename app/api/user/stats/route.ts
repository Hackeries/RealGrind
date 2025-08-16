import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { codeforcesAPI } from "@/lib/codeforces-api"

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
      console.log(`[v0] User stats retry attempt ${attempt + 1} after ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error("Max retries exceeded")
}

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies })

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user basic stats from database
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        codeforces_handle,
        current_rating,
        max_rating,
        problems_solved,
        contests_participated,
        college_id,
        graduation_year,
        colleges (name)
      `)
      .eq("id", authUser.id)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let difficultyStats, tagStats, recentSubmissions, ratingHistory

    if (user.codeforces_handle) {
      try {
        const [submissions, ratings] = await Promise.all([
          withRetry(() => codeforcesAPI.getUserSubmissions(user.codeforces_handle)),
          withRetry(() => codeforcesAPI.getUserRating(user.codeforces_handle)),
        ])

        // Calculate difficulty stats from real submissions
        const difficultyCount: Record<string, number> = {}
        const tagCount: Record<string, number> = {}

        submissions.forEach((submission) => {
          if (submission.verdict === "OK" && submission.problem) {
            const rating = submission.problem.rating || 800
            const difficulty = getDifficultyLevel(rating)
            difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1

            submission.problem.tags?.forEach((tag) => {
              tagCount[tag] = (tagCount[tag] || 0) + 1
            })
          }
        })

        difficultyStats = Object.entries(difficultyCount).map(([difficulty, count]) => ({
          difficulty,
          solved_count: count,
        }))

        tagStats = Object.entries(tagCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([tag, count]) => ({
            tag,
            solved_count: count,
          }))

        // Get recent submissions (last 10 AC submissions)
        recentSubmissions = submissions
          .filter((s) => s.verdict === "OK")
          .slice(-10)
          .reverse()
          .map((submission) => ({
            problem_id: `${submission.problem.contestId}-${submission.problem.index}`,
            problem_name: submission.problem.name,
            rating: submission.problem.rating,
            verdict: submission.verdict,
            programming_language: submission.programmingLanguage,
            submitted_at: new Date(submission.creationTimeSeconds * 1000).toISOString(),
          }))

        // Transform rating history
        ratingHistory = ratings.slice(-20).map((rating) => ({
          contest_id: rating.contestId?.toString(),
          old_rating: rating.oldRating,
          new_rating: rating.newRating,
          rank: rating.rank,
          participated_at: new Date(rating.ratingUpdateTimeSeconds * 1000).toISOString(),
        }))
      } catch (error) {
        console.error("Failed to fetch Codeforces data:", error)
        // Return basic stats without detailed Codeforces data
        difficultyStats = []
        tagStats = []
        recentSubmissions = []
        ratingHistory = []
      }
    } else {
      // User hasn't verified Codeforces handle
      difficultyStats = []
      tagStats = []
      recentSubmissions = []
      ratingHistory = []
    }

    return NextResponse.json({
      user: {
        codeforcesHandle: user.codeforces_handle,
        currentRating: user.current_rating,
        maxRating: user.max_rating,
        problemsSolved: user.problems_solved,
        contestsParticipated: user.contests_participated,
        college: user.colleges?.name,
        graduationYear: user.graduation_year,
      },
      difficultyStats,
      tagStats,
      recentSubmissions,
      ratingHistory,
      hasCodeforcesHandle: !!user.codeforces_handle,
    })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 },
    )
  }
}

function getDifficultyLevel(rating: number): string {
  if (rating < 1000) return "Beginner"
  if (rating < 1300) return "Pupil"
  if (rating < 1600) return "Specialist"
  if (rating < 1900) return "Expert"
  if (rating < 2100) return "Candidate Master"
  if (rating < 2300) return "Master"
  if (rating < 2400) return "International Master"
  return "Grandmaster"
}
