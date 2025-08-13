import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { codeforcesAPI } from "@/lib/codeforces-api"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getDb()

    const { handle } = await request.json()

    if (!handle || typeof handle !== "string") {
      return NextResponse.json({ error: "Invalid handle" }, { status: 400 })
    }

    // Verify handle exists on Codeforces
    try {
      await codeforcesAPI.getUserInfo(handle)
    } catch (error) {
      return NextResponse.json({ error: "Codeforces handle not found" }, { status: 400 })
    }

    // Check if handle is already verified by another user
    const existingUser = await sql`
      SELECT id, email FROM users 
      WHERE codeforces_handle = ${handle} AND codeforces_verified = true
    `

    if (existingUser.length > 0 && existingUser[0].email !== session.user.email) {
      return NextResponse.json({ error: "This handle is already verified by another user" }, { status: 400 })
    }

    // Get a random easy problem for verification
    const problemsData = await codeforcesAPI.getProblems()
    const easyProblems = problemsData.problems.filter(
      (p) => p.rating && p.rating >= 800 && p.rating <= 1200 && p.contestId,
    )

    if (easyProblems.length === 0) {
      return NextResponse.json({ error: "No suitable problems found for verification" }, { status: 500 })
    }

    const randomProblem = easyProblems[Math.floor(Math.random() * easyProblems.length)]
    const verificationProblemId = `${randomProblem.contestId}${randomProblem.index}`

    // Update user with verification details
    await sql`
      UPDATE users 
      SET 
        codeforces_handle = ${handle},
        codeforces_verified = false,
        verification_problem_id = ${verificationProblemId},
        verification_submission_id = null
      WHERE email = ${session.user.email}
    `

    return NextResponse.json({
      success: true,
      problem: {
        contestId: randomProblem.contestId,
        index: randomProblem.index,
        name: randomProblem.name,
        rating: randomProblem.rating,
        url: `https://codeforces.com/problemset/problem/${randomProblem.contestId}/${randomProblem.index}`,
      },
      handle,
    })
  } catch (error) {
    console.error("Error starting CF verification:", error)
    return NextResponse.json({ error: "Failed to start verification" }, { status: 500 })
  }
}
