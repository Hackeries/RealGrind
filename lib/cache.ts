import { createClient } from "redis"

class CacheManager {
  private client: any
  private connected = false

  constructor() {
    if (process.env.REDIS_URL) {
      this.client = createClient({
        url: process.env.REDIS_URL,
      })

      this.client.on("error", (err: any) => {
        console.error("Redis Client Error:", err)
        this.connected = false
      })

      this.client.on("connect", () => {
        console.log("Redis Client Connected")
        this.connected = true
      })
    }
  }

  async connect() {
    if (this.client && !this.connected) {
      try {
        await this.client.connect()
      } catch (error) {
        console.error("Failed to connect to Redis:", error)
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.connected) return null

    try {
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    if (!this.client || !this.connected) return

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      console.error("Cache set error:", error)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.connected) return

    try {
      await this.client.del(key)
    } catch (error) {
      console.error("Cache delete error:", error)
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.client || !this.connected) return

    try {
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(keys)
      }
    } catch (error) {
      console.error("Cache invalidate error:", error)
    }
  }
}

export const cache = new CacheManager()
