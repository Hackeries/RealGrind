"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Target,
  TrendingUp,
  Code,
  Award,
  Activity,
  Settings,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserStats {
  user: {
    codeforcesHandle: string | null
    currentRating: number
    maxRating: number
    problemsSolved: number
    contestsParticipated: number
    college: string | null
    graduationYear: number | null
  }
  difficultyStats: Array<{
    difficulty: string
    solved_count: number
  }>
  tagStats: Array<{
    tag: string
    solved_count: number
  }>
  recentSubmissions: Array<{
    problem_id: string
    problem_name: string
    rating: number | null
    verdict: string
    programming_language: string
    submitted_at: string
  }>
  ratingHistory: Array<{
    contest_id: string
    old_rating: number
    new_rating: number
    rank: number
    participated_at: string
  }>
}

const DIFFICULTY_COLORS = {
  Unrated: "#6b7280",
  Beginner: "#10b981",
  Pupil: "#3b82f6",
  Specialist: "#8b5cf6",
  Expert: "#f59e0b",
  "Candidate Master": "#ef4444",
  "Master+": "#dc2626",
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
    if (rating < 1200) return "text-gray-600"
    if (rating < 1400) return "text-green-600"
    if (rating < 1600) return "text-cyan-600"
    if (rating < 1900) return "text-blue-600"
    if (rating < 2100) return "text-purple-600"
    if (rating < 2300) return "text-yellow-600"
    if (rating < 2400) return "text-orange-600"
    return "text-red-600"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle>Unable to Load Dashboard</CardTitle>
                <CardDescription>
                  We're having trouble loading your data. This might be a temporary issue.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Button onClick={fetchStats} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <p className="text-sm text-gray-500">
                  If the problem persists, please check your internet connection or try again later.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!stats?.user.codeforcesHandle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Welcome to RealGrind!</CardTitle>
                <CardDescription className="text-lg">
                  Connect your Codeforces account to start tracking your competitive programming journey.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Link href="/profile/setup">
                  <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Connect Codeforces Account
                  </Button>
                </Link>
                <p className="text-sm text-gray-500">
                  We'll sync your submissions, ratings, and contest history automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const ratingChartData =
    stats.ratingHistory.length > 0
      ? stats.ratingHistory.map((entry, index) => ({
          contest: index + 1,
          rating: entry.new_rating,
          date: new Date(entry.participated_at).toLocaleDateString(),
        }))
      : [{ contest: 1, rating: stats.user.currentRating, date: "Today" }]

  const difficultyChartData =
    stats.difficultyStats.length > 0
      ? stats.difficultyStats.map((stat) => ({
          name: stat.difficulty,
          value: stat.solved_count,
          color: DIFFICULTY_COLORS[stat.difficulty as keyof typeof DIFFICULTY_COLORS] || "#6b7280",
        }))
      : [{ name: "No data", value: 1, color: "#6b7280" }]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RealGrind
              </h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/problems" className="text-gray-600 hover:text-blue-600">
                Problems
              </Link>
              <Link href="/contests" className="text-gray-600 hover:text-blue-600">
                Contests
              </Link>
              <Link href="/leaderboard" className="text-gray-600 hover:text-blue-600">
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
              className="flex items-center space-x-2 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Syncing..." : "Sync"}</span>
            </Button>
            <Avatar>
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex items-center space-x-6 mb-4 md:mb-0">
                  <Avatar className="w-20 h-20 border-4 border-white/20">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="text-2xl bg-white/20">{session?.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{session?.user?.name}</h2>
                    <div className="flex items-center space-x-4 text-white/90">
                      <span className="flex items-center space-x-1">
                        <ExternalLink className="w-4 h-4" />
                        <span>{stats.user.codeforcesHandle}</span>
                      </span>
                      {stats.user.college && (
                        <span className="flex items-center space-x-1">
                          <Award className="w-4 h-4" />
                          <span>{stats.user.college}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getRatingColor(stats.user.currentRating)}`}>
                    {stats.user.currentRating}
                  </div>
                  <div className="text-white/90">{getRatingTitle(stats.user.currentRating)}</div>
                  <div className="text-sm text-white/70">Max: {stats.user.maxRating}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Problems Solved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.user.problemsSolved}</p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contests</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.user.contestsParticipated}</p>
                </div>
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Rating</p>
                  <p className={`text-3xl font-bold ${getRatingColor(stats.user.currentRating)}`}>
                    {stats.user.currentRating}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Max Rating</p>
                  <p className={`text-3xl font-bold ${getRatingColor(stats.user.maxRating)}`}>{stats.user.maxRating}</p>
                </div>
                <Award className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Rating Progress</span>
                </CardTitle>
                <CardDescription>Your rating changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.ratingHistory.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-center">
                    <div>
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No contest history yet</p>
                      <p className="text-sm text-gray-500">Participate in contests to see your rating progress</p>
                    </div>
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      rating: {
                        label: "Rating",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ratingChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="contest" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="rating"
                          stroke="var(--color-rating)"
                          strokeWidth={2}
                          dot={{ fill: "var(--color-rating)" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="problems" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Problems by Difficulty</CardTitle>
                  <CardDescription>Distribution of solved problems</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.difficultyStats.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-center">
                      <div>
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">No problems solved yet</p>
                        <p className="text-sm text-gray-500">Start solving problems to see your progress</p>
                      </div>
                    </div>
                  ) : (
                    <ChartContainer
                      config={{
                        value: {
                          label: "Problems",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={difficultyChartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {difficultyChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Top Problem Tags</CardTitle>
                  <CardDescription>Your strongest areas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.tagStats.length === 0 ? (
                    <div className="text-center py-8">
                      <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No problem tags yet</p>
                      <p className="text-sm text-gray-500">Solve problems to discover your strengths</p>
                    </div>
                  ) : (
                    stats.tagStats.slice(0, 8).map((tag, index) => (
                      <div key={tag.tag} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{tag.tag.replace(/\s+/g, " ")}</span>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={(tag.solved_count / stats.tagStats[0].solved_count) * 100}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-600 w-8">{tag.solved_count}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Submissions</span>
                </CardTitle>
                <CardDescription>Your latest problem-solving activity</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No recent submissions</p>
                    <p className="text-sm text-gray-500 mb-4">Start solving problems to see your activity here</p>
                    <Link href="/problems">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600">Browse Problems</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentSubmissions.map((submission, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{submission.problem_name}</h4>
                          <p className="text-sm text-gray-600">
                            {submission.problem_id} • {submission.programming_language}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          {submission.rating && (
                            <Badge variant="outline" className={getRatingColor(submission.rating)}>
                              {submission.rating}
                            </Badge>
                          )}
                          <Badge
                            variant={submission.verdict === "OK" ? "default" : "destructive"}
                            className={submission.verdict === "OK" ? "bg-green-100 text-green-800" : ""}
                          >
                            {submission.verdict}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-medium">
                      {stats.recentSubmissions.length > 0
                        ? Math.round(
                            (stats.recentSubmissions.filter((s) => s.verdict === "OK").length /
                              stats.recentSubmissions.length) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Rating</span>
                    <span className="font-medium">
                      {stats.ratingHistory.length > 0
                        ? Math.round(
                            stats.ratingHistory.reduce((sum, r) => sum + r.new_rating, 0) / stats.ratingHistory.length,
                          )
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Rank</span>
                    <span className="font-medium">
                      {stats.ratingHistory.length > 0 ? Math.min(...stats.ratingHistory.map((r) => r.rank)) : "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Codeforces Handle</span>
                    <span className="font-medium">{stats.user.codeforcesHandle}</span>
                  </div>
                  {stats.user.college && (
                    <div className="flex justify-between">
                      <span>College</span>
                      <span className="font-medium">{stats.user.college}</span>
                    </div>
                  )}
                  {stats.user.graduationYear && (
                    <div className="flex justify-between">
                      <span>Graduation Year</span>
                      <span className="font-medium">{stats.user.graduationYear}</span>
                    </div>
                  )}
                  <div className="pt-4">
                    <Link href="/profile/setup">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
