import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies })

    const { data: contests, error } = await supabase
      .from("college_contests")
      .select(`
        *,
        users!college_contests_created_by_fkey (name),
        college_contest_participants (count)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ contests: contests || [] })
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
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerComponentClient({ cookies })
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

    // Get user ID
    const { data: user } = await supabase.from("users").select("id").eq("email", session.user.email).single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: result, error } = await supabase
      .from("college_contests")
      .insert({
        name,
        college,
        description: description || null,
        start_time: startTime,
        end_time: endTime,
        created_by: user.id,
      })
      .select("id")
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      contestId: result.id,
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
