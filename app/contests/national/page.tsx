"use client"

import { useAuth } from "@/components/providers"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, Award, Calendar, Clock, Code, RefreshCw, Medal, TrendingUp } from "lucide-react"
import Link from "next/link"

interface NationalContest {
  id: string
  name: string
  description: string
  startTime: string
  endTime: string
  isActive: boolean
  participantCount: number
  status: "upcoming" | "live" | "ended"
}

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  college: string
  rating: number
  score: number
  problemsSolved: number
  lastSubmission: string
}

interface CollegeRanking {
  rank: number
  college: string
  averageScore: number
  topPerformers: Array<{
    name: string
    score: number
    rating: number
  }>
  participantCount: number
}

export default function NationalContestsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [contests, setContests] = useState<NationalContest[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [collegeRankings, setCollegeRankings] = useState<CollegeRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContest, setSelectedContest] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
      return
    }

    if (user) {
      fetchNationalContests()
    }
  }, [authLoading, user, router])

  const fetchNationalContests = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/contests/national")
      if (response.ok) {
        const data = await response.json()
        setContests(data.contests || [])
        if (data.contests.length > 0) {
          const activeContest = data.contests.find((c: NationalContest) => c.isActive) || data.contests[0]
          setSelectedContest(activeContest.id)
          await fetchLeaderboard(activeContest.id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch national contests:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboard = async (contestId: string) => {
    try {
      const [leaderboardRes, collegeRes] = await Promise.all([
        fetch(`/api/contests/national/${contestId}/leaderboard`),
        fetch(`/api/contests/national/${contestId}/college-rankings`),
      ])

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json()
        setLeaderboard(leaderboardData.leaderboard || [])
      }

      if (collegeRes.ok) {
        const collegeData = await collegeRes.json()
        setCollegeRankings(collegeData.rankings || [])
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    }
  }

  const handleContestSelect = (contestId: string) => {
    setSelectedContest(contestId)
    fetchLeaderboard(contestId)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Upcoming</Badge>
      case "live":
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Live</Badge>
      case "ended":
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Ended</Badge>
      default:
        return null
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return <Trophy className="w-4 h-4 text-gray-500" />
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Loading national contests...</p>
        </div>
      </div>
    )
  }

  const selectedContestData = contests.find((c) => c.id === selectedContest)

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
              <Link href="/dashboard" className="text-gray-300 hover:text-purple-400">
                Dashboard
              </Link>
              <Link href="/problems" className="text-gray-300 hover:text-purple-400">
                Problems
              </Link>
              <Link href="/contests" className="text-gray-300 hover:text-purple-400">
                Contests
              </Link>
              <Link href="/contests/national" className="text-purple-400 font-medium">
                National
              </Link>
            </nav>
          </div>
          <Link href="/contests">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent">
              Back to Contests
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">National Contests</h2>
          <p className="text-xl text-gray-300">Compete with programmers from colleges across the country</p>
        </div>

        {/* Contest Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {contests.map((contest) => (
            <Card
              key={contest.id}
              className={`cursor-pointer transition-all duration-300 ${
                selectedContest === contest.id
                  ? "bg-purple-500/20 border-purple-500/50"
                  : "bg-gray-800/50 border-gray-600 hover:bg-gray-800/70"
              }`}
              onClick={() => handleContestSelect(contest.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{contest.name}</h3>
                  {getStatusBadge(contest.status)}
                </div>
                <p className="text-gray-400 text-sm mb-4">{contest.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{contest.participantCount}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedContestData && (
          <>
            {/* Contest Info Banner */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white mb-8">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{selectedContestData.name}</h3>
                    <p className="text-purple-100 mb-4">{selectedContestData.description}</p>
                    <div className="flex items-center space-x-6 text-purple-100">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedContestData.startTime).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(selectedContestData.startTime).toLocaleTimeString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{selectedContestData.participantCount} participants</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">{getStatusBadge(selectedContestData.status)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboards */}
            <Tabs defaultValue="overall" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                <TabsTrigger value="overall" className="data-[state=active]:bg-purple-600">
                  Overall Rank
                </TabsTrigger>
                <TabsTrigger value="college" className="data-[state=active]:bg-purple-600">
                  College Rank
                </TabsTrigger>
                <TabsTrigger value="colleges" className="data-[state=active]:bg-purple-600">
                  Top Colleges
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overall">
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span>Overall Leaderboard</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      National rankings across all participants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leaderboard.slice(0, 50).map((entry) => (
                        <div
                          key={entry.userId}
                          className={`flex items-center justify-between p-4 rounded-lg ${
                            entry.userId === user?.id
                              ? "bg-purple-500/20 border border-purple-500/30"
                              : "bg-gray-700/50"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {getRankIcon(entry.rank)}
                              <span className="text-lg font-semibold text-white">{entry.rank}</span>
                            </div>
                            <Avatar>
                              <AvatarFallback className="bg-gray-600 text-white">{entry.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-white">{entry.name}</h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <span>{entry.college}</span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getRatingColor(entry.rating)} border-current`}
                                >
                                  {entry.rating}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{entry.score}</div>
                            <div className="text-xs text-gray-400">{entry.problemsSolved} problems</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="college">
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Award className="w-5 h-5 text-blue-400" />
                      <span>College Leaderboard</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Rankings within your college: {user?.college || "Not specified"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leaderboard
                        .filter((entry) => entry.college === user?.college)
                        .map((entry, index) => (
                          <div
                            key={entry.userId}
                            className={`flex items-center justify-between p-4 rounded-lg ${
                              entry.userId === user?.id ? "bg-blue-500/20 border border-blue-500/30" : "bg-gray-700/50"
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {getRankIcon(index + 1)}
                                <span className="text-lg font-semibold text-white">{index + 1}</span>
                              </div>
                              <Avatar>
                                <AvatarFallback className="bg-gray-600 text-white">{entry.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-white">{entry.name}</h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-400">
                                  <span>National Rank: #{entry.rank}</span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getRatingColor(entry.rating)} border-current`}
                                  >
                                    {entry.rating}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-white">{entry.score}</div>
                              <div className="text-xs text-gray-400">{entry.problemsSolved} problems</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="colleges">
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span>Top Colleges</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      College rankings based on average of top 5 performers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {collegeRankings.slice(0, 20).map((college) => (
                        <Card key={college.college} className="bg-gray-700/50 border-gray-600">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  {getRankIcon(college.rank)}
                                  <span className="text-xl font-bold text-white">{college.rank}</span>
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-white">{college.college}</h3>
                                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                                    <span>{college.participantCount} participants</span>
                                    <span>Avg Score: {college.averageScore.toFixed(1)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-300">Top Performers:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {college.topPerformers.map((performer, index) => (
                                  <div key={index} className="bg-gray-600/50 rounded-lg p-3">
                                    <div className="font-medium text-white text-sm">{performer.name}</div>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                      <span>Score: {performer.score}</span>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${getRatingColor(performer.rating)} border-current`}
                                      >
                                        {performer.rating}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
