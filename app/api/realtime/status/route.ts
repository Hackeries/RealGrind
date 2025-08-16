import { NextResponse } from "next/server"
import { realtimeCF } from "@/lib/realtime-cf"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const stats = realtimeCF.getStats()

    return NextResponse.json({
      success: true,
      status: "operational",
      stats,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Status check failed" }, { status: 500 })
  }
}
