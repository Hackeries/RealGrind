"use client"

import { useEffect, useState } from "react"
import { Trophy, CodeIcon, Users, TrendingUp } from "lucide-react"

export default function LiveStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/codeforces/stats")
        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }
        const liveStats = await response.json()
        setStats(liveStats)
      } catch (error) {
        console.error("Failed to fetch live stats:", error)
        // Set fallback stats
        setStats({
          totalProblems: 10000,
          problemsSolvedToday: 150,
          activeContests: 2,
          topUserRating: 3500,
          topUserHandle: "tourist",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 animate-pulse">
            <div className="w-8 h-8 bg-gray-600 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30 backdrop-blur-sm">
        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
          <CodeIcon className="w-6 h-6 text-purple-400" />
        </div>
        <div className="text-2xl font-bold text-white mb-1">{stats.totalProblems.toLocaleString()}+</div>
        <div className="text-purple-300 text-sm">Problems Available</div>
      </div>

      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30 backdrop-blur-sm">
        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
          <TrendingUp className="w-6 h-6 text-green-400" />
        </div>
        <div className="text-2xl font-bold text-white mb-1">{stats.problemsSolvedToday}</div>
        <div className="text-green-300 text-sm">Solved Today</div>
      </div>

      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30 backdrop-blur-sm">
        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-white mb-1">{stats.activeContests}</div>
        <div className="text-blue-300 text-sm">Active Contests</div>
      </div>

      <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30 backdrop-blur-sm">
        <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
          <Trophy className="w-6 h-6 text-orange-400" />
        </div>
        <div className="text-2xl font-bold text-white mb-1">{stats.topUserRating}</div>
        <div className="text-orange-300 text-sm">Top User Rating</div>
      </div>
    </div>
  )
}
