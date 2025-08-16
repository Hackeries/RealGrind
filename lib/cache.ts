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

class MemoryCache {
  private cache = new Map<string, { value: any; expires: number }>()

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  set<T>(key: string, value: T, ttlSeconds = 300): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

export const cache = new CacheManager()
export const memoryCache = new MemoryCache()

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}
