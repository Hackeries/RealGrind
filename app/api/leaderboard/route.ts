import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CacheManager } from "@/lib/redis"
import { z } from "zod"

const LeaderboardSchema = z.object({
  type: z.enum(["college", "state", "national", "friends"]).default("national"),
  collegeId: z.coerce.number().optional(),
  state: z.string().optional(),
  userId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = LeaderboardSchema.parse(Object.fromEntries(searchParams))

    // Generate cache key based on parameters
    const cacheKey = `leaderboard:${params.type}:${params.collegeId || "all"}:${params.state || "all"}:${params.limit}:${params.offset}`

    // Check cache first
    const cached = await CacheManager.get<any>(cacheKey)
    if (cached) {
      return NextResponse.json({ ...cached, cached: true })
    }

    const whereClause: any = {
      codeforcesHandle: { not: null },
      rating: { gt: 0 },
    }

    // Apply filters based on type
    switch (params.type) {
      case "college":
        if (params.collegeId) {
          whereClause.collegeId = params.collegeId
        }
        break
      case "state":
        if (params.state) {
          whereClause.college = {
            state: { equals: params.state, mode: "insensitive" },
          }
        }
        break
      case "friends":
        if (params.userId) {
          // Get user's friends
          const friendships = await prisma.friendship.findMany({
            where: {
              OR: [{ userId: params.userId }, { friendId: params.userId }],
            },
          })

          const friendIds = friendships.map((f) => (f.userId === params.userId ? f.friendId : f.userId))
          friendIds.push(params.userId) // Include self

          whereClause.id = { in: friendIds }
        }
        break
      // national - no additional filters
    }

    const [leaderboard, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          codeforcesHandle: true,
          rating: true,
          college: {
            select: {
              id: true,
              name: true,
              state: true,
              city: true,
              tier: true,
            },
          },
        },
        orderBy: { rating: "desc" },
        take: params.limit,
        skip: params.offset,
      }),
      prisma.user.count({ where: whereClause }),
    ])

    // Get recent activity for each user (simplified)
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (user, index) => {
        // Get recent submissions count (mock data for now)
        const recentActivity = {
          recentSubmissions: Math.floor(Math.random() * 20),
          recentSolved: Math.floor(Math.random() * 10),
          lastActive: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
        }

        return {
          rank: params.offset + index + 1,
          id: user.id,
          name: user.name || "Anonymous",
          handle: user.codeforcesHandle || "",
          rating: user.rating || 0,
          college: user.college,
          problemsSolved: Math.floor((user.rating || 0) / 5), // Rough estimate
          recentActivity,
        }
      }),
    )

    const result = {
      leaderboard: enrichedLeaderboard,
      pagination: {
        total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + params.limit < total,
      },
      type: params.type,
      filters: {
        collegeId: params.collegeId,
        state: params.state,
        userId: params.userId,
      },
    }

    // Cache for 5 minutes
    await CacheManager.set(cacheKey, result, { ttl: 300 })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Leaderboard API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch leaderboard" },
      { status: 500 },
    )
  }
}
