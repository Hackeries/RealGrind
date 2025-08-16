"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RatingData {
  date: string
  rating: number
  contestName: string
  rank: number
  delta: number
}

interface RatingChartProps {
  userId: string
  currentRating: number
}

export default function RatingChart({ userId, currentRating }: RatingChartProps) {
  const [ratingHistory, setRatingHistory] = useState<RatingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRatingHistory = async () => {
      try {
        setError(null)
        const response = await fetch(`/api/user/rating-history?userId=${userId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch rating history")
        }

        const data = await response.json()
        setRatingHistory(data)
      } catch (error) {
        console.error("Failed to fetch rating history:", error)
        setError(error instanceof Error ? error.message : "Failed to load rating history")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchRatingHistory()
    }
  }, [userId])

  const getRatingColor = (rating: number) => {
    if (rating < 1200) return "#9CA3AF" // gray
    if (rating < 1400) return "#10B981" // green
    if (rating < 1600) return "#06B6D4" // cyan
    if (rating < 1900) return "#3B82F6" // blue
    if (rating < 2100) return "#8B5CF6" // purple
    if (rating < 2300) return "#F59E0B" // yellow
    if (rating < 2400) return "#F97316" // orange
    return "#EF4444" // red
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

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>Rating Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>Rating Progress</span>
          </CardTitle>
          <CardDescription className="text-gray-400">Your Codeforces rating progression over time</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-2">
          <AlertCircle className="w-8 h-8 text-yellow-400" />
          <p className="text-sm text-gray-400 text-center">{error}</p>
          <p className="text-xs text-gray-500">Please verify your Codeforces handle to see your rating history</p>
        </CardContent>
      </Card>
    )
  }

  if (ratingHistory.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>Rating Progress</span>
          </CardTitle>
          <CardDescription className="text-gray-400">Your Codeforces rating progression over time</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-2">
          <TrendingUp className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-400">No rating history available</p>
          <p className="text-xs text-gray-500">Participate in contests to see your rating progression</p>
        </CardContent>
      </Card>
    )
  }

  const maxRating = Math.max(...ratingHistory.map((d) => d.rating))
  const minRating = Math.min(...ratingHistory.map((d) => d.rating))
  const ratingChange =
    ratingHistory.length > 1 ? ratingHistory[ratingHistory.length - 1].rating - ratingHistory[0].rating : 0

  return (
    <Card className="bg-gray-800/50 border-gray-600">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span>Rating Progress</span>
        </CardTitle>
        <CardDescription className="text-gray-400">Your Codeforces rating progression over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold" style={{ color: getRatingColor(currentRating) }}>
              {currentRating}
            </div>
            <div className="text-xs text-gray-400">{getRatingTitle(currentRating)}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{maxRating}</div>
            <div className="text-xs text-gray-400">Peak rating</div>
          </div>
          <div>
            <div
              className={`text-2xl font-bold flex items-center justify-center space-x-1 ${
                ratingChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {ratingChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span>
                {ratingChange >= 0 ? "+" : ""}
                {ratingChange}
              </span>
            </div>
            <div className="text-xs text-gray-400">Overall change</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ratingHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <YAxis stroke="#9CA3AF" fontSize={12} domain={[minRating - 50, maxRating + 50]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                formatter={(value: number, name: string, props: any) => [
                  <span key={props.payload[0].payload.date} style={{ color: getRatingColor(value) }}>
                    {value}
                  </span>,
                  "Rating",
                ]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
