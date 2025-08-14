"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface Problem {
  contestId?: number
  index: string
  name: string
  rating?: number
  tags: string[]
}

interface OptimisticProblemCardProps {
  problem: Problem
  isSolved?: boolean
  onSolve?: (problem: Problem) => Promise<void>
}

export function OptimisticProblemCard({ problem, isSolved = false, onSolve }: OptimisticProblemCardProps) {
  const [optimisticSolved, setOptimisticSolved] = useState(isSolved)
  const [isPending, startTransition] = useTransition()

  const handleSolve = async () => {
    if (!onSolve) return

    // Optimistic update
    setOptimisticSolved(true)

    startTransition(async () => {
      try {
        await onSolve(problem)
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticSolved(false)
        console.error("Failed to mark problem as solved:", error)
      }
    })
  }

  const getRatingColor = (rating?: number) => {
    if (!rating) return "text-gray-400"
    if (rating < 1200) return "text-gray-400"
    if (rating < 1400) return "text-green-400"
    if (rating < 1600) return "text-cyan-400"
    if (rating < 1900) return "text-blue-400"
    if (rating < 2100) return "text-purple-400"
    if (rating < 2300) return "text-orange-400"
    return "text-red-400"
  }

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-lg border-slate-700 bg-slate-800/50",
        optimisticSolved && "border-green-500/50 bg-green-900/20",
        isPending && "opacity-70",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            {optimisticSolved && <CheckCircle className="h-5 w-5 text-green-400" />}
            {problem.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {problem.rating && (
              <span className={cn("text-sm font-medium", getRatingColor(problem.rating))}>{problem.rating}</span>
            )}
            {isPending && <Clock className="h-4 w-4 text-yellow-400 animate-spin" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {problem.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300">
              {tag}
            </span>
          ))}
          {problem.tags.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300">
              +{problem.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
            <a
              href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Solve
            </a>
          </Button>

          {!optimisticSolved && onSolve && (
            <Button
              size="sm"
              variant="default"
              onClick={handleSolve}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? "Marking..." : "Mark Solved"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
