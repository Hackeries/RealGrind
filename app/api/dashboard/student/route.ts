import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerComponentClient({ cookies })

    // Get user data with college info
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        *, 
        colleges (name)
      `)
      .eq("email", session.user.email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Mock data for demo - in production, fetch from Codeforces API
    const mockStats = {
      user: user,
      codeforcesStats: {
        rating: 1547,
        maxRating: 1623,
        problemsSolved: 247,
        contestsParticipated: 23,
      },
      recentActivity: [
        { problem: "1742A", status: "AC", time: "2 hours ago" },
        { problem: "1741B", status: "AC", time: "1 day ago" },
        { problem: "1740C", status: "WA", time: "2 days ago" },
      ],
      recommendations: [
        { problem: "1743A", difficulty: 800, tags: ["math", "implementation"] },
        { problem: "1744B", difficulty: 900, tags: ["greedy", "strings"] },
      ],
      collegeRank: 12,
      globalRank: 1247,
    }

    return NextResponse.json(mockStats)
  } catch (error) {
    console.error("Student dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
