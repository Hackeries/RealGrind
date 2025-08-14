import { codeforcesAPI, type CodeforcesUser, type UserStats, type CodeforcesSubmission } from "./codeforces-api"
import { cache } from "./cache"
import { getDb } from "./db"

export class RealtimeCodeforcesService {
  private syncIntervals = new Map<string, NodeJS.Timeout>()

  // Cache TTL in seconds
  private readonly CACHE_TTL = {
    USER_INFO: 300, // 5 minutes
    USER_STATS: 180, // 3 minutes
    SUBMISSIONS: 120, // 2 minutes
    CONTESTS: 600, // 10 minutes
    PROBLEMS: 3600, // 1 hour
    RECOMMENDATIONS: 900, // 15 minutes
  }

  async getUserInfoCached(handle: string): Promise<CodeforcesUser | null> {
    const cacheKey = `cf:user:${handle}`

    // Try cache first
    let userInfo = await cache.get<CodeforcesUser>(cacheKey)

    if (!userInfo) {
      try {
        userInfo = await codeforcesAPI.getUserInfo(handle)
        await cache.set(cacheKey, userInfo, this.CACHE_TTL.USER_INFO)
      } catch (error) {
        console.error(`Failed to fetch user info for ${handle}:`, error)
        return null
      }
    }

    return userInfo
  }

  async getUserStatsCached(handle: string): Promise<UserStats | null> {
    const cacheKey = `cf:stats:${handle}`

    let stats = await cache.get<UserStats>(cacheKey)

    if (!stats) {
      try {
        stats = await codeforcesAPI.getUserStats(handle)
        await cache.set(cacheKey, stats, this.CACHE_TTL.USER_STATS)
      } catch (error) {
        console.error(`Failed to fetch user stats for ${handle}:`, error)
        return null
      }
    }

    return stats
  }

  async getUserSubmissionsCached(handle: string): Promise<CodeforcesSubmission[]> {
    const cacheKey = `cf:submissions:${handle}`

    let submissions = await cache.get<CodeforcesSubmission[]>(cacheKey)

    if (!submissions) {
      try {
        submissions = await codeforcesAPI.getUserSubmissions(handle)
        await cache.set(cacheKey, submissions, this.CACHE_TTL.SUBMISSIONS)
      } catch (error) {
        console.error(`Failed to fetch submissions for ${handle}:`, error)
        return []
      }
    }

    return submissions
  }

  async getRecommendationsCached(handle: string): Promise<any[]> {
    const cacheKey = `cf:recommendations:${handle}`

    let recommendations = await cache.get<any[]>(cacheKey)

    if (!recommendations) {
      try {
        recommendations = await codeforcesAPI.getRecommendedProblems(handle, 10)
        await cache.set(cacheKey, recommendations, this.CACHE_TTL.RECOMMENDATIONS)
      } catch (error) {
        console.error(`Failed to fetch recommendations for ${handle}:`, error)
        return []
      }
    }

    return recommendations
  }

  async startBackgroundSync(handle: string): Promise<void> {
    // Clear existing interval if any
    this.stopBackgroundSync(handle)

    // Sync every 2 minutes
    const interval = setInterval(async () => {
      try {
        await this.syncUserData(handle)
      } catch (error) {
        console.error(`Background sync failed for ${handle}:`, error)
      }
    }, 120000) // 2 minutes

    this.syncIntervals.set(handle, interval)

    // Initial sync
    await this.syncUserData(handle)
  }

  stopBackgroundSync(handle: string): void {
    const interval = this.syncIntervals.get(handle)
    if (interval) {
      clearInterval(interval)
      this.syncIntervals.delete(handle)
    }
  }

  private async syncUserData(handle: string): Promise<void> {
    try {
      const sql = getDb()

      // Fetch fresh data from Codeforces
      const [userInfo, stats, submissions] = await Promise.all([
        codeforcesAPI.getUserInfo(handle),
        codeforcesAPI.getUserStats(handle),
        codeforcesAPI.getUserSubmissions(handle, 1, 100), // Recent submissions only
      ])

      // Update cache
      await Promise.all([
        cache.set(`cf:user:${handle}`, userInfo, this.CACHE_TTL.USER_INFO),
        cache.set(`cf:stats:${handle}`, stats, this.CACHE_TTL.USER_STATS),
        cache.set(`cf:submissions:${handle}`, submissions, this.CACHE_TTL.SUBMISSIONS),
      ])

      // Update database with latest stats
      await sql`
        UPDATE users 
        SET 
          cf_rating = ${stats.currentRating},
          cf_max_rating = ${stats.maxRating},
          cf_rank = ${stats.rank},
          problems_solved = ${stats.solvedProblems},
          contests_participated = ${stats.contestsParticipated},
          last_cf_sync = NOW()
        WHERE cf_handle = ${handle}
      `

      // Process new submissions for activity feed
      const recentSubmissions = submissions.filter(
        (s) => s.creationTimeSeconds > Date.now() / 1000 - 3600, // Last hour
      )

      for (const submission of recentSubmissions) {
        if (submission.verdict === "OK") {
          // Add to activities table
          await sql`
            INSERT INTO activities (user_id, type, data, created_at)
            SELECT u.id, 'problem_solved', ${JSON.stringify({
              problem: submission.problem,
              contest_id: submission.contestId,
              language: submission.programmingLanguage,
              time_consumed: submission.timeConsumedMillis,
            })}, to_timestamp(${submission.creationTimeSeconds})
            FROM users u 
            WHERE u.cf_handle = ${handle}
            ON CONFLICT DO NOTHING
          `
        }
      }
    } catch (error) {
      console.error(`Sync failed for ${handle}:`, error)
    }
  }

  async invalidateUserCache(handle: string): Promise<void> {
    await Promise.all([
      cache.del(`cf:user:${handle}`),
      cache.del(`cf:stats:${handle}`),
      cache.del(`cf:submissions:${handle}`),
      cache.del(`cf:recommendations:${handle}`),
    ])
  }

  async getLeaderboardData(type: "college" | "national" | "global", collegeId?: number): Promise<any[]> {
    const cacheKey = `leaderboard:${type}:${collegeId || "all"}`

    let leaderboard = await cache.get<any[]>(cacheKey)

    if (!leaderboard) {
      const sql = getDb()

      let query
      if (type === "college" && collegeId) {
        query = sql`
          SELECT u.name, u.cf_handle, u.cf_rating, u.cf_max_rating, u.problems_solved, c.name as college_name
          FROM users u
          JOIN colleges c ON u.college_id = c.id
          WHERE u.college_id = ${collegeId} AND u.cf_handle IS NOT NULL
          ORDER BY u.cf_rating DESC NULLS LAST
          LIMIT 100
        `
      } else if (type === "national") {
        query = sql`
          SELECT u.name, u.cf_handle, u.cf_rating, u.cf_max_rating, u.problems_solved, c.name as college_name
          FROM users u
          JOIN colleges c ON u.college_id = c.id
          WHERE u.cf_handle IS NOT NULL
          ORDER BY u.cf_rating DESC NULLS LAST
          LIMIT 100
        `
      } else {
        query = sql`
          SELECT u.name, u.cf_handle, u.cf_rating, u.cf_max_rating, u.problems_solved
          FROM users u
          WHERE u.cf_handle IS NOT NULL
          ORDER BY u.cf_rating DESC NULLS LAST
          LIMIT 100
        `
      }

      leaderboard = await query
      await cache.set(cacheKey, leaderboard, 300) // 5 minutes cache
    }

    return leaderboard
  }
}

export const realtimeCF = new RealtimeCodeforcesService()
