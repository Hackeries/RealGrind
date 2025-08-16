"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { memoryCache, debounce } from "@/lib/cache"

interface FetchOptions {
  cacheKey?: string
  cacheTTL?: number
  debounceMs?: number
  retryCount?: number
  retryDelay?: number
}

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastFetch: number | null
}

export function useOptimizedFetch<T>(url: string | null, options: FetchOptions = {}) {
  const { cacheKey, cacheTTL = 300, debounceMs = 300, retryCount = 3, retryDelay = 1000 } = options

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(
    async (fetchUrl: string) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Check cache first
      if (cacheKey) {
        const cached = memoryCache.get<T>(cacheKey)
        if (cached) {
          setState((prev) => ({ ...prev, data: cached, loading: false, error: null }))
          return
        }
      }

      abortControllerRef.current = new AbortController()
      setState((prev) => ({ ...prev, loading: true, error: null }))

      let lastError: Error | null = null

      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          const response = await fetch(fetchUrl, {
            signal: abortControllerRef.current.signal,
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()

          // Cache the result
          if (cacheKey) {
            memoryCache.set(cacheKey, data, cacheTTL)
          }

          setState({
            data,
            loading: false,
            error: null,
            lastFetch: Date.now(),
          })
          return
        } catch (error) {
          lastError = error as Error

          if (error instanceof Error && error.name === "AbortError") {
            return // Request was cancelled
          }

          if (attempt < retryCount) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
          }
        }
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: lastError?.message || "Failed to fetch data",
      }))
    },
    [cacheKey, cacheTTL, retryCount, retryDelay],
  )

  const debouncedFetch = useCallback(debounce(fetchData, debounceMs), [fetchData, debounceMs])

  useEffect(() => {
    if (url) {
      debouncedFetch(url)
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [url, debouncedFetch])

  const refetch = useCallback(() => {
    if (url) {
      fetchData(url)
    }
  }, [url, fetchData])

  const clearCache = useCallback(() => {
    if (cacheKey) {
      memoryCache.delete(cacheKey)
    }
  }, [cacheKey])

  return {
    ...state,
    refetch,
    clearCache,
  }
}
