import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { codeforcesAPI } from "@/lib/codeforces-api"

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

    // Get user data with college info
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        *, 
        colleges (name)
      `)
      .eq("id", authUser.id)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let codeforcesStats, recentActivity, recommendations, collegeRank, globalRank

    if (user.codeforces_handle) {
      try {
        const [userInfo, submissions] = await Promise.all([
          codeforcesAPI.getUserInfo(user.codeforces_handle),
          codeforcesAPI.getUserSubmissions(user.codeforces_handle, 10), // Last 10 submissions
        ])

        codeforcesStats = {
          rating: userInfo.rating || user.current_rating || 0,
          maxRating: userInfo.maxRating || user.max_rating || 0,
          problemsSolved: user.problems_solved || 0,
          contestsParticipated: user.contests_participated || 0,
        }

        // Get recent activity from submissions
        recentActivity = submissions.slice(0, 5).map((submission) => ({
          problem: `${submission.problem.contestId}-${submission.problem.index}`,
          problemName: submission.problem.name,
          status: submission.verdict === "OK" ? "AC" : submission.verdict,
          time: new Date(submission.creationTimeSeconds * 1000).toLocaleString(),
          rating: submission.problem.rating,
        }))

        // Get recommendations based on user rating
        const userRating = userInfo.rating || user.current_rating || 800
        const recommendationsData = await codeforcesAPI.getRecommendations(user.codeforces_handle, userRating)

        recommendations = recommendationsData.slice(0, 3).map((problem) => ({
          problem: `${problem.contestId}-${problem.index}`,
          problemName: problem.name,
          difficulty: problem.rating,
          tags: problem.tags || [],
        }))
      } catch (error) {
        console.error("Failed to fetch Codeforces data:", error)
        // Use database values as fallback
        codeforcesStats = {
          rating: user.current_rating || 0,
          maxRating: user.max_rating || 0,
          problemsSolved: user.problems_solved || 0,
          contestsParticipated: user.contests_participated || 0,
        }
        recentActivity = []
        recommendations = []
      }
    } else {
      codeforcesStats = {
        rating: 0,
        maxRating: 0,
        problemsSolved: 0,
        contestsParticipated: 0,
      }
      recentActivity = []
      recommendations = []
    }

    // Get college and global rankings from database
    try {
      const { data: collegeRankData } = await supabase
        .from("users")
        .select("current_rating")
        .eq("college_id", user.college_id)
        .order("current_rating", { ascending: false })

      collegeRank = collegeRankData?.findIndex((u) => u.current_rating <= (user.current_rating || 0)) + 1 || null

      const { data: globalRankData } = await supabase
        .from("users")
        .select("current_rating")
        .order("current_rating", { ascending: false })

      globalRank = globalRankData?.findIndex((u) => u.current_rating <= (user.current_rating || 0)) + 1 || null
    } catch (error) {
      console.error("Failed to calculate rankings:", error)
      collegeRank = null
      globalRank = null
    }

    return NextResponse.json({
      user: user,
      codeforcesStats,
      recentActivity,
      recommendations,
      collegeRank,
      globalRank,
      hasCodeforcesHandle: !!user.codeforces_handle,
    })
  } catch (error) {
    console.error("Student dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
