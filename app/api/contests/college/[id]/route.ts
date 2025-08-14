import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const contestId = params.id

    // Get contest details
    const { data: contest, error: contestError } = await supabase
      .from("college_contests")
      .select(`
        *,
        users!college_contests_created_by_fkey (name)
      `)
      .eq("id", contestId)
      .single()

    if (contestError || !contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 })
    }

    // Get participants with their scores
    const { data: participants } = await supabase
      .from("college_contest_participants")
      .select(`
        *,
        users (name, codeforces_handle, current_rating)
      `)
      .eq("contest_id", contestId)
      .order("rank", { ascending: true })

    return NextResponse.json({
      contest,
      participants: participants || [],
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
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerComponentClient({ cookies })
    const contestId = params.id
    const { action } = await request.json()

    if (action === "join") {
      // Get user ID
      const { data: user } = await supabase.from("users").select("id").eq("email", session.user.email).single()

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Check if contest exists and is active
      const { data: contest } = await supabase.from("college_contests").select("*").eq("id", contestId).single()

      if (!contest) {
        return NextResponse.json({ error: "Contest not found" }, { status: 404 })
      }

      if (!contest.is_active) {
        return NextResponse.json({ error: "Contest is not active" }, { status: 400 })
      }

      const now = new Date()
      const endTime = new Date(contest.end_time)

      if (now > endTime) {
        return NextResponse.json({ error: "Contest has ended" }, { status: 400 })
      }

      // Check if user is already participating
      const { data: existing } = await supabase
        .from("college_contest_participants")
        .select("id")
        .eq("contest_id", contestId)
        .eq("user_id", user.id)
        .single()

      if (existing) {
        return NextResponse.json({ error: "Already participating in this contest" }, { status: 400 })
      }

      // Add participant
      const { error: participantError } = await supabase.from("college_contest_participants").insert({
        contest_id: contestId,
        user_id: user.id,
      })

      if (participantError) throw participantError

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
