"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Trophy,
  Medal,
  Code,
  RefreshCw,
  Search,
  Crown,
  Star,
  GraduationCap,
  MapPin,
  Users,
  Target,
  BarChart3,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CollegeRanking {
  id: number
  name: string
  short_name: string
  location: string
  state: string
  tier: number
  student_count: number
  avg_rating: number
  avg_max_rating: number
  avg_problems_solved: number
  avg_contests_participated: number
  top_rating: number
  total_problems_solved: number
  rank: number
}

interface UserCollege {
  id: number
  name: string
  short_name: string
  tier: number
}

interface CollegeStudent {
  id: string
  name: string
  email: string
  image: string | null
  codeforces_handle: string
  current_rating: number
  max_rating: number
  problems_solved: number
  contests_participated: number
  graduation_year: number | null
  rank: number
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [collegeRankings, setCollegeRankings] = useState<CollegeRanking[]>([])
  const [userCollege, setUserCollege] = useState<UserCollege | null>(null)
  const [ownCollegeRanking, setOwnCollegeRanking] = useState<CollegeStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("current_rating")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchLeaderboards()
    }
  }, [status, router, sortBy])

  const fetchLeaderboards = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/leaderboard?sortBy=${sortBy}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboards: ${response.status}`)
      }
      const data = await response.json()
      setCollegeRankings(data.collegeRankings || [])
      setUserCollege(data.userCollege || null)
      setOwnCollegeRanking(data.ownCollegeRanking || [])
    } catch (error) {
      console.error("Failed to fetch leaderboards:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load leaderboard data"
      setError(errorMessage)
      toast({
        title: "Error loading leaderboard",
        description: "We couldn't load the rankings. Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchLeaderboards()
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

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    if (rank <= 10) return <Star className="w-5 h-5 text-blue-500" />
    return <Trophy className="w-4 h-4 text-gray-500" />
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
    if (rank === 3) return "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
    if (rank <= 10) return "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
    return "bg-gray-100 text-gray-800"
  }

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case 3:
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1:
        return "Tier 1"
      case 2:
        return "Tier 2"
      case 3:
        return "Tier 3"
      default:
        return "Unknown"
    }
  }

  const filteredCollegeRankings = collegeRankings.filter(
    (college) =>
      college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.short_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredOwnCollegeRanking = ownCollegeRanking.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.codeforces_handle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading leaderboards...</p>
        </div>
      </div>
    )
  }

  if (error && collegeRankings.length === 0) {
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
                <CardTitle>Unable to Load Leaderboard</CardTitle>
                <CardDescription>
                  We're having trouble loading the rankings. This might be a temporary issue.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Button onClick={fetchLeaderboards} className="bg-gradient-to-r from-blue-600 to-purple-600">
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
              <Link href="/contests" className="text-gray-600 hover:text-blue-600">
                Contests
              </Link>
              <Link href="/leaderboard" className="text-blue-600 font-medium">
                Leaderboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Avatar>
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <span>College Rankings</span>
              </h2>
              <p className="text-gray-600">Compare colleges and see how your college ranks</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 bg-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_rating">Average Rating</SelectItem>
              <SelectItem value="max_rating">Average Max Rating</SelectItem>
              <SelectItem value="problems_solved">Average Problems Solved</SelectItem>
              <SelectItem value="contests_participated">Average Contests</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="colleges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="colleges">Overall College Rankings</TabsTrigger>
            <TabsTrigger value="own-college" disabled={!userCollege}>
              {userCollege ? `${userCollege.short_name || userCollege.name} Rankings` : "Your College Rankings"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colleges" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>College Rankings</span>
                </CardTitle>
                <CardDescription>
                  Colleges ranked by average {sortBy.replace("_", " ")} of verified students
                </CardDescription>
              </CardHeader>
              <CardContent>
                {collegeRankings.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No College Rankings Yet</h3>
                    <p className="text-gray-600 mb-4">
                      College rankings will appear once students verify their Codeforces accounts.
                    </p>
                    <Link href="/verify-cf">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600">Verify Your Account</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCollegeRankings.map((college) => (
                      <div
                        key={college.id}
                        className={`flex items-center justify-between p-6 rounded-lg transition-all hover:shadow-md border ${
                          userCollege?.id === college.id
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
                            : "bg-white border-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getRankIcon(college.rank)}
                            <Badge className={getRankBadge(college.rank)}>#{college.rank}</Badge>
                          </div>
                          <div className="flex items-center space-x-3">
                            <GraduationCap className="w-12 h-12 text-blue-600" />
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-lg">{college.name}</h4>
                                {userCollege?.id === college.id && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">Your College</Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>
                                    {college.location}, {college.state}
                                  </span>
                                </span>
                                <Badge className={getTierColor(college.tier)}>{getTierLabel(college.tier)}</Badge>
                                <span className="flex items-center space-x-1">
                                  <Users className="w-3 h-3" />
                                  <span>{college.student_count} students</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <div className={`text-lg font-bold ${getRatingColor(college.avg_rating)}`}>
                                {college.avg_rating}
                              </div>
                              <div className="text-xs text-gray-500">Avg Rating</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-600">{college.avg_problems_solved}</div>
                              <div className="text-xs text-gray-500">Avg Problems</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-purple-600">
                                {college.avg_contests_participated}
                              </div>
                              <div className="text-xs text-gray-500">Avg Contests</div>
                            </div>
                            <div>
                              <div className={`text-lg font-bold ${getRatingColor(college.top_rating)}`}>
                                {college.top_rating}
                              </div>
                              <div className="text-xs text-gray-500">Top Rating</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="own-college" className="space-y-6">
            {!userCollege ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No College Selected</h3>
                  <p className="text-gray-600 mb-4">Please complete your profile setup to see your college rankings.</p>
                  <Button asChild>
                    <Link href="/profile/setup">Complete Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : ownCollegeRanking.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Students Found</h3>
                  <p className="text-gray-600 mb-4">
                    No verified students found from {userCollege.name}. Be the first to verify your Codeforces handle!
                  </p>
                  <Link href="/verify-cf">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">Verify Your Account</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <span>{userCollege.name} Rankings</span>
                    <Badge className="bg-blue-100 text-blue-800">{ownCollegeRanking.length} students</Badge>
                  </CardTitle>
                  <CardDescription>Students from your college ranked by {sortBy.replace("_", " ")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredOwnCollegeRanking.map((student) => {
                      const isCurrentUser = student.email === session?.user?.email

                      return (
                        <div
                          key={student.id}
                          className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md ${
                            isCurrentUser
                              ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
                              : "bg-white border border-gray-100"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {getRankIcon(student.rank)}
                              <Badge className={getRankBadge(student.rank)}>#{student.rank}</Badge>
                            </div>
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={student.image || ""} />
                              <AvatarFallback>{student.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold">{student.name}</h4>
                                {isCurrentUser && <Badge className="bg-blue-100 text-blue-800 text-xs">You</Badge>}
                              </div>
                              <div className="flex items-center space-x-3 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <Code className="w-3 h-3" />
                                  <span>@{student.codeforces_handle}</span>
                                </span>
                                {student.graduation_year && (
                                  <span className="flex items-center space-x-1">
                                    <Target className="w-3 h-3" />
                                    <span>Class of {student.graduation_year}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className={`text-lg font-bold ${getRatingColor(student.current_rating)}`}>
                                  {student.current_rating}
                                </div>
                                <div className="text-xs text-gray-500">{getRatingTitle(student.current_rating)}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{student.problems_solved}</div>
                                <div className="text-xs text-gray-500">Problems</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">{student.contests_participated}</div>
                                <div className="text-xs text-gray-500">Contests</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
