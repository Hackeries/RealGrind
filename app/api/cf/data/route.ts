export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const handle = searchParams.get("handle")
    const type = searchParams.get("type")

    if (!handle) {
      return NextResponse.json({ error: "Handle required" }, { status: 400 })
    }

    // Mock data for now
    const mockData = {
      user: {
        handle,
        rating: 1547,
        maxRating: 1623,
        firstName: "User",
        lastName: "Name",
      },
      stats: {
        problemsSolved: 247,
        contestsParticipated: 23,
      },
      submissions: [],
      recommendations: [],
    }

    switch (type) {
      case "user":
        return NextResponse.json(mockData.user)

      case "stats":
        return NextResponse.json(mockData.stats)

      case "submissions":
        return NextResponse.json(mockData.submissions)

      case "recommendations":
        return NextResponse.json(mockData.recommendations)

      default:
        return NextResponse.json(mockData)
    }
  } catch (error) {
    console.error("CF data fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
