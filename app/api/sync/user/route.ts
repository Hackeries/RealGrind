import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { codeforcesAPI } from "@/lib/codeforces-api"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getDb()

    const { codeforcesHandle } = await request.json()

    if (!codeforcesHandle) {
      return NextResponse.json({ error: "Codeforces handle is required" }, { status: 400 })
    }

    // Verify the handle exists and get user info
    const cfUser = await codeforcesAPI.getUserInfo(codeforcesHandle)

    // Update user with Codeforces data
    await sql`
      UPDATE users 
      SET 
        codeforces_handle = ${codeforcesHandle},
        current_rating = ${cfUser.rating || 0},
        max_rating = ${cfUser.maxRating || 0},
        updated_at = NOW()
      WHERE id = ${session.user.id}
    `

    // Sync user submissions
    const submissions = await codeforcesAPI.getUserSubmissions(codeforcesHandle)

    // Count solved problems (AC submissions)
    const solvedProblems = new Set()

    for (const submission of submissions) {
      // Insert/update submission
      await sql`
        INSERT INTO user_submissions (
          user_id, problem_id, verdict, programming_language,
          time_consumed_millis, memory_consumed_bytes, submitted_at
        ) VALUES (
          ${session.user.id},
          ${`${submission.problem.contestId || "problemset"}-${submission.problem.index}`},
          ${submission.verdict},
          ${submission.programmingLanguage},
          ${submission.timeConsumedMillis},
          ${submission.memoryConsumedBytes},
          ${new Date(submission.creationTimeSeconds * 1000).toISOString()}
        )
        ON CONFLICT (user_id, problem_id, submitted_at) DO UPDATE SET
          verdict = EXCLUDED.verdict,
          programming_language = EXCLUDED.programming_language,
          time_consumed_millis = EXCLUDED.time_consumed_millis,
          memory_consumed_bytes = EXCLUDED.memory_consumed_bytes
      `

      // Track solved problems
      if (submission.verdict === "OK") {
        solvedProblems.add(`${submission.problem.contestId || "problemset"}-${submission.problem.index}`)
      }

      // Insert/update problem data
      await sql`
        INSERT INTO problems (
          id, contest_id, index, name, type, rating, tags
        ) VALUES (
          ${`${submission.problem.contestId || "problemset"}-${submission.problem.index}`},
          ${submission.problem.contestId?.toString() || "problemset"},
          ${submission.problem.index},
          ${submission.problem.name},
          ${submission.problem.type},
          ${submission.problem.rating || null},
          ${submission.problem.tags}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          rating = EXCLUDED.rating,
          tags = EXCLUDED.tags
      `
    }

    // Update user's problems solved count
    await sql`
      UPDATE users 
      SET problems_solved = ${solvedProblems.size}
      WHERE id = ${session.user.id}
    `

    // Sync contest participation
    const ratings = await codeforcesAPI.getUserRating(codeforcesHandle)

    for (const rating of ratings) {
      await sql`
        INSERT INTO user_contest_participation (
          user_id, contest_id, rank, old_rating, new_rating, participated_at
        ) VALUES (
          ${session.user.id},
          ${rating.contestId.toString()},
          ${rating.rank},
          ${rating.oldRating},
          ${rating.newRating},
          ${new Date(rating.ratingUpdateTimeSeconds * 1000).toISOString()}
        )
        ON CONFLICT (user_id, contest_id) DO UPDATE SET
          rank = EXCLUDED.rank,
          old_rating = EXCLUDED.old_rating,
          new_rating = EXCLUDED.new_rating
      `
    }

    // Update contests participated count
    await sql`
      UPDATE users 
      SET contests_participated = ${ratings.length}
      WHERE id = ${session.user.id}
    `

    // Create activity for sync
    await sql`
      INSERT INTO activities (user_id, type, title, description, metadata)
      VALUES (
        ${session.user.id},
        'profile_sync',
        'Profile Synced',
        'Successfully synced Codeforces data',
        ${JSON.stringify({
          handle: codeforcesHandle,
          problemsSolved: solvedProblems.size,
          contestsParticipated: ratings.length,
          currentRating: cfUser.rating || 0,
        })}
      )
    `

    return NextResponse.json({
      success: true,
      data: {
        handle: codeforcesHandle,
        rating: cfUser.rating || 0,
        maxRating: cfUser.maxRating || 0,
        problemsSolved: solvedProblems.size,
        contestsParticipated: ratings.length,
      },
    })
  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sync failed" }, { status: 500 })
  }
}
