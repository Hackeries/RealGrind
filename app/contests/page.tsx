"use client"

import { useAuth } from "@/components/providers"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Plus,
  ExternalLink,
  Code,
  RefreshCw,
  Award,
  Target,
  AlertCircle,
  FolderSyncIcon as Sync,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Contest {
  id: string
  name: string
  type: string
  phase: string
  duration_seconds: number
  start_time: string | null
  relative_time_seconds: number | null
}

interface CollegeContest {
  id: string
  name: string
  college: string
  description: string | null
  start_time: string
  end_time: string
  created_by: string
  is_active: boolean
  created_at: string
  creator_name: string
  participant_count: number
}

export default function ContestsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [contests, setContests] = useState<Contest[]>([])
  const [collegeContests, setCollegeContests] = useState<CollegeContest[]>([])
  const [loading, setLoading] = useState(true)
  const [collegeContestsLoading, setCollegeContestsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
      return
    }

    if (user) {
      fetchUserProfile()
      fetchContests()
      fetchCollegeContests()
    }
  }, [user, authLoading, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    }
  }

  const fetchContests = async () => {
    try {
      setError(null)
      const response = await fetch("/api/contests")
      if (!response.ok) {
        throw new Error(`Failed to fetch contests: ${response.status}`)
      }
      const data = await response.json()
      setContests(data.contests || [])
    } catch (error) {
      console.error("Failed to fetch contests:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load contests"
      setError(errorMessage)
      toast({
        title: "Error loading contests",
        description: "We couldn't load the contests. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCollegeContests = async () => {
    try {
      const response = await fetch("/api/contests/college")
      if (response.ok) {
        const data = await response.json()
        setCollegeContests(data.contests || [])
      }
    } catch (error) {
      console.error("Failed to fetch college contests:", error)
    } finally {
      setCollegeContestsLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatTimeUntil = (startTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const diff = start.getTime() - now.getTime()

    if (diff < 0) return "Started"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "BEFORE":
        return "bg-blue-100 text-blue-800"
      case "CODING":
        return "bg-green-100 text-green-800"
      case "FINISHED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getContestTypeColor = (type: string) => {
    switch (type) {
      case "CF":
        return "bg-purple-100 text-purple-800"
      case "ICPC":
        return "bg-orange-100 text-orange-800"
      case "IOI":
        return "bg-green-100 text-green-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const ContestSkeleton = () => (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex-1 mb-4 md:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <Skeleton className="h-6 w-80" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="flex items-center space-x-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading contests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
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
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/problems" className="text-gray-600 hover:text-blue-600">
                Problems
              </Link>
              <Link href="/contests" className="text-blue-600 font-medium">
                Contests
              </Link>
              <Link href="/leaderboard" className="text-gray-600 hover:text-blue-600">
                Leaderboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
              <AvatarFallback>{user?.user_metadata?.full_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {userProfile && !userProfile.college && (
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <Sync className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <span>
                  Complete your profile to participate in college contests and see college-specific competitions.
                </span>
                <Link href="/profile/setup">
                  <Button size="sm" className="ml-4 bg-blue-600 hover:bg-blue-700">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Contests</h2>
              <p className="text-gray-600">Participate in Codeforces contests and create college competitions</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Link href="/contests/custom">
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Custom Practice
                </Button>
              </Link>
              <Link href="/contests/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create College Contest
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Tabs defaultValue="codeforces" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="codeforces">Codeforces</TabsTrigger>
            <TabsTrigger value="college">College</TabsTrigger>
            <TabsTrigger value="national">National</TabsTrigger>
            <TabsTrigger value="custom">Custom Practice</TabsTrigger>
          </TabsList>

          <TabsContent value="codeforces" className="space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <ContestSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Contests</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={fetchContests} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : contests.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Contests Available</h3>
                  <p className="text-gray-600 mb-4">
                    No upcoming Codeforces contests found. Check back later for new competitions!
                  </p>
                  <a href="https://codeforces.com/contests" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Codeforces
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {contests.slice(0, 20).map((contest) => (
                  <Card key={contest.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{contest.name}</h3>
                            <Badge className={getPhaseColor(contest.phase)}>{contest.phase}</Badge>
                            <Badge className={getContestTypeColor(contest.type)}>{contest.type}</Badge>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(contest.duration_seconds)}</span>
                            </span>
                            {contest.start_time && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(contest.start_time).toLocaleDateString()}</span>
                              </span>
                            )}
                            {contest.phase === "BEFORE" && contest.start_time && (
                              <span className="flex items-center space-x-1 text-blue-600">
                                <Target className="w-4 h-4" />
                                <span>Starts in {formatTimeUntil(contest.start_time)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <a
                            href={`https://codeforces.com/contest/${contest.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View on CF
                            </Button>
                          </a>
                          <Link href={`/contests/${contest.id}`}>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="college" className="space-y-6">
            {collegeContestsLoading ? (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  <AlertDescription className="text-blue-800">Loading college contests...</AlertDescription>
                </Alert>
                {[...Array(3)].map((_, i) => (
                  <ContestSkeleton key={i} />
                ))}
              </div>
            ) : collegeContests.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No College Contests Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to create a contest for your college and compete with your peers!
                  </p>
                  <Link href="/contests/create">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Contest
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {collegeContests.map((contest) => (
                  <Card key={contest.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{contest.name}</h3>
                            <Badge
                              className={
                                contest.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }
                            >
                              {contest.is_active ? "Active" : "Ended"}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{contest.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Award className="w-4 h-4" />
                              <span>{contest.college}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{contest.participant_count} participants</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(contest.start_time).toLocaleDateString()}</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Created by {contest.creator_name}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Link href={`/contests/college/${contest.id}`}>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                              View Contest
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="national" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Trophy className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">National Contests</h3>
                <p className="text-gray-600 mb-6">
                  Compete with programmers from across the country in national-level competitions.
                </p>
                <Link href="/contests/national">
                  <Button className="bg-gradient-to-r from-orange-600 to-red-600">
                    <Trophy className="w-4 h-4 mr-2" />
                    View National Contests
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Zap className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Custom Practice Contests</h3>
                <p className="text-gray-600 mb-6">
                  Create personalized practice sessions with problems tailored to your skill level and preferences.
                </p>
                <Link href="/contests/custom">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Zap className="w-4 h-4 mr-2" />
                    Create Practice Contest
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
