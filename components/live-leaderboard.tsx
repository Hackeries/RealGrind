"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Crown, RefreshCw, Zap } from "lucide-react"

interface LiveStanding {
  user_id: string
  score: number
  rank: number | null
  joined_at: string
  name: string
  codeforces_handle: string | null
  current_rating: number
  avatar_url: string | null
  live_rank: number
}

interface LiveLeaderboardProps {
  contestId: string
  refreshInterval?: number
}

export function LiveLeaderboard({ contestId, refreshInterval = 30000 }: LiveLeaderboardProps) {
  const [standings, setStandings] = useState<LiveStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch(`/api/leaderboard/live?contestId=${contestId}`)
        if (response.ok) {
          const data = await response.json()
          setStandings(data.standings)
          setLastUpdated(data.lastUpdated)
        }
      } catch (error) {
        console.error("Failed to fetch live standings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()

    // Set up auto-refresh
    const interval = setInterval(fetchStandings, refreshInterval)

    return () => clearInterval(interval)
  }, [contestId, refreshInterval])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return <Trophy className="w-4 h-4 text-gray-500" />
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
    if (rank === 3) return "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
    return "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading live standings...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>Live Standings</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </CardTitle>
        {lastUpdated && (
          <p className="text-sm text-gray-500">Last updated: {new Date(lastUpdated).toLocaleTimeString()}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {standings.map((participant) => (
            <div
              key={participant.user_id}
              className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getRankIcon(participant.live_rank)}
                  <Badge className={getRankBadge(participant.live_rank)}>#{participant.live_rank}</Badge>
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={participant.avatar_url || ""} />
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
                <div className="text-lg font-bold text-blue-600">{participant.score}</div>
                <div className="text-xs text-gray-500">
                  Joined {new Date(participant.joined_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
