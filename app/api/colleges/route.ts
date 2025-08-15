import { type NextRequest, NextResponse } from "next/server"
import { CollegeOperations } from "@/lib/firestore/operations"
import { z } from "zod"

const SearchSchema = z.object({
  q: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  tier: z.coerce.number().min(1).max(3).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = SearchSchema.parse(Object.fromEntries(searchParams))

    const { colleges, total } = await CollegeOperations.searchColleges({
      q: params.q,
      state: params.state,
      city: params.city,
      tier: params.tier,
      limit: params.limit,
      offset: params.offset,
    })

    return NextResponse.json({
      colleges,
      pagination: {
        total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + params.limit < total,
      },
    })
  } catch (error) {
    console.error("College search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
