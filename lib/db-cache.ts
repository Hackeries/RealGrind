import { memoryCache } from "./cache"

interface QueryOptions {
  ttl?: number
  useCache?: boolean
  cacheKey?: string
}

export class DatabaseCache {
  static async query<T>(queryFn: () => Promise<T>, options: QueryOptions = {}): Promise<T> {
    const { ttl = 300, useCache = true, cacheKey } = options

    if (!useCache || !cacheKey) {
      return await queryFn()
    }

    // Try to get from cache first
    const cached = memoryCache.get<T>(cacheKey)
    if (cached) {
      return cached
    }

    // Execute query and cache result
    const result = await queryFn()
    memoryCache.set(cacheKey, result, ttl)

    return result
  }

  static invalidate(pattern: string): void {
    // Simple pattern matching for cache invalidation
    memoryCache.clear() // For now, clear all - could be more sophisticated
  }
}

// Batch query utility to reduce database round trips
export class BatchQuery {
  private queries: Array<() => Promise<any>> = []
  private results: any[] = []

  add<T>(queryFn: () => Promise<T>): BatchQuery {
    this.queries.push(queryFn)
    return this
  }

  async execute(): Promise<any[]> {
    this.results = await Promise.all(this.queries.map((query) => query()))
    return this.results
  }

  getResult<T>(index: number): T {
    return this.results[index]
  }
}
