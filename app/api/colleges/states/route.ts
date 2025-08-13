import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const states = await sql`
      SELECT DISTINCT state
      FROM colleges
      ORDER BY state ASC
    `

    return NextResponse.json({ states: states.map((s) => s.state) })
  } catch (error) {
    console.error("Error fetching states:", error)
    return NextResponse.json({ error: "Failed to fetch states" }, { status: 500 })
  }
}
