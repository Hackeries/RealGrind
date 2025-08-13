import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { codeforcesAPI } from "@/lib/codeforces-api"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's verification details
    const user = await sql`
      SELECT codeforces_handle, verification_problem_id, codeforces_verified
      FROM users 
      WHERE email = ${session.user.email}
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = user[0]
    if (!userData.codeforces_handle || !userData.verification_problem_id) {
      return NextResponse.json({ error: "No verification in progress" }, { status: 400 })
    }

    if (userData.codeforces_verified) {
      return NextResponse.json({ error: "Handle already verified" }, { status: 400 })
    }

    // Get recent submissions from the user
    try {
      const submissions = await codeforcesAPI.getUserSubmissions(userData.codeforces_handle, 1, 50)

      // Parse the expected problem ID
      const problemId = userData.verification_problem_id
      const contestId = Number.parseInt(problemId.slice(0, -1))
      const problemIndex = problemId.slice(-1)

      // Look for compilation error submissions to the verification problem
      const verificationSubmissions = submissions.filter((sub) => {
        const matchesProblem = sub.problem.contestId === contestId && sub.problem.index === problemIndex
        const isCompilationError = sub.verdict === "COMPILATION_ERROR"

        // Check if submission was made in the last 10 minutes (for recent verification)
        const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600
        const isRecent = sub.creationTimeSeconds > tenMinutesAgo

        return matchesProblem && isCompilationError && isRecent
      })

      if (verificationSubmissions.length === 0) {
        return NextResponse.json({
          success: false,
          message:
            "No compilation error submission found for the verification problem. Please submit a solution that causes a compilation error.",
        })
      }

      // Verification successful - update user
      const verificationSubmission = verificationSubmissions[0]
      await sql`
        UPDATE users 
        SET 
          codeforces_verified = true,
          verification_submission_id = ${verificationSubmission.id.toString()}
        WHERE email = ${session.user.email}
      `

      // Sync user data from Codeforces
      try {
        const cfUser = await codeforcesAPI.getUserInfo(userData.codeforces_handle)
        await sql`
          UPDATE users 
          SET 
            name = COALESCE(name, ${cfUser.firstName && cfUser.lastName ? `${cfUser.firstName} ${cfUser.lastName}` : cfUser.handle}),
            image = COALESCE(image, ${cfUser.avatar || null})
          WHERE email = ${session.user.email}
        `
      } catch (syncError) {
        console.error("Error syncing user data:", syncError)
        // Don't fail verification if sync fails
      }

      return NextResponse.json({
        success: true,
        message: "Codeforces handle verified successfully!",
        submissionId: verificationSubmission.id,
      })
    } catch (error) {
      console.error("Error checking submissions:", error)
      return NextResponse.json({
        success: false,
        message: "Error checking your submissions. Please try again.",
      })
    }
  } catch (error) {
    console.error("Error checking CF verification:", error)
    return NextResponse.json({ error: "Failed to check verification" }, { status: 500 })
  }
}
