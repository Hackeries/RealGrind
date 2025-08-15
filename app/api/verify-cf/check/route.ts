import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { FirestoreOperations, UserOperations } from "@/lib/firestore/operations"
import { COLLECTIONS } from "@/lib/firestore/collections"
import { where } from "firebase/firestore"
import { codeforcesAPI } from "@/lib/codeforces-api"
import { CacheManager } from "@/lib/redis"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const verificationTokens = await FirestoreOperations.query(
      COLLECTIONS.VERIFICATION_TOKENS,
      [
        where("token", "==", token),
        where("userId", "==", user.id),
        where("used", "==", false),
        where("expiresAt", ">", new Date()),
      ],
      1,
    )

    const verificationToken = verificationTokens[0]
    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Check for compilation error submissions
    const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600
    const verificationSubmissions = await codeforcesAPI.getVerificationSubmissions(
      verificationToken.handle,
      verificationToken.problemId,
      tenMinutesAgo,
    )

    if (verificationSubmissions.length === 0) {
      return NextResponse.json({
        verified: false,
        message: "No compilation error submission found. Please submit the verification code and try again.",
      })
    }

    // Mark token as used
    await FirestoreOperations.update(COLLECTIONS.VERIFICATION_TOKENS, verificationToken.id, { used: true })

    // Get user info from Codeforces
    const cfUser = await codeforcesAPI.getUserInfo(verificationToken.handle)

    // Update user with verified handle and rating
    await UserOperations.updateUser(user.id, {
      codeforcesHandle: verificationToken.handle,
      rating: cfUser.rating || 0,
      name: user.name || `${cfUser.firstName || ""} ${cfUser.lastName || ""}`.trim() || cfUser.handle,
    })

    // Store verification record in activities
    await FirestoreOperations.create(COLLECTIONS.ACTIVITIES, {
      userId: user.id,
      type: "codeforces_verified",
      title: "Codeforces handle verified",
      description: `Verified handle: ${verificationToken.handle}`,
      metadata: {
        handle: verificationToken.handle,
        rating: cfUser.rating || 0,
        tokenHash: Buffer.from(token).toString("base64"),
      },
      createdAt: new Date(),
    })

    // Clear cache
    await CacheManager.del(`verify_token:${token}`)

    return NextResponse.json({
      verified: true,
      message: "Codeforces handle verified successfully!",
      handle: verificationToken.handle,
      rating: cfUser.rating || 0,
    })
  } catch (error) {
    console.error("Error checking CF verification:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check verification" },
      { status: 500 },
    )
  }
}
