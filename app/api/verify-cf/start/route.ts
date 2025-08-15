import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { FirestoreOperations, UserOperations } from "@/lib/firestore/operations"
import { COLLECTIONS } from "@/lib/firestore/collections"
import { codeforcesAPI } from "@/lib/codeforces-api"
import { CacheManager } from "@/lib/redis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

const VERIFICATION_PROBLEM_ID = "4A" // Fixed problem: Watermelon
const TOKEN_EXPIRY_MINUTES = 10

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { handle } = await request.json()

    if (!handle || typeof handle !== "string") {
      return NextResponse.json({ error: "Invalid handle" }, { status: 400 })
    }

    // Validate handle exists on Codeforces
    const isValid = await codeforcesAPI.validateHandle(handle)
    if (!isValid) {
      return NextResponse.json({ error: "Codeforces handle not found" }, { status: 400 })
    }

    const existingUser = await UserOperations.getUserByCodeforcesHandle(handle)
    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json({ error: "This handle is already verified by another user" }, { status: 400 })
    }

    // Generate verification token
    const token = `REALGRIND-VERIFY-${nanoid(8).toUpperCase()}`
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000)

    await FirestoreOperations.create(COLLECTIONS.VERIFICATION_TOKENS, {
      userId: user.id,
      handle,
      token,
      problemId: VERIFICATION_PROBLEM_ID,
      expiresAt,
      used: false,
      createdAt: new Date(),
    })

    // Cache token for quick lookup
    await CacheManager.set(`verify_token:${token}`, { userId: user.id, handle }, { ttl: TOKEN_EXPIRY_MINUTES * 60 })

    const verificationCode = `// ${token}
#error ${token}
int main(){}
`

    const instructions = [
      `Go to Codeforces problem 4A (Watermelon)`,
      `Copy the verification code below exactly as shown`,
      `Submit it as a C++ solution (it will cause a compilation error)`,
      `Come back and click "Check Verification" within ${TOKEN_EXPIRY_MINUTES} minutes`,
    ]

    return NextResponse.json({
      success: true,
      token,
      handle,
      problemId: VERIFICATION_PROBLEM_ID,
      problemUrl: "https://codeforces.com/problemset/problem/4/A",
      verificationCode,
      expiresAt: expiresAt.toISOString(),
      instructions,
    })
  } catch (error) {
    console.error("Error starting CF verification:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start verification" },
      { status: 500 },
    )
  }
}
