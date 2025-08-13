import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contestId = params.id

    // Get contest details
    const contest = await sql`
      SELECT 
        cc.id,
        cc.name,
        cc.college,
        cc.description,
        cc.start_time,
        cc.end_time,
        cc.created_by,
        cc.is_active,
        cc.created_at,
        u.name as creator_name
      FROM college_contests cc
      LEFT JOIN users u ON cc.created_by = u.id
      WHERE cc.id = ${contestId}
    `

    if (contest.length === 0) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 })
    }

    // Get participants with their scores
    const participants = await sql`
      SELECT 
        ccp.user_id,
        ccp.score,
        ccp.rank,
        ccp.joined_at,
        u.name,
        u.codeforces_handle,
        u.current_rating
      FROM college_contest_participants ccp
      JOIN users u ON ccp.user_id = u.id
      WHERE ccp.contest_id = ${contestId}
      ORDER BY ccp.rank ASC NULLS LAST, ccp.score DESC
    `

    return NextResponse.json({
      contest: contest[0],
      participants,
    })
  } catch (error) {
    console.error("Contest fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch contest" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contestId = params.id
    const { action } = await request.json()

    if (action === "join") {
      // Check if contest exists and is active
      const contest = await sql`
        SELECT id, name, start_time, end_time, is_active
        FROM college_contests
        WHERE id = ${contestId}
      `

      if (contest.length === 0) {
        return NextResponse.json({ error: "Contest not found" }, { status: 404 })
      }

      if (!contest[0].is_active) {
        return NextResponse.json({ error: "Contest is not active" }, { status: 400 })
      }

      const now = new Date()
      const endTime = new Date(contest[0].end_time)

      if (now > endTime) {
        return NextResponse.json({ error: "Contest has ended" }, { status: 400 })
      }

      // Check if user is already participating
      const existing = await sql`
        SELECT id FROM college_contest_participants
        WHERE contest_id = ${contestId} AND user_id = ${session.user.id}
      `

      if (existing.length > 0) {
        return NextResponse.json({ error: "Already participating in this contest" }, { status: 400 })
      }

      // Add participant
      await sql`
        INSERT INTO college_contest_participants (contest_id, user_id)
        VALUES (${contestId}, ${session.user.id})
      `

      // Create activity
      await sql`
        INSERT INTO activities (user_id, type, title, description, metadata)
        VALUES (
          ${session.user.id},
          'contest_joined',
          'Joined College Contest',
          ${`Joined "${contest[0].name}"`},
          ${JSON.stringify({ contestId, contestName: contest[0].name })}
        )
      `

      return NextResponse.json({ success: true, message: "Successfully joined contest" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Contest action error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to perform action" },
      { status: 500 },
    )
  }
}
