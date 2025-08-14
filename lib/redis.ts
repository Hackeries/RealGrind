import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface CacheOptions {
  ttl?: number // Time to live in seconds
}

export class CacheManager {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      return data as T
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error)
      return null
    }
  }

  static async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      if (options.ttl) {
        await redis.setex(key, options.ttl, JSON.stringify(value))
      } else {
        await redis.set(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error)
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error)
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error)
      return false
    }
  }

  // Recommendation-specific cache keys
  static getRecommendationKey(userId: string): string {
    const today = new Date().toISOString().split("T")[0]
    return `recos:${userId}:${today}`
  }

  static getUserStatsKey(handle: string): string {
    return `user_stats:${handle}`
  }

  static getProblemsKey(): string {
    return "cf_problems:latest"
  }

  static getUserSolvedKey(handle: string): string {
    return `solved:${handle}`
  }
}

export { redis }
