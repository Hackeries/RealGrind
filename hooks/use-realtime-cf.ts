"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

interface RealtimeCFData {
  user: any
  stats: any
  submissions: any[]
  recommendations: any[]
  loading: boolean
  error: string | null
  lastUpdated: number
}

export function useRealtimeCF(handle: string | null) {
  const { data: session } = useSession()
  const [data, setData] = useState<RealtimeCFData>({
    user: null,
    stats: null,
    submissions: [],
    recommendations: [],
    loading: true,
    error: null,
    lastUpdated: 0,
  })

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (!handle || !session) return

      if (showLoading) {
        setData((prev) => ({ ...prev, loading: true, error: null }))
      }

      try {
        const response = await fetch(`/api/cf/data?handle=${handle}`)
        if (!response.ok) throw new Error("Failed to fetch CF data")

        const result = await response.json()
        setData({
          user: result.user,
          stats: result.stats,
          submissions: result.submissions || [],
          recommendations: result.recommendations || [],
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        })
      } catch (error) {
        setData((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }))
      }
    },
    [handle, session],
  )

  const startBackgroundSync = useCallback(async () => {
    if (!handle || !session) return

    try {
      await fetch("/api/cf/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, action: "start" }),
      })
    } catch (error) {
      console.error("Failed to start background sync:", error)
    }
  }, [handle, session])

  const invalidateCache = useCallback(async () => {
    if (!handle || !session) return

    try {
      await fetch("/api/cf/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, action: "invalidate" }),
      })
      await fetchData()
    } catch (error) {
      console.error("Failed to invalidate cache:", error)
    }
  }, [handle, session, fetchData])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Start background sync
  useEffect(() => {
    if (handle && session) {
      startBackgroundSync()
    }
  }, [handle, session, startBackgroundSync])

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!handle || !session) return

    const interval = setInterval(() => {
      fetchData(false) // Silent refresh
    }, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [handle, session, fetchData])

  return {
    ...data,
    refresh: () => fetchData(true),
    invalidateCache,
  }
}
