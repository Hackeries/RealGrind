import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerComponentClient({ cookies })
    const { collegeId, graduationYear, codeforcesHandle } = await request.json()

    const { error } = await supabase
      .from("users")
      .update({
        college_id: collegeId || null,
        graduation_year: graduationYear || null,
        codeforces_handle: codeforcesHandle || null,
        updated_at: new Date().toISOString(),
      })
      .eq("email", session.user.email)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerComponentClient({ cookies })

    const { data: user, error } = await supabase
      .from("users")
      .select(`
        id, email, name, image, codeforces_handle, codeforces_verified,
        graduation_year, current_rating, max_rating, problems_solved, contests_participated,
        colleges (
          id, name, short_name, location, state, tier
        )
      `)
      .eq("email", session.user.email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const response = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      codeforces_handle: user.codeforces_handle,
      codeforces_verified: user.codeforces_verified,
      graduation_year: user.graduation_year,
      current_rating: user.current_rating,
      max_rating: user.max_rating,
      problems_solved: user.problems_solved,
      contests_participated: user.contests_participated,
      college: user.colleges || null,
    }

    return NextResponse.json({ user: response })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch profile" },
      { status: 500 },
    )
  }
}
