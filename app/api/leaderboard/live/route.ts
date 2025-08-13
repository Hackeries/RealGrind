import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contestId = searchParams.get("contestId")

    if (!contestId) {
      return NextResponse.json({ error: "Contest ID is required" }, { status: 400 })
    }

    // Get live contest standings
    const standings = await sql`
      SELECT 
        ccp.user_id,
        ccp.score,
        ccp.rank,
        ccp.joined_at,
        u.name,
        u.codeforces_handle,
        u.current_rating,
        u.avatar_url,
        ROW_NUMBER() OVER (ORDER BY ccp.score DESC, ccp.joined_at ASC) as live_rank
      FROM college_contest_participants ccp
      JOIN users u ON ccp.user_id = u.id
      WHERE ccp.contest_id = ${contestId}
      ORDER BY ccp.score DESC, ccp.joined_at ASC
    `

    // Get contest info
    const contest = await sql`
      SELECT 
        cc.id,
        cc.name,
        cc.college,
        cc.start_time,
        cc.end_time,
        cc.is_active,
        COUNT(ccp.user_id) as participant_count
      FROM college_contests cc
      LEFT JOIN college_contest_participants ccp ON cc.id = ccp.contest_id
      WHERE cc.id = ${contestId}
      GROUP BY cc.id
    `

    if (contest.length === 0) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 })
    }

    return NextResponse.json({
      contest: contest[0],
      standings,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Live leaderboard fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch live standings" },
      { status: 500 },
    )
  }
}
