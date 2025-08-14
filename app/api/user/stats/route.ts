import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerComponentClient({ cookies })

    // Get user basic stats
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
      .eq("email", session.user.email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Mock data for other stats since we don't have the full database structure yet
    const difficultyStats = [
      { difficulty: "Beginner", solved_count: 45 },
      { difficulty: "Pupil", solved_count: 32 },
      { difficulty: "Specialist", solved_count: 18 },
      { difficulty: "Expert", solved_count: 8 },
    ]

    const tagStats = [
      { tag: "implementation", solved_count: 28 },
      { tag: "math", solved_count: 22 },
      { tag: "greedy", solved_count: 18 },
      { tag: "strings", solved_count: 15 },
    ]

    const recentSubmissions = [
      {
        problem_id: "1742A",
        problem_name: "Sum",
        rating: 800,
        verdict: "OK",
        programming_language: "C++17",
        submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ]

    const ratingHistory = [
      {
        contest_id: "1742",
        old_rating: 1200,
        new_rating: 1247,
        rank: 1234,
        participated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

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
    })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 },
    )
  }
}
