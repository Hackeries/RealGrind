import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { codeforcesAPI } from "@/lib/codeforces-api"

export const dynamic = "force-dynamic"

interface HeatmapData {
  date: string
  count: number
  level: number
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser || authUser.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's Codeforces handle
    const { data: user } = await supabase.from("users").select("codeforces_handle").eq("id", userId).single()

    if (!user?.codeforces_handle) {
      return NextResponse.json({ error: "Codeforces handle not found" }, { status: 404 })
    }

    try {
      // Get user submissions from Codeforces
      const submissions = await codeforcesAPI.getUserSubmissions(user.codeforces_handle)

      // Group submissions by date and count AC submissions
      const submissionsByDate: Record<string, number> = {}

      submissions.forEach((submission) => {
        if (submission.verdict === "OK") {
          const date = new Date(submission.creationTimeSeconds * 1000).toISOString().split("T")[0]
          submissionsByDate[date] = (submissionsByDate[date] || 0) + 1
        }
      })

      // Generate heatmap data for the past year
      const heatmapData: HeatmapData[] = []
      const today = new Date()

      for (let i = 364; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        const count = submissionsByDate[dateStr] || 0
        const level = count === 0 ? 0 : Math.min(Math.floor(count / 2) + 1, 4)

        heatmapData.push({
          date: dateStr,
          count,
          level,
        })
      }

      return NextResponse.json(heatmapData)
    } catch (error) {
      console.error("Failed to fetch Codeforces submissions:", error)
      return NextResponse.json({ error: "Unable to fetch submission data from Codeforces" }, { status: 503 })
    }
  } catch (error) {
    console.error("Heatmap API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch heatmap data" },
      { status: 500 },
    )
  }
}
