import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user basic stats
    const userStats = await sql`
      SELECT 
        codeforces_handle,
        current_rating,
        max_rating,
        problems_solved,
        contests_participated,
        college,
        graduation_year
      FROM users 
      WHERE id = ${session.user.id}
    `

    if (userStats.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userStats[0]

    // Get problem solving stats by difficulty
    const difficultyStats = await sql`
      SELECT 
        CASE 
          WHEN p.rating IS NULL THEN 'Unrated'
          WHEN p.rating < 1200 THEN 'Beginner'
          WHEN p.rating < 1600 THEN 'Pupil'
          WHEN p.rating < 1900 THEN 'Specialist'
          WHEN p.rating < 2100 THEN 'Expert'
          WHEN p.rating < 2400 THEN 'Candidate Master'
          ELSE 'Master+'
        END as difficulty,
        COUNT(DISTINCT us.problem_id) as solved_count
      FROM user_submissions us
      JOIN problems p ON us.problem_id = p.id
      WHERE us.user_id = ${session.user.id} AND us.verdict = 'OK'
      GROUP BY difficulty
      ORDER BY 
        CASE difficulty
          WHEN 'Unrated' THEN 0
          WHEN 'Beginner' THEN 1
          WHEN 'Pupil' THEN 2
          WHEN 'Specialist' THEN 3
          WHEN 'Expert' THEN 4
          WHEN 'Candidate Master' THEN 5
          ELSE 6
        END
    `

    // Get problem solving stats by tags
    const tagStats = await sql`
      SELECT 
        UNNEST(p.tags) as tag,
        COUNT(DISTINCT us.problem_id) as solved_count
      FROM user_submissions us
      JOIN problems p ON us.problem_id = p.id
      WHERE us.user_id = ${session.user.id} AND us.verdict = 'OK'
      GROUP BY tag
      ORDER BY solved_count DESC
      LIMIT 10
    `

    // Get recent activity
    const recentSubmissions = await sql`
      SELECT 
        us.problem_id,
        p.name as problem_name,
        p.rating,
        us.verdict,
        us.programming_language,
        us.submitted_at
      FROM user_submissions us
      JOIN problems p ON us.problem_id = p.id
      WHERE us.user_id = ${session.user.id}
      ORDER BY us.submitted_at DESC
      LIMIT 10
    `

    // Get rating history
    const ratingHistory = await sql`
      SELECT 
        contest_id,
        old_rating,
        new_rating,
        rank,
        participated_at
      FROM user_contest_participation
      WHERE user_id = ${session.user.id}
      ORDER BY participated_at ASC
    `

    return NextResponse.json({
      user: {
        codeforcesHandle: user.codeforces_handle,
        currentRating: user.current_rating,
        maxRating: user.max_rating,
        problemsSolved: user.problems_solved,
        contestsParticipated: user.contests_participated,
        college: user.college,
        graduationYear: user.graduation_year,
      },
      difficultyStats,
      tagStats,
      recentSubmissions,
      ratingHistory,
    })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 },
    )
  }
}
