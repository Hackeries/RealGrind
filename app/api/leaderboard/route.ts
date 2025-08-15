import { type NextRequest, NextResponse } from "next/server"
import { FirestoreOperations } from "@/lib/firestore/operations"
import { COLLECTIONS } from "@/lib/firestore/collections"
import { where, orderBy } from "firebase/firestore"
import { CacheManager } from "@/lib/redis"
import { z } from "zod"

const LeaderboardSchema = z.object({
  type: z.enum(["college", "state", "national", "friends"]).default("national"),
  collegeId: z.string().optional(),
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

    const constraints = [where("codeforcesHandle", "!=", null), orderBy("codeforcesHandle"), orderBy("rating", "desc")]

    // Apply filters based on type
    switch (params.type) {
      case "college":
        if (params.collegeId) {
          constraints.unshift(where("collegeId", "==", params.collegeId))
        }
        break
      case "state":
        if (params.state) {
          constraints.unshift(where("college.state", "==", params.state))
        }
        break
      case "friends":
        if (params.userId) {
          // For friends, we'll need to implement friendship logic later
          // For now, just return the user's own data
          constraints.unshift(where("id", "==", params.userId))
        }
        break
      // national - no additional filters
    }

    const users = await FirestoreOperations.query(COLLECTIONS.USERS, constraints, params.limit)

    // Transform data to match expected format
    const enrichedLeaderboard = users.map((user: any, index) => {
      const recentActivity = {
        recentSubmissions: Math.floor(Math.random() * 20),
        recentSolved: Math.floor(Math.random() * 10),
        lastActive: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      }

      return {
        rank: params.offset + index + 1,
        id: user.id,
        name: user.name || "Anonymous",
        handle: user.codeforcesHandle || "",
        rating: user.rating || 0,
        college: user.college || null,
        problemsSolved: Math.floor((user.rating || 0) / 5),
        recentActivity,
      }
    })

    const result = {
      leaderboard: enrichedLeaderboard,
      pagination: {
        total: users.length, // Note: Firestore doesn't provide total count easily
        limit: params.limit,
        offset: params.offset,
        hasMore: users.length === params.limit,
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
