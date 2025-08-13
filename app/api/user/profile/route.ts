import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { collegeId, graduationYear, codeforcesHandle } = await request.json()

    await sql`
      UPDATE users 
      SET 
        college_id = ${collegeId || null},
        graduation_year = ${graduationYear || null},
        codeforces_handle = ${codeforcesHandle || null},
        updated_at = NOW()
      WHERE email = ${session.user.email}
    `

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
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await sql`
      SELECT 
        u.id, u.email, u.name, u.image, u.codeforces_handle, u.codeforces_verified,
        u.graduation_year, u.current_rating, u.max_rating, u.problems_solved, u.contests_participated,
        c.id as college_id, c.name as college_name, c.short_name as college_short_name,
        c.location as college_location, c.state as college_state, c.tier as college_tier
      FROM users u
      LEFT JOIN colleges c ON u.college_id = c.id
      WHERE u.email = ${session.user.email}
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = user[0]

    const response = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      image: userData.image,
      codeforces_handle: userData.codeforces_handle,
      codeforces_verified: userData.codeforces_verified,
      graduation_year: userData.graduation_year,
      current_rating: userData.current_rating,
      max_rating: userData.max_rating,
      problems_solved: userData.problems_solved,
      contests_participated: userData.contests_participated,
      college: userData.college_id
        ? {
            id: userData.college_id,
            name: userData.college_name,
            short_name: userData.college_short_name,
            location: userData.college_location,
            state: userData.college_state,
            tier: userData.college_tier,
          }
        : null,
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
