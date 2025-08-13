"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Target, TrendingUp, Code, Star, Award, Clock, RefreshCw } from "lucide-react"

interface Activity {
  id: string
  type: "submission" | "contest" | "achievement" | "problem_solved"
  user_name: string
  user_avatar?: string
  title: string
  description: string
  timestamp: string
  metadata?: {
    rating?: number
    difficulty?: string
    contest_name?: string
    problem_name?: string
    verdict?: string
  }
}

export default function ActivityPage() {
  const { data: session } = useSession()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/activities")
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "submission":
        return <Code className="w-5 h-5 text-blue-600" />
      case "contest":
        return <Trophy className="w-5 h-5 text-yellow-600" />
      case "achievement":
        return <Award className="w-5 h-5 text-purple-600" />
      case "problem_solved":
        return <Target className="w-5 h-5 text-green-600" />
      default:
        return <Star className="w-5 h-5 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "submission":
        return "bg-blue-50 border-blue-200"
      case "contest":
        return "bg-yellow-50 border-yellow-200"
      case "achievement":
        return "bg-purple-50 border-purple-200"
      case "problem_solved":
        return "bg-green-50 border-green-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const filteredActivities = activities.filter((activity) => {
    if (activeTab === "all") return true
    return activity.type === activeTab
  })

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your activity feed.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Feed</h1>
              <p className="text-gray-600 mt-2">
                Stay updated with the latest activities from the competitive programming community
              </p>
            </div>
            <Button onClick={fetchActivities} disabled={loading} className="flex items-center space-x-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Activity Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>All</span>
              </TabsTrigger>
              <TabsTrigger value="submission" className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Submissions</span>
              </TabsTrigger>
              <TabsTrigger value="contest" className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>Contests</span>
              </TabsTrigger>
              <TabsTrigger value="achievement" className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Achievements</span>
              </TabsTrigger>
              <TabsTrigger value="problem_solved" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Problems</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredActivities.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Yet</h3>
                    <p className="text-gray-600">
                      Start solving problems and participating in contests to see activities here!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredActivities.map((activity) => (
                    <Card
                      key={activity.id}
                      className={`${getActivityColor(activity.type)} hover:shadow-md transition-shadow`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={activity.user_avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">{activity.user_name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-gray-900">{activity.user_name}</span>
                              <span className="text-gray-500">•</span>
                              <div className="flex items-center text-gray-500 text-sm">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(activity.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{activity.description}</p>

                            {activity.metadata && (
                              <div className="flex items-center space-x-2">
                                {activity.metadata.difficulty && (
                                  <Badge variant="outline" className="text-xs">
                                    {activity.metadata.difficulty}
                                  </Badge>
                                )}
                                {activity.metadata.rating && (
                                  <Badge variant="outline" className="text-xs">
                                    {activity.metadata.rating} rating
                                  </Badge>
                                )}
                                {activity.metadata.verdict && (
                                  <Badge
                                    variant={activity.metadata.verdict === "OK" ? "default" : "destructive"}
                                    className="text-xs"
                                  >
                                    {activity.metadata.verdict}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
