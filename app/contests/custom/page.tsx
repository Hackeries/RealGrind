"use client"

import { useAuth } from "@/components/providers"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Code, Zap, Target, Users, Share2, RefreshCw, AlertCircle, CheckCircle, Lightbulb } from "lucide-react"
import Link from "next/link"

const PROBLEM_TAGS = [
  "implementation",
  "math",
  "greedy",
  "dp",
  "data structures",
  "brute force",
  "constructive algorithms",
  "graphs",
  "sortings",
  "binary search",
  "dfs and similar",
  "trees",
  "strings",
  "number theory",
  "combinatorics",
  "geometry",
  "bitmasks",
  "two pointers",
  "dsu",
  "shortest paths",
  "probabilities",
  "divide and conquer",
  "hashing",
  "games",
  "flows",
  "interactive",
  "matrices",
  "string suffix structures",
]

interface CustomContest {
  id: string
  name: string
  problems: Array<{
    contestId: number
    index: string
    name: string
    rating: number
    tags: string[]
  }>
  ratingRange: { min: number; max: number }
  problemCount: number
  selectedTags: string[]
  createdAt: string
  shareLink?: string
  participants: number
}

export default function CustomPracticeContestsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [contests, setContests] = useState<CustomContest[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [ratingMin, setRatingMin] = useState(1200)
  const [ratingMax, setRatingMax] = useState(1400)
  const [problemCount, setProblemCount] = useState(5)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [contestName, setContestName] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
      return
    }

    if (user) {
      fetchMyContests()
    }
  }, [authLoading, user, router])

  const fetchMyContests = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/contests/custom")
      if (response.ok) {
        const data = await response.json()
        setContests(data.contests || [])
      }
    } catch (error) {
      console.error("Failed to fetch custom contests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateContest = async () => {
    if (!contestName.trim()) {
      setError("Please enter a contest name")
      return
    }

    setCreating(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/contests/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contestName,
          ratingRange: { min: ratingMin, max: ratingMax },
          problemCount,
          tags: selectedTags,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create contest")
      }

      const result = await response.json()
      setSuccess(`Contest "${contestName}" created successfully!`)
      setContestName("")
      setSelectedTags([])
      await fetchMyContests()

      // Redirect to the new contest
      router.push(`/contests/custom/${result.contestId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contest")
    } finally {
      setCreating(false)
    }
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

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
              <Link href="/contests/custom" className="text-purple-400 font-medium">
                Practice
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
          <h2 className="text-4xl font-bold text-white mb-2">Custom Practice Contests</h2>
          <p className="text-xl text-gray-300">
            Create personalized practice sessions with problems matching your skill level
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contest Creator */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-600 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Zap className="w-5 h-5 text-green-400" />
                  <span>Create Practice Contest</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Generate a custom contest with problems from Codeforces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contest Name */}
                <div className="space-y-2">
                  <Label htmlFor="contestName" className="text-white">
                    Contest Name
                  </Label>
                  <Input
                    id="contestName"
                    placeholder="My Practice Session"
                    value={contestName}
                    onChange={(e) => setContestName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                {/* Rating Range */}
                <div className="space-y-4">
                  <Label className="text-white">Rating Range</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ratingMin" className="text-sm text-gray-400">
                        Min Rating
                      </Label>
                      <Input
                        id="ratingMin"
                        type="number"
                        min="800"
                        max="3500"
                        step="100"
                        value={ratingMin}
                        onChange={(e) => setRatingMin(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ratingMax" className="text-sm text-gray-400">
                        Max Rating
                      </Label>
                      <Input
                        id="ratingMax"
                        type="number"
                        min="800"
                        max="3500"
                        step="100"
                        value={ratingMax}
                        onChange={(e) => setRatingMax(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Problems will be selected from {ratingMin} to {ratingMax} rating
                  </div>
                </div>

                {/* Problem Count */}
                <div className="space-y-2">
                  <Label className="text-white">Number of Problems</Label>
                  <Select value={problemCount.toString()} onValueChange={(value) => setProblemCount(Number(value))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Problems</SelectItem>
                      <SelectItem value="5">5 Problems</SelectItem>
                      <SelectItem value="7">7 Problems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags Filter */}
                <div className="space-y-3">
                  <Label className="text-white">Problem Tags (Optional)</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {PROBLEM_TAGS.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <Label htmlFor={tag} className="text-sm text-gray-300 capitalize">
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-purple-400 text-purple-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleCreateContest}
                  disabled={creating || !contestName.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating Contest...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Create Practice Contest
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* My Contests */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span>My Practice Contests</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your custom practice sessions and shared contests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-gray-700 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : contests.length === 0 ? (
                  <div className="text-center py-12">
                    <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Practice Contests Yet</h3>
                    <p className="text-gray-400 mb-6">
                      Create your first custom practice contest to start improving your skills
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>• Select problems based on your rating range</p>
                      <p>• Filter by specific topics you want to practice</p>
                      <p>• Share with friends for friendly competition</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contests.map((contest) => (
                      <Card
                        key={contest.id}
                        className="bg-gray-700/50 border-gray-600 hover:bg-gray-700/70 transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">{contest.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>{contest.problemCount} problems</span>
                                <span className={getRatingColor(contest.ratingRange.min)}>
                                  {contest.ratingRange.min}-{contest.ratingRange.max}
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>{contest.participants} participants</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {contest.shareLink && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600 text-gray-300 hover:bg-gray-600 bg-transparent"
                                  onClick={() => navigator.clipboard.writeText(contest.shareLink!)}
                                >
                                  <Share2 className="w-4 h-4 mr-1" />
                                  Share
                                </Button>
                              )}
                              <Link href={`/contests/custom/${contest.id}`}>
                                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                                  View Contest
                                </Button>
                              </Link>
                            </div>
                          </div>

                          {contest.selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {contest.selectedTags.slice(0, 5).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs border-gray-500 text-gray-400">
                                  {tag}
                                </Badge>
                              ))}
                              {contest.selectedTags.length > 5 && (
                                <Badge variant="outline" className="text-xs border-gray-500 text-gray-400">
                                  +{contest.selectedTags.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
