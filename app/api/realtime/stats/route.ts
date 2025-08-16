import { NextResponse } from "next/server"
import { getLiveStats } from "@/lib/realtime-cf"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const stats = await getLiveStats()

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Real-time stats error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 },
    )
  }
}
