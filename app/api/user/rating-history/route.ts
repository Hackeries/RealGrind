import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { codeforcesAPI } from "@/lib/codeforces-api"

export const dynamic = "force-dynamic"

interface RatingData {
  date: string
  rating: number
  contestName: string
  rank: number
  delta: number
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
      // Get user rating history from Codeforces
      const ratingHistory = await codeforcesAPI.getUserRating(user.codeforces_handle)

      // Transform to expected format
      const ratingData: RatingData[] = ratingHistory.map((rating) => ({
        date: new Date(rating.ratingUpdateTimeSeconds * 1000).toISOString().split("T")[0],
        rating: rating.newRating,
        contestName: rating.contestName || `Contest ${rating.contestId}`,
        rank: rating.rank,
        delta: rating.newRating - rating.oldRating,
      }))

      return NextResponse.json(ratingData)
    } catch (error) {
      console.error("Failed to fetch Codeforces rating history:", error)
      return NextResponse.json({ error: "Unable to fetch rating history from Codeforces" }, { status: 503 })
    }
  } catch (error) {
    console.error("Rating history API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch rating history" },
      { status: 500 },
    )
  }
}
