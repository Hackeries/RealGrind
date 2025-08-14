"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Clock, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface Contest {
  id: number
  name: string
  startTimeSeconds: number
  durationSeconds: number
  phase: string
}

interface MobileContestTimerProps {
  contests: Contest[]
  className?: string
}

export function MobileContestTimer({ contests, className }: MobileContestTimerProps) {
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const upcomingContest = contests
    .filter((c) => c.phase === "BEFORE" && c.startTimeSeconds)
    .sort((a, b) => a.startTimeSeconds! - b.startTimeSeconds!)[0]

  if (!upcomingContest) return null

  const timeUntilStart = upcomingContest.startTimeSeconds! * 1000 - currentTime
  const isStartingSoon = timeUntilStart < 3600000 // 1 hour

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    return `${minutes}m ${seconds}s`
  }

  return (
    <Card
      className={cn(
        "sticky top-4 z-50 border-slate-700 bg-slate-800/95 backdrop-blur-sm",
        isStartingSoon && "border-orange-500/50 bg-orange-900/20",
        className,
      )}
    >
      <div className="p-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-full", isStartingSoon ? "bg-orange-500/20" : "bg-blue-500/20")}>
            {isStartingSoon ? (
              <Clock className="h-4 w-4 text-orange-400" />
            ) : (
              <Calendar className="h-4 w-4 text-blue-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{upcomingContest.name}</p>
            <p className={cn("text-xs", isStartingSoon ? "text-orange-400" : "text-slate-400")}>
              {timeUntilStart > 0 ? `Starts in ${formatTime(timeUntilStart)}` : "Starting now!"}
            </p>
          </div>

          {isStartingSoon && <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />}
        </div>
      </div>
    </Card>
  )
}
