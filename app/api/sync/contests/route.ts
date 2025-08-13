import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { codeforcesAPI } from "@/lib/codeforces-api"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Fetch all contests from Codeforces
    const contests = await codeforcesAPI.getContests()

    let syncedCount = 0

    // Insert/update contests
    for (const contest of contests) {
      await sql`
        INSERT INTO contests (
          id, name, type, phase, duration_seconds, start_time, relative_time_seconds
        ) VALUES (
          ${contest.id.toString()},
          ${contest.name},
          ${contest.type},
          ${contest.phase},
          ${contest.durationSeconds},
          ${contest.startTimeSeconds ? new Date(contest.startTimeSeconds * 1000).toISOString() : null},
          ${contest.relativeTimeSeconds || null}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          phase = EXCLUDED.phase,
          duration_seconds = EXCLUDED.duration_seconds,
          start_time = EXCLUDED.start_time,
          relative_time_seconds = EXCLUDED.relative_time_seconds
      `

      syncedCount++
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} contests successfully`,
    })
  } catch (error) {
    console.error("Contests sync error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Contests sync failed" },
      { status: 500 },
    )
  }
}
