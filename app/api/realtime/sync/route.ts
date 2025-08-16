import { type NextRequest, NextResponse } from "next/server"
import { realtimeCF } from "@/lib/realtime-cf"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { userId, handle, type = "user" } = await request.json()

    if (!userId || !handle) {
      return NextResponse.json({ error: "userId and handle are required" }, { status: 400 })
    }

    // Trigger immediate sync
    await realtimeCF.scheduleSync({
      id: `manual-${userId}-${Date.now()}`,
      type: type as "user" | "contest" | "problem" | "leaderboard",
      userId,
      handle,
      priority: "high",
      scheduledAt: Date.now(),
      retryCount: 0,
    })

    return NextResponse.json({
      success: true,
      message: "Sync triggered successfully",
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Manual sync error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to trigger sync" },
      { status: 500 },
    )
  }
}
