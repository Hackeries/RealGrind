import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { codeforcesAPI } from "@/lib/codeforces-api"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    // Fetch all problems from Codeforces
    const { problems, problemStatistics } = await codeforcesAPI.getProblems()

    // Create a map of problem statistics
    const statsMap = new Map()
    problemStatistics.forEach((stat) => {
      const key = `${stat.contestId || "problemset"}-${stat.index}`
      statsMap.set(key, stat.solvedCount)
    })

    let syncedCount = 0

    // Insert/update problems in batches
    const sql = getDb() // moved database connection inside request handler
    for (const problem of problems) {
      const problemId = `${problem.contestId || "problemset"}-${problem.index}`
      const solvedCount = statsMap.get(problemId) || 0

      await sql`
        INSERT INTO problems (
          id, contest_id, index, name, type, rating, tags, solved_count
        ) VALUES (
          ${problemId},
          ${problem.contestId?.toString() || "problemset"},
          ${problem.index},
          ${problem.name},
          ${problem.type},
          ${problem.rating || null},
          ${problem.tags},
          ${solvedCount}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          rating = EXCLUDED.rating,
          tags = EXCLUDED.tags,
          solved_count = EXCLUDED.solved_count
      `

      syncedCount++
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} problems successfully`,
    })
  } catch (error) {
    console.error("Problems sync error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Problems sync failed" },
      { status: 500 },
    )
  }
}
