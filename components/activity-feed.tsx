"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Activity, Trophy, Target, TrendingUp, Award, Code } from "lucide-react"
import { useRealtimeActivities } from "@/hooks/use-realtime-firestore"
import { useAuth } from "@/components/providers"

interface ActivityFeedProps {
  type?: "personal" | "global"
  limit?: number
}

export function ActivityFeed({ type = "global", limit = 20 }: ActivityFeedProps) {
  const { userDoc } = useAuth()

  const { data: activities, loading, error } = useRealtimeActivities(type === "personal" ? userDoc?.id : undefined)

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

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading activities...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Error loading activities: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>{type === "personal" ? "Your Activity" : "Recent Activity"}</span>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent activity</p>
            <p className="text-sm text-gray-500">
              Activities will appear here as users solve problems and participate in contests.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, limit).map((activity: any) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
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
