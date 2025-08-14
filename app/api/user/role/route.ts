import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role } = await request.json()

    if (!role || !["student", "organizer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const supabase = createServerComponentClient({ cookies })

    // Update user role
    const { error } = await supabase
      .from("users")
      .update({
        role: role,
        updated_at: new Date().toISOString(),
      })
      .eq("email", session.user.email)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
