"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Medal, Award, TrendingUp, Clock, Target, RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { formatRating, getRankColor, getTimeAgo } from "@/lib/codeforces-api"

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  handle: string
  rating: number
  college?: {
    id: number
    name: string
    state: string
    city: string
    tier: string
  }
  problemsSolved: number
  recentActivity: {
    recentSubmissions: number
    recentSolved: number
    lastActive: number
  }
}

interface LeaderboardProps {
  type?: "college" | "state" | "national" | "friends"
  collegeId?: number
  state?: string
  userId?: string
  title?: string
}

const LeaderboardSkeleton = () => (
  <div className="flex items-center space-x-4 p-4 rounded-lg border animate-pulse">
    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <div className="text-right space-y-1">
      <Skeleton className="h-5 w-16 ml-auto" />
      <Skeleton className="h-3 w-20 ml-auto" />
    </div>
  </div>
)

export function Leaderboard({ type = "national", collegeId, state, userId, title }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentType, setCurrentType] = useState(type)
  const [retryCount, setRetryCount] = useState(0)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  })

  const fetchLeaderboard = async (loadMore = false, isRetry = false) => {
    try {
      if (!loadMore) setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        type: currentType,
        limit: pagination.limit.toString(),
        offset: loadMore ? (pagination.offset + pagination.limit).toString() : "0",
      })

      if (collegeId) params.append("collegeId", collegeId.toString())
      if (state) params.append("state", state)
      if (userId) params.append("userId", userId)

      const response = await fetch(`/api/leaderboard?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch leaderboard")
      }

      if (loadMore) {
        setLeaderboard((prev) => [...prev, ...data.leaderboard])
      } else {
        setLeaderboard(data.leaderboard)
      }

      setPagination(data.pagination)
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load leaderboard"
      setError(errorMessage)

      if (!isRetry && retryCount < 2 && errorMessage.includes("fetch")) {
        setTimeout(
          () => {
            setRetryCount((prev) => prev + 1)
            fetchLeaderboard(loadMore, true)
          },
          1000 * (retryCount + 1),
        )
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [currentType, collegeId, state, userId])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />
    return (
      <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>
    )
  }

  const getTierColor = (tier: string) => {
    const colors = {
      T1: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      T2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      T3: "bg-green-500/10 text-green-400 border-green-500/20",
      OTHER: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    }
    return colors[tier as keyof typeof colors] || colors.OTHER
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              {title || `${currentType.charAt(0).toUpperCase() + currentType.slice(1)} Leaderboard`}
              {!loading && !error && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Wifi className="w-3 h-3" />
                  <span>Live</span>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Top competitive programmers ranked by rating
              {pagination.total > 0 && ` (${pagination.total} total)`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchLeaderboard()}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {!collegeId && !state && !userId && (
              <Select value={currentType} onValueChange={(value: any) => setCurrentType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national">National</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && leaderboard.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <LeaderboardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Leaderboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              {retryCount > 0 && <p className="text-sm text-gray-500 mb-4">Retrying... (Attempt {retryCount + 1}/3)</p>}
              <div className="flex justify-center gap-2">
                <Button onClick={() => fetchLeaderboard()} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Try Again
                </Button>
                {error.includes("network") && (
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                )}
              </div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Rankings Available</h3>
              <p className="text-gray-600 mb-4">
                {currentType === "friends"
                  ? "Add friends to see their rankings here"
                  : `No ${currentType} rankings found. Check back later!`}
              </p>
              <Button variant="outline" onClick={() => fetchLeaderboard()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <>
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>

                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`https://userpic.codeforces.org/no-title/${entry.handle}`} />
                    <AvatarFallback>{entry.name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{entry.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {entry.handle}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {entry.college && (
                        <div className="flex items-center gap-1">
                          <Badge className={`text-xs ${getTierColor(entry.college.tier)}`}>{entry.college.tier}</Badge>
                          <span className="truncate max-w-48">{entry.college.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>{entry.problemsSolved} solved</span>
                      </div>
                      {entry.recentActivity.lastActive > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{getTimeAgo(Math.floor(entry.recentActivity.lastActive / 1000))}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold text-lg ${getRankColor("expert")}`}>{formatRating(entry.rating)}</div>
                    {entry.recentActivity.recentSolved > 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{entry.recentActivity.recentSolved} this week</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {pagination.hasMore && (
                <div className="text-center pt-4">
                  <Button onClick={() => fetchLeaderboard(true)} disabled={loading} variant="outline">
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load More (${pagination.total - leaderboard.length} remaining)`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
