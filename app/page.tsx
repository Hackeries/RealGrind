"use client"

import { useAuth } from "@/components/providers"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Shield,
  Users,
  Trophy,
  BarChart3,
  UserCheck,
  AlertTriangle,
  Globe,
  Settings,
  RefreshCw,
  AlertCircle,
  Crown,
  Activity,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface AdminStats {
  user: {
    name: string
    role: string
  }
  platformStats: {
    totalUsers: number
    totalStudents: number
    totalOrganizers: number
    totalContests: number
    activeContests: number
    totalColleges: number
  }
  pendingApprovals: Array<{
    id: string
    user_name: string
    user_email: string
    college_name: string
    requested_at: string
    status: string
  }>
  recentActivity: Array<{
    id: string
    admin_name: string
    action_type: string
    description: string
    created_at: string
  }>
  nationalLeaderboard: Array<{
    rank: number
    name: string
    college: string
    rating: number
    problems_solved: number
    contests_participated: number
  }>
  collegeStats: Array<{
    college_name: string
    student_count: number
    average_rating: number
    total_contests: number
    active_organizers: number
  }>
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
      return
    }

    if (user) {
      if (user.role !== "admin") {
        const redirectPath = user.role === "organizer" ? "/dashboard/organizer" : "/dashboard"
        router.push(redirectPath)
        return
      }
      fetchStats()
    }
  }, [authLoading, user, router])

  const fetchStats = async () => {
    try {
      setError(null)
      const response = await fetch("/api/admin/stats")
      if (!response.ok) {
        throw new Error(`Failed to fetch admin stats: ${response.status}`)
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch admin stats:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load admin dashboard"
      setError(errorMessage)
      toast({
        title: "Error loading dashboard",
        description: "We couldn't load your admin stats. Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveOrganizer = async (approvalId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/admin/organizer-approvals/${approvalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} organizer`)
      }

      toast({
        title: `Organizer ${action}d`,
        description: `The organizer request has been ${action}d successfully.`,
      })

      await fetchStats()
    } catch (error) {
      toast({
        title: `${action} failed`,
        description: `We couldn't ${action} the organizer request. Please try again.`,
        variant: "destructive",
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Loading admin dashboard...</p>
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
                <CardTitle className="text-white">Unable to Load Admin Dashboard</CardTitle>
                <CardDescription className="text-gray-300">
                  We're having trouble loading your admin data.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                RealGrind Admin
              </h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard/admin" className="text-purple-400 font-medium">
                Dashboard
              </Link>
              <Link href="/admin/contests" className="text-gray-300 hover:text-purple-400">
                National Contests
              </Link>
              <Link href="/admin/organizers" className="text-gray-300 hover:text-purple-400">
                Organizers
              </Link>
              <Link href="/admin/analytics" className="text-gray-300 hover:text-purple-400">
                Analytics
              </Link>
              <Link href="/admin/settings" className="text-gray-300 hover:text-purple-400">
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-red-500 text-red-400">
              <Crown className="w-3 h-3 mr-1" />
              Admin
            </Badge>
            <Avatar>
              <AvatarImage src={user?.avatar_url || ""} />
              <AvatarFallback className="bg-gray-700 text-white">{user?.name?.[0] || "A"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h2>
          <p className="text-xl text-gray-300">Manage the RealGrind competitive programming platform</p>
        </div>

        {/* Platform Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gray-800/50 border-blue-500/50 hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-400">{stats?.platformStats.totalUsers || 0}</p>
                <p className="text-xs text-gray-400">Total Users</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-green-500/50 hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-4">
              <div className="text-center">
                <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-400">{stats?.platformStats.totalStudents || 0}</p>
                <p className="text-xs text-gray-400">Students</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-yellow-500/50 hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-4">
              <div className="text-center">
                <UserCheck className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-400">{stats?.platformStats.totalOrganizers || 0}</p>
                <p className="text-xs text-gray-400">Organizers</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-purple-500/50 hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-4">
              <div className="text-center">
                <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-400">{stats?.platformStats.totalContests || 0}</p>
                <p className="text-xs text-gray-400">Total Contests</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-cyan-500/50 hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-4">
              <div className="text-center">
                <Activity className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-cyan-400">{stats?.platformStats.activeContests || 0}</p>
                <p className="text-xs text-gray-400">Active Contests</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-orange-500/50 hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-4">
              <div className="text-center">
                <Globe className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-400">{stats?.platformStats.totalColleges || 0}</p>
                <p className="text-xs text-gray-400">Colleges</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/contests/create">
            <Card className="bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border-purple-500/50 hover:from-purple-600/30 hover:to-cyan-600/30 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <Trophy className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Create National Contest</h3>
                <p className="text-gray-300 text-sm">Set up nationwide competitive programming contests</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/organizers">
            <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/50 hover:from-yellow-600/30 hover:to-orange-600/30 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <UserCheck className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Manage Organizers</h3>
                <p className="text-gray-300 text-sm">Approve and manage contest organizers</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/50 hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Platform Analytics</h3>
                <p className="text-gray-300 text-sm">Monitor cross-college participation and trends</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="bg-gradient-to-br from-gray-600/20 to-slate-600/20 border-gray-500/50 hover:from-gray-600/30 hover:to-slate-600/30 transition-all duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <Settings className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Platform Settings</h3>
                <p className="text-gray-300 text-sm">Configure platform-wide settings and policies</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Organizer Approvals */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span>Pending Organizer Approvals</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                New organizer requests requiring your approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.pendingApprovals && stats.pendingApprovals.length > 0 ? (
                stats.pendingApprovals.map((approval) => (
                  <div key={approval.id} className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{approval.user_name}</h4>
                      <Badge
                        variant="outline"
                        className={
                          approval.status === "pending"
                            ? "border-yellow-500 text-yellow-400"
                            : "border-gray-500 text-gray-400"
                        }
                      >
                        {approval.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{approval.college_name}</p>
                    <p className="text-xs text-gray-500 mb-3">{approval.user_email}</p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveOrganizer(approval.id, "approve")}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproveOrganizer(approval.id, "reject")}
                        className="border-red-500 text-red-400 hover:bg-red-500/20 flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No pending approvals</p>
                  <p className="text-sm text-gray-500">All organizer requests are processed</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Admin Activity */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Activity className="w-5 h-5 text-blue-400" />
                <span>Recent Admin Activity</span>
              </CardTitle>
              <CardDescription className="text-gray-400">Latest administrative actions on the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.description}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400">{activity.admin_name}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No recent activity</p>
                  <p className="text-sm text-gray-500">Admin actions will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* National Leaderboard Preview */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                <span>National Leaderboard</span>
              </CardTitle>
              <CardDescription className="text-gray-400">Top performers across all colleges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.nationalLeaderboard && stats.nationalLeaderboard.length > 0 ? (
                stats.nationalLeaderboard.slice(0, 5).map((user) => (
                  <div key={user.rank} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{user.rank}</span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.college}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-400">{user.rating}</p>
                      <p className="text-xs text-gray-400">{user.problems_solved} problems</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No leaderboard data</p>
                  <p className="text-sm text-gray-500">Rankings will appear as users participate</p>
                </div>
              )}
              <Link href="/admin/leaderboard">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  View Full Leaderboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* College Statistics */}
        <div className="mt-8">
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Globe className="w-5 h-5 text-cyan-400" />
                <span>College Statistics</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Overview of participation and performance across colleges
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.collegeStats && stats.collegeStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-300">College</th>
                        <th className="text-center py-3 px-4 text-gray-300">Students</th>
                        <th className="text-center py-3 px-4 text-gray-300">Avg Rating</th>
                        <th className="text-center py-3 px-4 text-gray-300">Contests</th>
                        <th className="text-center py-3 px-4 text-gray-300">Organizers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.collegeStats.slice(0, 10).map((college, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-700/30">
                          <td className="py-3 px-4 text-white font-medium">{college.college_name}</td>
                          <td className="py-3 px-4 text-center text-blue-400">{college.student_count}</td>
                          <td className="py-3 px-4 text-center text-green-400">{college.average_rating}</td>
                          <td className="py-3 px-4 text-center text-purple-400">{college.total_contests}</td>
                          <td className="py-3 px-4 text-center text-yellow-400">{college.active_organizers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No college data available</p>
                  <p className="text-sm text-gray-500">Statistics will appear as colleges join the platform</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
