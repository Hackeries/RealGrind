import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const sql = getDb()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const tier = searchParams.get("tier")
    const state = searchParams.get("state")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let query = `
      SELECT id, name, short_name, location, state, tier, established_year
      FROM colleges
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR short_name ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (tier) {
      query += ` AND tier = $${paramIndex}`
      params.push(Number.parseInt(tier))
      paramIndex++
    }

    if (state) {
      query += ` AND state = $${paramIndex}`
      params.push(state)
      paramIndex++
    }

    query += ` ORDER BY tier ASC, name ASC LIMIT $${paramIndex}`
    params.push(limit)

    const colleges = await sql(query, params)

    return NextResponse.json({ colleges })
  } catch (error) {
    console.error("Error fetching colleges:", error)
    return NextResponse.json({ error: "Failed to fetch colleges" }, { status: 500 })
  }
}
