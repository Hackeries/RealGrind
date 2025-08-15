import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { UserOperations, CollegeOperations } from "@/lib/firestore/operations"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { collegeId, graduationYear, codeforcesHandle } = await request.json()

    await UserOperations.updateUser(session.user.id, {
      collegeId: collegeId || undefined,
      graduationYear: graduationYear || undefined,
      codeforcesHandle: codeforcesHandle || undefined,
      updatedAt: new Date(),
    })

    const updatedUser = await UserOperations.getUserById(session.user.id)

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
    const session = await getServerSession(request)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await UserOperations.getUserById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let college = null
    if (user.collegeId) {
      college = await CollegeOperations.getCollegeById(user.collegeId)
    }

    const response = {
      id: user.id,
      email: user.email,
      name: user.name,
      codeforcesHandle: user.codeforcesHandle,
      graduationYear: user.graduationYear,
      college: college,
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
