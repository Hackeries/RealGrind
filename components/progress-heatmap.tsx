"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, AlertCircle } from "lucide-react"

interface HeatmapData {
  date: string
  count: number
  level: number // 0-4 intensity level
}

interface ProgressHeatmapProps {
  userId: string
}

export default function ProgressHeatmap({ userId }: ProgressHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setError(null)
        const response = await fetch(`/api/user/heatmap?userId=${userId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch heatmap data")
        }

        const data = await response.json()
        setHeatmapData(data)
      } catch (error) {
        console.error("Failed to fetch heatmap data:", error)
        setError(error instanceof Error ? error.message : "Failed to load heatmap data")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchHeatmapData()
    }
  }, [userId])

  const getIntensityColor = (level: number) => {
    const colors = [
      "bg-gray-800", // 0 - no activity
      "bg-green-900", // 1 - low activity
      "bg-green-700", // 2 - medium activity
      "bg-green-500", // 3 - high activity
      "bg-green-300", // 4 - very high activity
    ]
    return colors[level] || colors[0]
  }

  const getDayOfWeek = (dateStr: string) => {
    return new Date(dateStr).getDay()
  }

  const getWeeksData = () => {
    const weeks: HeatmapData[][] = []
    let currentWeek: HeatmapData[] = []

    heatmapData.forEach((day, index) => {
      if (index === 0) {
        const dayOfWeek = getDayOfWeek(day.date)
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: "", count: 0, level: 0 })
        }
      }

      currentWeek.push(day)

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: "", count: 0, level: 0 })
      }
      weeks.push(currentWeek)
    }

    return weeks
  }

  const calculateCurrentStreak = () => {
    let streak = 0
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].count > 0) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const calculateLongestStreak = () => {
    let maxStreak = 0
    let currentStreak = 0

    heatmapData.forEach((day) => {
      if (day.count > 0) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    })

    return maxStreak
  }

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Calendar className="w-5 h-5 text-green-400" />
            <span>Progress Heatmap</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-700 rounded"></div>
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
            <Calendar className="w-5 h-5 text-green-400" />
            <span>Progress Heatmap</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your daily problem solving activity over the past year
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
          <AlertCircle className="w-8 h-8 text-yellow-400" />
          <p className="text-sm text-gray-400 text-center">{error}</p>
          <p className="text-xs text-gray-500">Please verify your Codeforces handle to see your progress</p>
        </CardContent>
      </Card>
    )
  }

  if (heatmapData.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Calendar className="w-5 h-5 text-green-400" />
            <span>Progress Heatmap</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your daily problem solving activity over the past year
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
          <Calendar className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-400">No activity data available</p>
          <p className="text-xs text-gray-500">Start solving problems to see your progress here</p>
        </CardContent>
      </Card>
    )
  }

  const weeks = getWeeksData()
  const totalSolved = heatmapData.reduce((sum, day) => sum + day.count, 0)
  const currentStreak = calculateCurrentStreak()
  const longestStreak = calculateLongestStreak()

  return (
    <Card className="bg-gray-800/50 border-gray-600">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Calendar className="w-5 h-5 text-green-400" />
          <span>Progress Heatmap</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your daily problem solving activity over the past year
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">{totalSolved}</div>
            <div className="text-xs text-gray-400">Problems this year</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{currentStreak}</div>
            <div className="text-xs text-gray-400">Current streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{longestStreak}</div>
            <div className="text-xs text-gray-400">Longest streak</div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col space-y-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm ${day.date ? getIntensityColor(day.level) : "bg-transparent"}`}
                    title={day.date ? `${day.date}: ${day.count} problems solved` : ""}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}
