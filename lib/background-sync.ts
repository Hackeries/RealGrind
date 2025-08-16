interface SyncOperation {
  id: string
  type: string
  data: any
  priority: "high" | "medium" | "low"
  retryCount: number
  maxRetries: number
  nextRetry: number
  createdAt: number
  lastError?: string
}

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  queueSize: number
  lastSync: number | null
  failedOperations: number
}

class BackgroundSyncManager {
  private queue: SyncOperation[] = []
  private isProcessing = false
  private status: SyncStatus = {
    isOnline: true,
    isSyncing: false,
    queueSize: 0,
    lastSync: null,
    failedOperations: 0,
  }
  private listeners: Array<(status: SyncStatus) => void> = []
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initializeNetworkListener()
    this.startPeriodicSync()
    this.loadQueueFromStorage()
  }

  addOperation(type: string, data: any, priority: "high" | "medium" | "low" = "medium"): string {
    const operation: SyncOperation = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      priority,
      retryCount: 0,
      maxRetries: 3,
      nextRetry: Date.now(),
      createdAt: Date.now(),
    }

    // Insert based on priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const insertIndex = this.queue.findIndex((op) => priorityOrder[op.priority] > priorityOrder[priority])

    if (insertIndex === -1) {
      this.queue.push(operation)
    } else {
      this.queue.splice(insertIndex, 0, operation)
    }

    this.updateStatus()
    this.saveQueueToStorage()
    this.processQueue()

    return operation.id
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || !this.status.isOnline || this.queue.length === 0) {
      return
    }

    this.isProcessing = true
    this.status.isSyncing = true
    this.notifyListeners()

    while (this.queue.length > 0 && this.status.isOnline) {
      const operation = this.queue[0]

      // Check if it's time to retry
      if (operation.nextRetry > Date.now()) {
        break
      }

      try {
        await this.executeOperation(operation)
        this.queue.shift() // Remove successful operation
        this.status.lastSync = Date.now()
      } catch (error) {
        operation.retryCount++
        operation.lastError = error instanceof Error ? error.message : "Unknown error"

        if (operation.retryCount >= operation.maxRetries) {
          // Move to failed operations
          this.queue.shift()
          this.status.failedOperations++
          console.error(`[v0] Background sync failed permanently for ${operation.type}:`, error)
        } else {
          // Schedule retry with exponential backoff
          const backoffMs = Math.min(1000 * Math.pow(2, operation.retryCount), 30000)
          operation.nextRetry = Date.now() + backoffMs
          console.warn(`[v0] Background sync failed for ${operation.type}, retrying in ${backoffMs}ms:`, error)
        }
      }

      this.updateStatus()
      this.saveQueueToStorage()
    }

    this.isProcessing = false
    this.status.isSyncing = false
    this.notifyListeners()
  }

  private async executeOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case "user-stats-sync":
        await this.syncUserStats(operation.data)
        break
      case "contest-data-sync":
        await this.syncContestData(operation.data)
        break
      case "problem-recommendations-sync":
        await this.syncProblemRecommendations(operation.data)
        break
      case "leaderboard-sync":
        await this.syncLeaderboard(operation.data)
        break
      case "cf-verification-sync":
        await this.syncCfVerification(operation.data)
        break
      default:
        throw new Error(`Unknown sync operation type: ${operation.type}`)
    }
  }

  private async syncUserStats(data: { userId: string; cfHandle?: string }): Promise<void> {
    const response = await fetch("/api/sync/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`User stats sync failed: ${response.statusText}`)
    }
  }

  private async syncContestData(data: { contestId?: string }): Promise<void> {
    const response = await fetch("/api/sync/contests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Contest data sync failed: ${response.statusText}`)
    }
  }

  private async syncProblemRecommendations(data: { userId: string; rating?: number }): Promise<void> {
    const response = await fetch("/api/problems/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Problem recommendations sync failed: ${response.statusText}`)
    }
  }

  private async syncLeaderboard(data: { type: string; collegeId?: string }): Promise<void> {
    const response = await fetch("/api/sync/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Leaderboard sync failed: ${response.statusText}`)
    }
  }

  private async syncCfVerification(data: { userId: string; cfHandle: string }): Promise<void> {
    const response = await fetch("/api/verify-cf/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`CF verification sync failed: ${response.statusText}`)
    }
  }

  private initializeNetworkListener(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.status.isOnline = true
        this.notifyListeners()
        this.processQueue()
      })

      window.addEventListener("offline", () => {
        this.status.isOnline = false
        this.notifyListeners()
      })

      this.status.isOnline = navigator.onLine
    }
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(
      () => {
        if (this.status.isOnline && !this.isProcessing) {
          // Add periodic sync operations
          this.addOperation("user-stats-sync", {}, "low")
          this.addOperation("contest-data-sync", {}, "low")
        }
      },
      5 * 60 * 1000,
    ) // Every 5 minutes
  }

  private saveQueueToStorage(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("bg-sync-queue", JSON.stringify(this.queue))
      } catch (error) {
        console.warn("[v0] Failed to save sync queue to storage:", error)
      }
    }
  }

  private loadQueueFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("bg-sync-queue")
        if (saved) {
          this.queue = JSON.parse(saved)
          this.updateStatus()
        }
      } catch (error) {
        console.warn("[v0] Failed to load sync queue from storage:", error)
      }
    }
  }

  private updateStatus(): void {
    this.status.queueSize = this.queue.length
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener({ ...this.status }))
  }

  // Public API
  getStatus(): SyncStatus {
    return { ...this.status }
  }

  onStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  retryFailedOperations(): void {
    this.status.failedOperations = 0
    this.processQueue()
  }

  clearQueue(): void {
    this.queue = []
    this.updateStatus()
    this.saveQueueToStorage()
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
}

export const backgroundSync = new BackgroundSyncManager()
