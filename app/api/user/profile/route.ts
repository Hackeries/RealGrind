import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest) {
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

    const { collegeId, graduationYear, codeforcesHandle } = requestData

    // Validate input data
    if (graduationYear && (typeof graduationYear !== "number" || graduationYear < 2020 || graduationYear > 2030)) {
      return NextResponse.json({ error: "Invalid graduation year" }, { status: 400 })
    }

    if (codeforcesHandle && (typeof codeforcesHandle !== "string" || codeforcesHandle.trim().length === 0)) {
      return NextResponse.json({ error: "Invalid Codeforces handle" }, { status: 400 })
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (collegeId !== undefined) updateData.college_id = collegeId
    if (graduationYear !== undefined) updateData.graduation_year = graduationYear
    if (codeforcesHandle !== undefined) updateData.codeforces_handle = codeforcesHandle?.trim()

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", authUser.id)
      .select("*")
      .single()

    if (updateError) {
      console.error("Profile update error:", updateError)
      return NextResponse.json({ error: "Failed to update profile", details: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        name,
        codeforces_handle,
        graduation_year,
        role,
        college_id,
        colleges (
          id,
          name,
          state,
          city
        )
      `,
      )
      .eq("id", authUser.id)
      .single()

    if (userError) {
      console.error("User fetch error:", userError)
      if (userError.code === "PGRST116") {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to fetch profile", details: userError.message }, { status: 500 })
    }

    const response = {
      id: user.id,
      email: user.email,
      name: user.name,
      codeforcesHandle: user.codeforces_handle,
      graduationYear: user.graduation_year,
      college: user.colleges,
      role: user.role,
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
