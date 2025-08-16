import { NextResponse } from "next/server"
import { realtimeCF } from "@/lib/realtime-cf"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const health = await realtimeCF.getSystemHealth()
    const stats = realtimeCF.getStats()

    return NextResponse.json({
      ...health,
      stats,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Health check failed",
        timestamp: Date.now(),
      },
      { status: 500 },
    )
  }
}
