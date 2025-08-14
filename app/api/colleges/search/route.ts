import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const SearchSchema = z.object({
  q: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  tier: z.enum(["T1", "T2", "T3", "OTHER"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = SearchSchema.parse(Object.fromEntries(searchParams))

    const where: any = {}

    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: "insensitive" } },
        { city: { contains: params.q, mode: "insensitive" } },
        { state: { contains: params.q, mode: "insensitive" } },
      ]
    }

    if (params.state) {
      where.state = { equals: params.state, mode: "insensitive" }
    }

    if (params.city) {
      where.city = { equals: params.city, mode: "insensitive" }
    }

    if (params.tier) {
      where.tier = params.tier
    }

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          state: true,
          city: true,
          tier: true,
          affiliation: true,
          logoUrl: true,
        },
        orderBy: [{ tier: "asc" }, { name: "asc" }],
        take: params.limit,
        skip: params.offset,
      }),
      prisma.college.count({ where }),
    ])

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
