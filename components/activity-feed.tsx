"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Activity, Trophy, Target, TrendingUp, Award, Code, RefreshCw, AlertCircle } from "lucide-react"
import { useRealtimeActivities } from "@/hooks/use-realtime-firestore"
import { useAuth } from "@/components/providers"

interface ActivityFeedProps {
  type?: "personal" | "global"
  limit?: number
}

const ActivitySkeleton = () => (
  <div className="flex items-start space-x-3 p-3 rounded-lg border bg-gray-50">
    <Skeleton className="w-6 h-6 rounded-full flex-shrink-0 mt-1" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center space-x-2">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
)

export function ActivityFeed({ type = "global", limit = 20 }: ActivityFeedProps) {
  const { userDoc } = useAuth()

  const {
    data: activities,
    loading,
    error,
    refetch,
  } = useRealtimeActivities(type === "personal" ? userDoc?.id : undefined)

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "problem_solved":
        return <Target className="w-4 h-4 text-green-600" />
      case "contest_participated":
        return <Trophy className="w-4 h-4 text-blue-600" />
      case "rating_change":
        return <TrendingUp className="w-4 h-4 text-purple-600" />
      case "contest_created":
        return <Award className="w-4 h-4 text-orange-600" />
      case "profile_sync":
        return <Code className="w-4 h-4 text-gray-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case "problem_solved":
        return "bg-green-50 border-green-200"
      case "contest_participated":
        return "bg-blue-50 border-blue-200"
      case "rating_change":
        return "bg-purple-50 border-purple-200"
      case "contest_created":
        return "bg-orange-50 border-orange-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>{type === "personal" ? "Your Activity" : "Recent Activity"}</span>
            {!loading && !error && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            )}
          </CardTitle>
          {refetch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
              <ActivitySkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Failed to Load Activities</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            {refetch && (
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Recent Activity</h3>
            <p className="text-gray-600 mb-2">
              {type === "personal"
                ? "Start solving problems to see your activity here!"
                : "Activities will appear here as users solve problems and participate in contests."}
            </p>
            <p className="text-sm text-gray-500">
              {type === "personal"
                ? "Your submissions and contest participations will be tracked automatically."
                : "Check back soon for the latest community updates."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, limit).map((activity: any) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors hover:shadow-sm ${getActivityColor(activity.type)}`}
              >
                <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{activity.userName?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{activity.userName}</span>
                    {activity.codeforcesHandle && (
                      <Badge variant="outline" className="text-xs">
                        @{activity.codeforcesHandle}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                  {activity.description && <p className="text-sm text-gray-600">{activity.description}</p>}
                  <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.createdAt.toDate())}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
