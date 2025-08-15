"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Crown, Zap } from "lucide-react"
import { useRealtimeLeaderboard } from "@/hooks/use-realtime-firestore"
import type { UserDoc } from "@/lib/firestore/collections"

interface LiveLeaderboardProps {
  type?: "college" | "national"
  collegeId?: string
  refreshInterval?: number
}

export function LiveLeaderboard({ type = "national", collegeId }: LiveLeaderboardProps) {
  const { data: users, loading, error } = useRealtimeLeaderboard(type, collegeId)

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading live standings...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Error loading leaderboard: {error}</p>
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
            <span>Live Leaderboard</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user: UserDoc, index) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getRankIcon(index + 1)}
                  <Badge className={getRankBadge(index + 1)}>#{index + 1}</Badge>
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={`https://userpic.codeforces.org/no-title/${user.codeforcesHandle}`} />
                  <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{user.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {user.codeforcesHandle && <span>@{user.codeforcesHandle}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{user.rating || 0}</div>
                <div className="text-xs text-gray-500">{new Date(user.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
