import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { codeforcesAPI } from "@/lib/codeforces-api"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

const VERIFICATION_PROBLEM_ID = "4A" // Fixed problem: Watermelon
const TOKEN_EXPIRY_MINUTES = 10

async function withRetry<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }

      const delay = Math.pow(2, attempt) * 1000
      console.log(`[v0] CF verification retry attempt ${attempt + 1} after ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error("Max retries exceeded")
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let requestData
    try {
      requestData = await request.json()
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { handle } = requestData

    if (!handle || typeof handle !== "string" || handle.trim().length === 0) {
      return NextResponse.json({ error: "Valid Codeforces handle is required" }, { status: 400 })
    }

    const cleanHandle = handle.trim()

    let isValid = false
    try {
      isValid = await withRetry(() => codeforcesAPI.validateHandle(cleanHandle))
    } catch (error) {
      console.error("Failed to validate Codeforces handle:", error)
      return NextResponse.json(
        {
          error: "Unable to verify Codeforces handle",
          details: "Codeforces API is temporarily unavailable. Please try again later.",
        },
        { status: 503 },
      )
    }

    if (!isValid) {
      return NextResponse.json({ error: "Codeforces handle not found" }, { status: 400 })
    }

    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("codeforces_handle", cleanHandle)
      .neq("id", authUser.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing handle:", checkError)
      return NextResponse.json(
        { error: "Failed to verify handle availability", details: checkError.message },
        { status: 500 },
      )
    }

    if (existingUser) {
      return NextResponse.json({ error: "This handle is already verified by another user" }, { status: 400 })
    }

    // Generate verification token
    const token = `REALGRIND-VERIFY-${nanoid(8).toUpperCase()}`
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000)

    const { error: tokenError } = await supabase.from("verification_tokens").insert({
      user_id: authUser.id,
      handle: cleanHandle,
      token,
      problem_id: VERIFICATION_PROBLEM_ID,
      expires_at: expiresAt.toISOString(),
      used: false,
      created_at: new Date().toISOString(),
    })

    if (tokenError) {
      console.error("Error creating verification token:", tokenError)
      return NextResponse.json(
        { error: "Failed to create verification token", details: tokenError.message },
        { status: 500 },
      )
    }

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
      handle: cleanHandle,
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
