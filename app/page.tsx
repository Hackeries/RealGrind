"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Target,
  TrendingUp,
  Code,
  Activity,
  RefreshCw,
  AlertCircle,
  Calendar,
  Users,
  Lightbulb,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface UserStats {
  user: {
    name: string
    codeforcesHandle: string | null
    currentRating: number
    maxRating: number
    problemsSolved: number
    contestsParticipated: number
    college: string | null
    graduationYear: number | null
  }
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
  }>
  recommendations: Array<{
    problem_id: string
    problem_name: string
    rating: number
    tags: string[]
  }>
  upcomingContest: {
    name: string
    start_time: string
    duration: number
  } | null
  leaderboardPreview: Array<{
    rank: number
    name: string
    rating: number
    problems_solved: number
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchStats()
    }
  }, [status, router])

  const fetchStats = async () => {
    try {
      setError(null)
      const response = await fetch("/api/user/stats")
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`)
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load dashboard data"
      setError(errorMessage)
      toast({
        title: "Error loading dashboard",
        description: "We couldn't load your stats. Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    if (!stats?.user.codeforcesHandle) return

    setSyncing(true)
    try {
      const response = await fetch("/api/sync/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeforcesHandle: stats.user.codeforcesHandle }),
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`)
      }

      toast({
        title: "Sync successful",
        description: "Your Codeforces data has been updated.",
      })

      await fetchStats()
    } catch (error) {
      console.error("Sync failed:", error)
      toast({
        title: "Sync failed",
        description: "We couldn't sync your Codeforces data. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating < 1200) return "text-gray-400"
    if (rating < 1400) return "text-green-400"
    if (rating < 1600) return "text-cyan-400"
    if (rating < 1900) return "text-blue-400"
    if (rating < 2100) return "text-purple-400"
    if (rating < 2300) return "text-yellow-400"
    if (rating < 2400) return "text-orange-400"
    return "text-red-400"
  }

  const getRatingTitle = (rating: number) => {
    if (rating < 1200) return "Newbie"
    if (rating < 1400) return "Pupil"
    if (rating < 1600) return "Specialist"
    if (rating < 1900) return "Expert"
    if (rating < 2100) return "Candidate Master"
    if (rating < 2300) return "Master"
    if (rating < 2400) return "International Master"
    return "Grandmaster"
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-800/50 border-red-500/50">
              <CardHeader className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <CardTitle className="text-white">Unable to Load Dashboard</CardTitle>
                <CardDescription className="text-gray-300">
                  We're having trouble loading your data. This might be a temporary issue.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Button onClick={fetchStats} className="bg-gradient-to-r from-purple-600 to-cyan-600">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <p className="text-sm text-gray-400">
                  If the problem persists, please check your internet connection or try again later.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // If no Codeforces linked, prompt user to go to /onboarding
  if (!stats?.user.codeforcesHandle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-gray-800/50 border-purple-500/50">
              <CardHeader className="pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Welcome to RealGrind!</CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Connect your Codeforces account to start tracking your competitive programming journey.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Link href="/onboarding">
                  <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-cyan-600">
                    Complete Setup
                  </Button>
                </Link>
                <p className="text-sm text-gray-400">
                  We'll sync your submissions, ratings, and contest history automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                RealGrind
              </h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-purple-400 font-medium">
                Dashboard
              </Link>
              <Link href="/problems" className="text-gray-300 hover:text-purple-400">
                Problems
              </Link>
              <Link href="/contests" className="text-gray-300 hover:text-purple-400">
                Contests
              </Link>
              <Link href="/leaderboard" className="text-gray-300 hover:text-purple-400">
                Leaderboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Syncing..." : "Sync"}</span>
            </Button>
            <Avatar>
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-gray-700 text-white">{session?.user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Personalized Welcome Message */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Hey {session?.user?.name?.split(" ")[0]}, ready to climb the ranks?
          </h2>
          <p className="text-xl text-gray-300">Track your progress and compete with peers from your college</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Codeforces Rating */}
          <Card className="bg-gray-800/50 border-purple-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Current Codeforces Rating</p>
                  <p className={`text-3xl font-bold ${getRatingColor(stats.user.currentRating)}`}>
                    {stats.user.currentRating}
                  </p>
                  <p className="text-sm text-gray-400">{getRatingTitle(stats.user.currentRating)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          {/* Total Problems Solved */}
          <Card className="bg-gray-800/50 border-green-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Problems Solved</p>
                  <p className="text-3xl font-bold text-green-400">{stats.user.problemsSolved}</p>
                  <p className="text-sm text-gray-400">Keep grinding!</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          {/* Next Upcoming Contest */}
          <Card className="bg-gray-800/50 border-cyan-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Next Upcoming Contest</p>
                  {stats.upcomingContest ? (
                    <>
                      <p className="text-lg font-bold text-cyan-400 truncate">{stats.upcomingContest.name}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(stats.upcomingContest.start_time).toLocaleDateString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-cyan-400">No upcoming contests</p>
                      <p className="text-sm text-gray-400">Check back later</p>
                    </>
                  )}
                </div>
                <Calendar className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Smart Recommendations */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span>Smart Recommendations</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Personalized problems based on your skill level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recommendations && stats.recommendations.length > 0 ? (
                stats.recommendations.slice(0, 5).map((problem, index) => (
                  <div
                    key={problem.problem_id}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-white truncate">{problem.problem_name}</h4>
                      <p className="text-sm text-gray-400">{problem.problem_id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`${getRatingColor(problem.rating)} border-current`}>
                        {problem.rating}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No recommendations yet</p>
                  <p className="text-sm text-gray-500">Solve more problems to get personalized suggestions</p>
                </div>
              )}
              <Link href="/api/problems/recommendations">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  View All Recommendations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Activity className="w-5 h-5 text-blue-400" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription className="text-gray-400">Your latest competitive programming activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.description}</p>
                      <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No recent activity</p>
                  <p className="text-sm text-gray-500">Start solving problems to see your activity here</p>
                </div>
              )}
              <Link href="/api/activities">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  View All Activity
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Leaderboard Preview */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Trophy className="w-5 h-5 text-orange-400" />
                <span>Global Leaderboards</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                See how you rank against other competitive programmers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.leaderboardPreview && stats.leaderboardPreview.length > 0 ? (
                stats.leaderboardPreview.slice(0, 5).map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{user.rank}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.problems_solved} problems</p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${getRatingColor(user.rating)}`}>{user.rating}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No leaderboard data</p>
                  <p className="text-sm text-gray-500">Check back later for rankings</p>
                </div>
              )}
              <Link href="/api/leaderboard">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  View Full Leaderboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
