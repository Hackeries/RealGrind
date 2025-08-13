import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const contests = await sql`
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
        u.name as creator_name,
        COUNT(ccp.user_id) as participant_count
      FROM college_contests cc
      LEFT JOIN users u ON cc.created_by = u.id
      LEFT JOIN college_contest_participants ccp ON cc.id = ccp.contest_id
      GROUP BY cc.id, u.name
      ORDER BY cc.created_at DESC
    `

    return NextResponse.json({ contests })
  } catch (error) {
    console.error("College contests fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch college contests" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, college, startTime, endTime } = await request.json()

    if (!name || !college || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (start >= end) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 })
    }

    if (start <= new Date()) {
      return NextResponse.json({ error: "Start time must be in the future" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO college_contests (
        name, college, description, start_time, end_time, created_by
      ) VALUES (
        ${name}, ${college}, ${description || null}, ${startTime}, ${endTime}, ${session.user.id}
      )
      RETURNING id
    `

    // Create activity for contest creation
    await sql`
      INSERT INTO activities (user_id, type, title, description, metadata)
      VALUES (
        ${session.user.id},
        'contest_created',
        'Created College Contest',
        ${`Created "${name}" for ${college}`},
        ${JSON.stringify({ contestId: result[0].id, name, college })}
      )
    `

    return NextResponse.json({
      success: true,
      contestId: result[0].id,
      message: "Contest created successfully",
    })
  } catch (error) {
    console.error("Contest creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create contest" },
      { status: 500 },
    )
  }
}
