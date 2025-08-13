"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Calendar, Clock, Users, Award, Code, RefreshCw, CheckCircle, AlertCircle, Medal } from "lucide-react"
import Link from "next/link"

interface ContestDetails {
  contest: {
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
  }
  participants: Array<{
    user_id: string
    score: number
    rank: number | null
    joined_at: string
    name: string
    codeforces_handle: string | null
    current_rating: number
  }>
}

export default function CollegeContestPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contest, setContest] = useState<ContestDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchContest()
    }
  }, [status, router, params.id])

  const fetchContest = async () => {
    try {
      const response = await fetch(`/api/contests/college/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setContest(data)
      } else {
        setError("Contest not found")
      }
    } catch (error) {
      console.error("Failed to fetch contest:", error)
      setError("Failed to load contest")
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    setJoining(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/contests/college/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join" }),
      })

      if (response.ok) {
        setSuccess("Successfully joined the contest!")
        await fetchContest() // Refresh data
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to join contest")
      }
    } catch (error) {
      setError("Failed to join contest")
    } finally {
      setJoining(false)
    }
  }

  const isParticipating = contest?.participants.some((p) => p.user_id === session?.user?.id)
  const contestStarted = contest ? new Date(contest.contest.start_time) <= new Date() : false
  const contestEnded = contest ? new Date(contest.contest.end_time) <= new Date() : false

  const getStatusBadge = () => {
    if (!contest) return null

    if (contestEnded) {
      return <Badge className="bg-gray-100 text-gray-800">Ended</Badge>
    } else if (contestStarted) {
      return <Badge className="bg-green-100 text-green-800">Live</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
    }
  }

  const getRankIcon = (rank: number | null) => {
    if (!rank) return null

    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return <Trophy className="w-4 h-4 text-gray-500" />
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading contest...</p>
        </div>
      </div>
    )
  }

  if (error && !contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Contest Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/contests">
              <Button>Back to Contests</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!contest) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RealGrind
            </h1>
          </Link>
          <Link href="/contests">
            <Button variant="outline" className="bg-transparent">
              Back to Contests
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Contest Header */}
        <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{contest.contest.name}</h1>
                  {getStatusBadge()}
                </div>
                <p className="text-blue-100 mb-4">{contest.contest.description}</p>
                <div className="flex items-center space-x-6 text-blue-100">
                  <span className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>{contest.contest.college}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{contest.participants.length} participants</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(contest.contest.start_time).toLocaleDateString()}</span>
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-2">Created by {contest.contest.creator_name}</p>
              </div>
              <div className="text-right">
                {!isParticipating && !contestEnded && (
                  <Button
                    onClick={handleJoin}
                    disabled={joining}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                    size="lg"
                  >
                    {joining ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Join Contest
                      </>
                    )}
                  </Button>
                )}
                {isParticipating && (
                  <div className="flex items-center space-x-2 text-green-200">
                    <CheckCircle className="w-5 h-5" />
                    <span>Participating</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Contest Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Start Time</h3>
              <p className="text-sm text-gray-600">{new Date(contest.contest.start_time).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">End Time</h3>
              <p className="text-sm text-gray-600">{new Date(contest.contest.end_time).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Participants</h3>
              <p className="text-2xl font-bold text-green-600">{contest.participants.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Leaderboard</span>
            </CardTitle>
            <CardDescription>Contest standings and participant rankings</CardDescription>
          </CardHeader>
          <CardContent>
            {contest.participants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No participants yet</p>
                <p className="text-sm text-gray-500">Be the first to join this contest!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contest.participants.map((participant, index) => (
                  <div
                    key={participant.user_id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      participant.user_id === session?.user?.id ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(participant.rank)}
                        <span className="text-lg font-semibold">{participant.rank || index + 1}</span>
                      </div>
                      <Avatar>
                        <AvatarFallback>{participant.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{participant.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {participant.codeforces_handle && <span>@{participant.codeforces_handle}</span>}
                          {participant.current_rating > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {participant.current_rating}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{participant.score}</div>
                      <div className="text-xs text-gray-500">
                        Joined {new Date(participant.joined_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
