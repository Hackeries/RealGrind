"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Activity, Trophy, Target, TrendingUp, Award, RefreshCw, Code } from "lucide-react"

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string | null
  metadata: any
  created_at: string
  user_name: string
  avatar_url: string | null
  codeforces_handle: string | null
  college: string | null
}

interface ActivityFeedProps {
  type?: "personal" | "global"
  limit?: number
  refreshInterval?: number
}

export function ActivityFeed({ type = "global", limit = 20, refreshInterval = 60000 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchActivities()

    // Set up auto-refresh for global feed
    if (type === "global") {
      const interval = setInterval(fetchActivities, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [type, limit, refreshInterval])

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/activities?type=${type}&limit=${limit}`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchActivities()
  }

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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
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
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading activities...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>{type === "personal" ? "Your Activity" : "Recent Activity"}</span>
          </CardTitle>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm" className="bg-transparent">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
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
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
              >
                <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={activity.avatar_url || ""} />
                      <AvatarFallback className="text-xs">{activity.user_name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{activity.user_name}</span>
                    {activity.codeforces_handle && (
                      <Badge variant="outline" className="text-xs">
                        @{activity.codeforces_handle}
                      </Badge>
                    )}
                    {activity.college && type === "global" && (
                      <Badge variant="outline" className="text-xs">
                        {activity.college}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                  {activity.description && <p className="text-sm text-gray-600">{activity.description}</p>}
                  <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
