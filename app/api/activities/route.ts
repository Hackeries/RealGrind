import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerComponentClient({ cookies })
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'personal' or 'global'
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Get user ID first
    const { data: user } = await supabase.from("users").select("id").eq("email", session.user.email).single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let activities

    if (type === "personal") {
      // Get user's personal activities
      const { data: personalActivities } = await supabase
        .from("activities")
        .select(`
          *,
          users (name, image)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit)

      activities = personalActivities || []
    } else {
      // Get global activity feed
      const { data: globalActivities } = await supabase
        .from("activities")
        .select(`
          *,
          users (name, image, codeforces_handle, college_id)
        `)
        .in("type", ["problem_solved", "contest_participated", "rating_change", "contest_created"])
        .order("created_at", { ascending: false })
        .limit(limit)

      activities = globalActivities || []
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
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerComponentClient({ cookies })
    const { type, title, description, metadata } = await request.json()

    if (!type || !title) {
      return NextResponse.json({ error: "Type and title are required" }, { status: 400 })
    }

    // Get user ID
    const { data: user } = await supabase.from("users").select("id").eq("email", session.user.email).single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { data: result, error } = await supabase
      .from("activities")
      .insert({
        user_id: user.id,
        type,
        title,
        description: description || null,
        metadata: metadata || null,
      })
      .select("id, created_at")
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      activity: result,
    })
  } catch (error) {
    console.error("Activity creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create activity" },
      { status: 500 },
    )
  }
}
