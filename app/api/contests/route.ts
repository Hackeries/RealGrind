import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get contests from database (should be synced from Codeforces)
    const contests = await sql`
      SELECT 
        id, name, type, phase, duration_seconds, start_time, relative_time_seconds
      FROM contests
      WHERE phase IN ('BEFORE', 'CODING')
      ORDER BY 
        CASE 
          WHEN start_time IS NULL THEN 1
          ELSE 0
        END,
        start_time ASC
      LIMIT 50
    `

    return NextResponse.json({ contests })
  } catch (error) {
    console.error("Contests fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch contests" },
      { status: 500 },
    )
  }
}
