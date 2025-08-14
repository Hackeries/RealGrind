import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { codeforcesAPI } from "@/lib/codeforces-api"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerComponentClient({ cookies })
    const { codeforcesHandle } = await request.json()

    if (!codeforcesHandle) {
      return NextResponse.json({ error: "Codeforces handle is required" }, { status: 400 })
    }

    // Get user ID
    const { data: user } = await supabase.from("users").select("id").eq("email", session.user.email).single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify the handle exists and get user info
    const cfUser = await codeforcesAPI.getUserInfo(codeforcesHandle)

    // Update user with Codeforces data
    const { error: updateError } = await supabase
      .from("users")
      .update({
        codeforces_handle: codeforcesHandle,
        current_rating: cfUser.rating || 0,
        max_rating: cfUser.maxRating || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) throw updateError

    // Sync user submissions
    const submissions = await codeforcesAPI.getUserSubmissions(codeforcesHandle)

    // Count solved problems (AC submissions)
    const solvedProblems = new Set()

    for (const submission of submissions) {
      // Track solved problems
      if (submission.verdict === "OK") {
        solvedProblems.add(`${submission.problem.contestId || "problemset"}-${submission.problem.index}`)
      }
    }

    // Update user's problems solved count
    const { error: solvedError } = await supabase
      .from("users")
      .update({
        problems_solved: solvedProblems.size,
      })
      .eq("id", user.id)

    if (solvedError) throw solvedError

    // Sync contest participation
    const ratings = await codeforcesAPI.getUserRating(codeforcesHandle)

    // Update contests participated count
    const { error: contestError } = await supabase
      .from("users")
      .update({
        contests_participated: ratings.length,
      })
      .eq("id", user.id)

    if (contestError) throw contestError

    return NextResponse.json({
      success: true,
      data: {
        handle: codeforcesHandle,
        rating: cfUser.rating || 0,
        maxRating: cfUser.maxRating || 0,
        problemsSolved: solvedProblems.size,
        contestsParticipated: ratings.length,
      },
    })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sync failed" }, { status: 500 })
  }
}
