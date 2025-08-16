"use client"

import { useState, useEffect } from "react"
import { backgroundSync } from "@/lib/background-sync"

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  queueSize: number
  lastSync: number | null
  failedOperations: number
}

export function useBackgroundSync() {
  const [status, setStatus] = useState<SyncStatus>(backgroundSync.getStatus())

  useEffect(() => {
    const unsubscribe = backgroundSync.onStatusChange(setStatus)
    return unsubscribe
  }, [])

  const syncUserStats = (userId: string, cfHandle?: string) => {
    return backgroundSync.addOperation("user-stats-sync", { userId, cfHandle }, "high")
  }

  const syncContestData = (contestId?: string) => {
    return backgroundSync.addOperation("contest-data-sync", { contestId }, "medium")
  }

  const syncProblemRecommendations = (userId: string, rating?: number) => {
    return backgroundSync.addOperation("problem-recommendations-sync", { userId, rating }, "medium")
  }

  const syncLeaderboard = (type: string, collegeId?: string) => {
    return backgroundSync.addOperation("leaderboard-sync", { type, collegeId }, "low")
  }

  const syncCfVerification = (userId: string, cfHandle: string) => {
    return backgroundSync.addOperation("cf-verification-sync", { userId, cfHandle }, "high")
  }

  const retryFailed = () => {
    backgroundSync.retryFailedOperations()
  }

  const clearQueue = () => {
    backgroundSync.clearQueue()
  }

  return {
    status,
    syncUserStats,
    syncContestData,
    syncProblemRecommendations,
    syncLeaderboard,
    syncCfVerification,
    retryFailed,
    clearQueue,
  }
}
