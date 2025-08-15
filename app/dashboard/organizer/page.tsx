"use client"

import { useAuth } from "@/components/providers"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Users,
  Calendar,
  Code,
  RefreshCw,
  AlertCircle,
  Plus,
  BarChart3,
  UserCheck,
  Clock,
  Award,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface OrganizerStats {
  user: {
    name: string
    role: string
    college: string | null
    permissions: {
      can_create_contests: boolean
      can_manage_participants: boolean
      can_view_analytics: boolean
      status: string
    }
  }
  contestsCreated: number
  activeContests: number
  totalParticipants: number
  collegeStudents: number
  recentContests: Array<{
    id: string
    name: string
    status: string
    participants: number
    start_time: string
    created_at: string
  }>
  pendingApprovals: Array<{
    id: string
    student_name: string
    contest_name: string
    requested_at: string
  }>
  collegeAnalytics: {
    averageRating: number
    totalProblems: number
    activeStudents: number
    topPerformers: Array<{
      name: string
      rating: number
      problems_solved: number
    }>
  }
}

export default function OrganizerDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<OrganizerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
      return
    }

    if (user) {
      if (user.role && user.role !== "organizer") {
        const redirectPath = user.role === "admin" ? "/dashboard/admin" : "/dashboard"
        router.push(redirectPath)
        return
      }
      fetchStats()
    }
  }, [authLoading, user, router])

  const fetchStats = async () => {
    try {
      setError(null)
      const response = await fetch("/api/organizer/stats")
      if (!response.ok) {
        throw new Error(`Failed to fetch organizer stats: ${response.status}`)
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch organizer stats:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load organizer dashboard"
      setError(errorMessage)
      toast({
        title: "Error loading dashboard",
        description: "We couldn't load your organizer stats. Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveParticipant = async (approvalId: string) => {
    try {
      const response = await fetch(`/api/organizer/approvals/${approvalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })

      if (!response.ok) {
        throw new Error("Failed to approve participant")
      }

      toast({
        title: "Participant approved",
        description: "The student has been approved for contest participation.",
      })

      await fetchStats()
    } catch (error) {
      toast({
        title: "Approval failed",
        description: "We couldn't approve the participant. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Loading organizer dashboard...</p>
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
                  We're having trouble loading your organizer data.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Button onClick={fetchStats} className="bg-gradient-to-r from-purple-600 to-cyan-600">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Check if organizer permissions are approved
  if (stats?.user.permissions.status !== "approved") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-gray-800/50 border-yellow-500/50">
              <CardHeader className="pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Organizer Approval Pending</CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Your organizer permissions are currently under review by the admin team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-yellow-900/50 border border-yellow-500/50 p-4 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    Status: <span className="font-semibold capitalize">{stats?.user.permissions.status}</span>
                  </p>
                  <p className="text-yellow-300 text-sm mt-2">
                    You'll receive an email notification once your organizer access is approved.
                  </p>
                </div>
                <Link href="/dashboard/student">
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent">
                    Switch to Student Dashboard
                  </Button>
                </Link>
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
              <Link href="/dashboard/organizer" className="text-purple-400 font-medium">
                Dashboard
              </Link>
              <Link href="/organizer/contests" className="text-gray-300 hover:text-purple-400">
                My Contests
              </Link>
              <Link href="/organizer/analytics" className="text-gray-300 hover:text-purple-400">
                Analytics
              </Link>
              <Link href="/organizer/students" className="text-gray-300 hover:text-purple-400">
                Students
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
              Organizer
            </Badge>
            <Avatar>
              <AvatarImage src={user?.avatar_url || ""} />
              <AvatarFallback className="bg-gray-700 text-white">{user?.name?.[0] || "O"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.name?.split(" ")[0]}!</h2>
          <p className="text-xl text-gray-300">
            Manage contests and track performance for {stats?.user.college || "your college"}
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Contests Created */}
          <Card className="bg-gray-800/50 border-purple-500/50 hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Contests Created</p>
                  <p className="text-3xl font-bold text-purple-400">{stats?.contestsCreated || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Contests */}
          <Card className="bg-gray-800/50 border-green-500/50 hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active Contests</p>
                  <p className="text-3xl font-bold text-green-400">{stats?.activeContests || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Participants */}
          <Card className="bg-gray-800/50 border-cyan-500/50 hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Participants</p>
                  <p className="text-3xl font-bold text-cyan-400">{stats?.totalParticipants || 0}</p>
                </div>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* College Students */}
          <Card className="bg-gray-800/50 border-orange-500/50 hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">College Students</p>
                  <p className="text-3xl font-bold text-orange-400">{stats?.collegeStudents || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/organizer/contests/create">
            <Card className="bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border-purple-500/50 hover:from-purple-600/30 hover:to-cyan-600/30 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Create New Contest</h3>
                <p className="text-gray-300 text-sm">Set up a new college contest with custom problems</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/organizer/analytics">
            <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/50 hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">View Analytics</h3>
                <p className="text-gray-300 text-sm">Analyze college-wide performance and trends</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/organizer/students">
            <Card className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border-cyan-500/50 hover:from-cyan-600/30 hover:to-blue-600/30 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <UserCheck className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Manage Students</h3>
                <p className="text-gray-300 text-sm">Approve participants and recommend problems</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Contests */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Trophy className="w-5 h-5 text-purple-400" />
                <span>Recent Contests</span>
              </CardTitle>
              <CardDescription className="text-gray-400">Your recently created contests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.recentContests && stats.recentContests.length > 0 ? (
                stats.recentContests.map((contest) => (
                  <div key={contest.id} className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white truncate">{contest.name}</h4>
                      <Badge
                        variant="outline"
                        className={
                          contest.status === "ongoing"
                            ? "border-green-500 text-green-400"
                            : contest.status === "finished"
                              ? "border-gray-500 text-gray-400"
                              : "border-blue-500 text-blue-400"
                        }
                      >
                        {contest.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{contest.participants} participants</span>
                      <span>{new Date(contest.start_time).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No contests yet</p>
                  <p className="text-sm text-gray-500">Create your first contest to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <UserCheck className="w-5 h-5 text-yellow-400" />
                <span>Pending Approvals</span>
              </CardTitle>
              <CardDescription className="text-gray-400">Students waiting for contest approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.pendingApprovals && stats.pendingApprovals.length > 0 ? (
                stats.pendingApprovals.map((approval) => (
                  <div key={approval.id} className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{approval.student_name}</h4>
                      <Button
                        size="sm"
                        onClick={() => handleApproveParticipant(approval.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{approval.contest_name}</p>
                    <p className="text-xs text-gray-500">{new Date(approval.requested_at).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No pending approvals</p>
                  <p className="text-sm text-gray-500">All participants are approved</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* College Analytics Preview */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span>College Performance</span>
              </CardTitle>
              <CardDescription className="text-gray-400">Overview of your college's performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.collegeAnalytics ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-400">{stats.collegeAnalytics.averageRating}</p>
                      <p className="text-xs text-gray-400">Avg Rating</p>
                    </div>
                    <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                      <p className="text-2xl font-bold text-cyan-400">{stats.collegeAnalytics.totalProblems}</p>
                      <p className="text-xs text-gray-400">Total Problems</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">Top Performers</h4>
                    {stats.collegeAnalytics.topPerformers.slice(0, 3).map((student, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{student.name}</span>
                        <span className="text-purple-400">{student.rating}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No analytics data</p>
                  <p className="text-sm text-gray-500">Data will appear as students participate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
