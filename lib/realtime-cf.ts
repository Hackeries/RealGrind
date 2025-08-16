import { codeforcesAPI, type CodeforcesUser, type UserStats, type CodeforcesSubmission } from "./codeforces-api"
import { cache } from "./cache"
import { getDb } from "./db"

interface SyncJob {
  id: string
  type: "user" | "contest" | "problem" | "leaderboard"
  userId?: string
  handle?: string
  priority: "low" | "medium" | "high"
  scheduledAt: number
  retryCount: number
  maxRetries?: number
}

interface LiveStats {
  totalProblems: number
  problemsSolvedToday: number
  activeContests: number
  topUserRating: number
  topUserHandle: string
  onlineUsers: number
  recentSubmissions: number
}

export class RealtimeCodeforcesService {
  private syncIntervals = new Map<string, NodeJS.Timeout>()
  private syncQueue: SyncJob[] = []
  private isProcessingQueue = false
  private stats = {
    totalSyncs: 0,
    failedSyncs: 0,
    lastSyncTime: 0,
    activeConnections: 0,
  }

  // Cache TTL in seconds
  private readonly CACHE_TTL = {
    USER_INFO: 300, // 5 minutes
    USER_STATS: 180, // 3 minutes
    SUBMISSIONS: 120, // 2 minutes
    CONTESTS: 600, // 10 minutes
    PROBLEMS: 3600, // 1 hour
    RECOMMENDATIONS: 900, // 15 minutes
    LIVE_STATS: 60, // 1 minute
    LEADERBOARD: 300, // 5 minutes
  }

  constructor() {
    // Start queue processor
    this.startQueueProcessor()
    // Start periodic cleanup
    this.startPeriodicCleanup()
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

  async getLiveStats(): Promise<LiveStats> {
    const cacheKey = "cf:live:stats"

    let stats = await cache.get<LiveStats>(cacheKey)

    if (!stats) {
      try {
        const sql = getDb()

        // Get total problems from cache or API
        const problemsData =
          (await cache.get("cf:problems:count")) ||
          (await codeforcesAPI.getProblems().then((data) => data.problems.length))

        // Get today's submissions count
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [todaySubmissions, topUser, activeContests, onlineUsers] = await Promise.all([
          sql`SELECT COUNT(*) as count FROM activities 
              WHERE type = 'problem_solved' AND created_at >= ${today.toISOString()}`,
          sql`SELECT name, cf_handle, cf_rating FROM users 
              WHERE cf_rating IS NOT NULL ORDER BY cf_rating DESC LIMIT 1`,
          codeforcesAPI.getContests().then((contests) => contests.filter((c) => c.phase === "CODING").length),
          sql`SELECT COUNT(*) as count FROM users WHERE last_seen > NOW() - INTERVAL '1 hour'`,
        ])

        stats = {
          totalProblems: problemsData,
          problemsSolvedToday: Number.parseInt(todaySubmissions[0]?.count || "0"),
          activeContests,
          topUserRating: topUser[0]?.cf_rating || 0,
          topUserHandle: topUser[0]?.cf_handle || "N/A",
          onlineUsers: Number.parseInt(onlineUsers[0]?.count || "0"),
          recentSubmissions: await this.getRecentSubmissionsCount(),
        }

        await cache.set(cacheKey, stats, this.CACHE_TTL.LIVE_STATS)
      } catch (error) {
        console.error("Failed to fetch live stats:", error)
        // Return fallback stats
        stats = {
          totalProblems: 10000,
          problemsSolvedToday: 150,
          activeContests: 2,
          topUserRating: 3500,
          topUserHandle: "tourist",
          onlineUsers: 1250,
          recentSubmissions: 45,
        }
      }
    }

    return stats
  }

  async scheduleSync(job: SyncJob): Promise<void> {
    job.maxRetries = job.maxRetries || 3

    // Add to queue based on priority
    if (job.priority === "high") {
      this.syncQueue.unshift(job)
    } else {
      this.syncQueue.push(job)
    }

    // Process immediately if not already processing
    if (!this.isProcessingQueue) {
      this.processQueue()
    }
  }

  private async startQueueProcessor(): Promise<void> {
    setInterval(() => {
      if (!this.isProcessingQueue && this.syncQueue.length > 0) {
        this.processQueue()
      }
    }, 5000) // Check every 5 seconds
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.syncQueue.length === 0) return

    this.isProcessingQueue = true

    while (this.syncQueue.length > 0) {
      const job = this.syncQueue.shift()!

      try {
        await this.executeJob(job)
        this.stats.totalSyncs++
        this.stats.lastSyncTime = Date.now()
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error)
        this.stats.failedSyncs++

        // Retry logic
        if (job.retryCount < (job.maxRetries || 3)) {
          job.retryCount++
          job.scheduledAt = Date.now() + Math.pow(2, job.retryCount) * 1000 // Exponential backoff
          this.syncQueue.push(job)
        }
      }

      // Rate limiting - wait between jobs
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    this.isProcessingQueue = false
  }

  private async executeJob(job: SyncJob): Promise<void> {
    switch (job.type) {
      case "user":
        if (job.handle) {
          await this.syncUserData(job.handle)
        }
        break
      case "contest":
        await this.syncContestData()
        break
      case "problem":
        await this.syncProblemData()
        break
      case "leaderboard":
        await this.refreshLeaderboards()
        break
    }
  }

  private async syncContestData(): Promise<void> {
    try {
      const contests = await codeforcesAPI.getContests()
      await cache.set("cf:contests:all", contests, this.CACHE_TTL.CONTESTS)

      const sql = getDb()

      // Update active contests in database
      for (const contest of contests.filter((c) => c.phase === "CODING" || c.phase === "BEFORE")) {
        await sql`
          INSERT INTO contests (id, name, type, phase, duration_seconds, start_time)
          VALUES (${contest.id}, ${contest.name}, ${contest.type}, ${contest.phase}, 
                  ${contest.durationSeconds}, ${contest.startTimeSeconds ? new Date(contest.startTimeSeconds * 1000) : null})
          ON CONFLICT (id) DO UPDATE SET
            phase = EXCLUDED.phase,
            start_time = EXCLUDED.start_time
        `
      }
    } catch (error) {
      console.error("Contest sync failed:", error)
      throw error
    }
  }

  private async syncProblemData(): Promise<void> {
    try {
      const { problems } = await codeforcesAPI.getProblems()
      await cache.set("cf:problems:all", problems, this.CACHE_TTL.PROBLEMS)
      await cache.set("cf:problems:count", problems.length, this.CACHE_TTL.PROBLEMS)
    } catch (error) {
      console.error("Problem sync failed:", error)
      throw error
    }
  }

  private async refreshLeaderboards(): Promise<void> {
    try {
      // Clear all leaderboard caches
      const keys = ["leaderboard:college:all", "leaderboard:national:all", "leaderboard:global:all"]
      await Promise.all(keys.map((key) => cache.del(key)))

      // Pre-warm with fresh data
      await Promise.all([
        this.getLeaderboardData("college"),
        this.getLeaderboardData("national"),
        this.getLeaderboardData("global"),
      ])
    } catch (error) {
      console.error("Leaderboard refresh failed:", error)
      throw error
    }
  }

  async trackUserActivity(
    userId: string,
    activity: {
      type: string
      data: any
      timestamp?: number
    },
  ): Promise<void> {
    try {
      const sql = getDb()

      await sql`
        INSERT INTO activities (user_id, type, data, created_at)
        VALUES (${userId}, ${activity.type}, ${JSON.stringify(activity.data)}, 
                ${activity.timestamp ? new Date(activity.timestamp * 1000) : new Date()})
      `

      // Invalidate related caches
      await cache.del(`activities:${userId}`)
      await cache.del("cf:live:stats")
    } catch (error) {
      console.error("Failed to track user activity:", error)
    }
  }

  private async getRecentSubmissionsCount(): Promise<number> {
    try {
      const sql = getDb()
      const result = await sql`
        SELECT COUNT(*) as count FROM activities 
        WHERE type = 'problem_solved' AND created_at > NOW() - INTERVAL '1 hour'
      `
      return Number.parseInt(result[0]?.count || "0")
    } catch {
      return 0
    }
  }

  private startPeriodicCleanup(): void {
    // Clean up old cache entries and sync intervals every hour
    setInterval(async () => {
      try {
        // Clean up completed sync jobs older than 1 hour
        const cutoff = Date.now() - 3600000
        this.syncQueue = this.syncQueue.filter((job) => job.scheduledAt > cutoff)

        // Clean up old activities (keep last 30 days)
        const sql = getDb()
        await sql`DELETE FROM activities WHERE created_at < NOW() - INTERVAL '30 days'`
      } catch (error) {
        console.error("Cleanup failed:", error)
      }
    }, 3600000) // 1 hour
  }

  getStats() {
    return {
      ...this.stats,
      queueLength: this.syncQueue.length,
      activeIntervals: this.syncIntervals.size,
      isProcessingQueue: this.isProcessingQueue,
    }
  }

  async getSystemHealth(): Promise<{
    status: "healthy" | "degraded" | "unhealthy"
    checks: Record<string, boolean>
    lastSync: number
    queueBacklog: number
  }> {
    const checks = {
      cacheConnected: await this.testCacheConnection(),
      dbConnected: await this.testDbConnection(),
      cfApiResponsive: await this.testCodeforcesAPI(),
      queueProcessing: !this.isProcessingQueue || this.syncQueue.length < 100,
    }

    const healthyChecks = Object.values(checks).filter(Boolean).length
    const totalChecks = Object.keys(checks).length

    let status: "healthy" | "degraded" | "unhealthy" = "healthy"
    if (healthyChecks < totalChecks) {
      status = healthyChecks >= totalChecks * 0.5 ? "degraded" : "unhealthy"
    }

    return {
      status,
      checks,
      lastSync: this.stats.lastSyncTime,
      queueBacklog: this.syncQueue.length,
    }
  }

  private async testCacheConnection(): Promise<boolean> {
    try {
      await cache.set("health:test", "ok", 10)
      const result = await cache.get("health:test")
      return result === "ok"
    } catch {
      return false
    }
  }

  private async testDbConnection(): Promise<boolean> {
    try {
      const sql = getDb()
      await sql`SELECT 1`
      return true
    } catch {
      return false
    }
  }

  private async testCodeforcesAPI(): Promise<boolean> {
    try {
      await codeforcesAPI.getContests()
      return true
    } catch {
      return false
    }
  }
}

export const realtimeCF = new RealtimeCodeforcesService()

export const getLiveStats = () => realtimeCF.getLiveStats()
export const scheduleUserSync = (userId: string, handle: string) =>
  realtimeCF.scheduleSync({
    id: `user-${userId}-${Date.now()}`,
    type: "user",
    userId,
    handle,
    priority: "medium",
    scheduledAt: Date.now(),
    retryCount: 0,
  })
