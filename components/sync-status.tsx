"use client"

import { useBackgroundSync } from "@/hooks/use-background-sync"
import { WifiOff, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"

export function SyncStatus() {
  const { status, retryFailed } = useBackgroundSync()

  if (!status.isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
        <WifiOff className="h-4 w-4" />
        <span>Offline</span>
      </div>
    )
  }

  if (status.isSyncing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Syncing...</span>
      </div>
    )
  }

  if (status.failedOperations > 0) {
    return (
      <button
        onClick={retryFailed}
        className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm hover:bg-yellow-100 transition-colors"
      >
        <AlertCircle className="h-4 w-4" />
        <span>{status.failedOperations} failed</span>
      </button>
    )
  }

  if (status.queueSize > 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm">
        <RefreshCw className="h-4 w-4" />
        <span>{status.queueSize} queued</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
      <CheckCircle className="h-4 w-4" />
      <span>Synced</span>
    </div>
  )
}
