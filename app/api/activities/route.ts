import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'personal' or 'global'
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let activities

    if (type === "personal") {
      // Get user's personal activities
      activities = await sql`
        SELECT 
          a.id,
          a.type,
          a.title,
          a.description,
          a.metadata,
          a.created_at,
          u.name as user_name,
          u.avatar_url
        FROM activities a
        JOIN users u ON a.user_id = u.id
        WHERE a.user_id = ${session.user.id}
        ORDER BY a.created_at DESC
        LIMIT ${limit}
      `
    } else {
      // Get global activity feed (from followed users or same college)
      activities = await sql`
        SELECT 
          a.id,
          a.type,
          a.title,
          a.description,
          a.metadata,
          a.created_at,
          u.name as user_name,
          u.avatar_url,
          u.codeforces_handle,
          u.college
        FROM activities a
        JOIN users u ON a.user_id = u.id
        WHERE a.type IN ('problem_solved', 'contest_participated', 'rating_change', 'contest_created')
        ORDER BY a.created_at DESC
        LIMIT ${limit}
      `
    }

    return NextResponse.json({ activities })
  } catch (error) {
    console.error("Activities fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch activities" },
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

    const { type, title, description, metadata } = await request.json()

    if (!type || !title) {
      return NextResponse.json({ error: "Type and title are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO activities (user_id, type, title, description, metadata)
      VALUES (${session.user.id}, ${type}, ${title}, ${description || null}, ${metadata || null})
      RETURNING id, created_at
    `

    return NextResponse.json({
      success: true,
      activity: result[0],
    })
  } catch (error) {
    console.error("Activity creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create activity" },
      { status: 500 },
    )
  }
}
