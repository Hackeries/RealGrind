import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { codeforcesAPI } from "@/lib/codeforces-api"
import { CacheManager } from "@/lib/redis"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Get verification token from database
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

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
    await prisma.verificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true },
    })

    // Get user info from Codeforces
    const cfUser = await codeforcesAPI.getUserInfo(verificationToken.handle)

    // Update user with verified handle and rating
    await prisma.user.update({
      where: { id: user.id },
      data: {
        codeforcesHandle: verificationToken.handle,
        rating: cfUser.rating || 0,
        name: user.name || `${cfUser.firstName || ""} ${cfUser.lastName || ""}`.trim() || cfUser.handle,
      },
    })

    // Store verification record
    await prisma.codeforcesVerification.create({
      data: {
        userId: user.id,
        handle: verificationToken.handle,
        verifiedAt: new Date(),
        tokenHash: Buffer.from(token).toString("base64"),
      },
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
