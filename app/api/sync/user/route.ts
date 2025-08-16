import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { codeforcesAPI } from "@/lib/codeforces-api"

export const dynamic = "force-dynamic"

async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }

      const delay = Math.pow(2, attempt) * 1000
      console.log(`[v0] Retry attempt ${attempt + 1} after ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error("Max retries exceeded")
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerComponentClient({ cookies })
    const { codeforcesHandle } = await request.json()

    if (!codeforcesHandle || typeof codeforcesHandle !== "string" || codeforcesHandle.trim().length === 0) {
      return NextResponse.json({ error: "Valid Codeforces handle is required" }, { status: 400 })
    }

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (userError || !user) {
      console.error("User lookup error:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let cfUser, submissions, ratings

    try {
      // Verify the handle exists and get user info with retry
      cfUser = await withRetry(() => codeforcesAPI.getUserInfo(codeforcesHandle.trim()))
    } catch (error) {
      console.error("Failed to get Codeforces user info:", error)
      return NextResponse.json(
        {
          error: "Invalid Codeforces handle or Codeforces API is unavailable",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 },
      )
    }

    try {
      // Sync user submissions with retry
      submissions = await withRetry(() => codeforcesAPI.getUserSubmissions(codeforcesHandle.trim()))
    } catch (error) {
      console.error("Failed to get submissions:", error)
      submissions = [] // Continue with empty submissions if this fails
    }

    try {
      // Sync contest participation with retry
      ratings = await withRetry(() => codeforcesAPI.getUserRating(codeforcesHandle.trim()))
    } catch (error) {
      console.error("Failed to get ratings:", error)
      ratings = [] // Continue with empty ratings if this fails
    }

    const updates = []

    // Update user with Codeforces data
    const userUpdate = supabase
      .from("users")
      .update({
        codeforces_handle: codeforcesHandle.trim(),
        current_rating: cfUser.rating || 0,
        max_rating: cfUser.maxRating || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    updates.push(userUpdate)

    // Count solved problems (AC submissions)
    const solvedProblems = new Set()

    if (submissions && Array.isArray(submissions)) {
      for (const submission of submissions) {
        if (submission.verdict === "OK" && submission.problem) {
          solvedProblems.add(`${submission.problem.contestId || "problemset"}-${submission.problem.index}`)
        }
      }

      // Update user's problems solved count
      const solvedUpdate = supabase
        .from("users")
        .update({
          problems_solved: solvedProblems.size,
        })
        .eq("id", user.id)

      updates.push(solvedUpdate)
    }

    // Update contests participated count
    if (ratings && Array.isArray(ratings)) {
      const contestUpdate = supabase
        .from("users")
        .update({
          contests_participated: ratings.length,
        })
        .eq("id", user.id)

      updates.push(contestUpdate)
    }

    // Execute all updates
    const results = await Promise.allSettled(updates)
    const failures = results.filter((result) => result.status === "rejected")

    if (failures.length > 0) {
      console.error("Some database updates failed:", failures)
      // Continue anyway - partial sync is better than no sync
    }

    return NextResponse.json({
      success: true,
      data: {
        handle: codeforcesHandle.trim(),
        rating: cfUser.rating || 0,
        maxRating: cfUser.maxRating || 0,
        problemsSolved: solvedProblems.size,
        contestsParticipated: ratings?.length || 0,
      },
      warnings: failures.length > 0 ? "Some data may not have been fully synced" : undefined,
    })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sync failed",
        details: "Please try again later or contact support if the issue persists",
      },
      { status: 500 },
    )
  }
}
