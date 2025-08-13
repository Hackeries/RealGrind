"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Target,
  Code,
  RefreshCw,
  Search,
  Filter,
  Star,
  CheckCircle,
  ExternalLink,
  Lightbulb,
  TrendingUp,
  Brain,
  AlertCircle,
  FolderSyncIcon as Sync,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Problem {
  id: string
  contest_id: string
  index: string
  name: string
  type: string
  rating: number | null
  tags: string[]
  solved_count: number
  is_solved: boolean
  difficulty_level: string
  recommendation_score?: number
  recommendation_reason?: string
}

interface ProblemFilters {
  difficulty: string
  tags: string[]
  rating: { min: number; max: number }
  solved: string
  search: string
}

export default function ProblemsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [problems, setProblems] = useState<Problem[]>([])
  const [recommendations, setRecommendations] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [filters, setFilters] = useState<ProblemFilters>({
    difficulty: "all",
    tags: [],
    rating: { min: 800, max: 3500 },
    solved: "all",
    search: "",
  })
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchUserProfile()
      fetchProblems()
      fetchRecommendations()
    }
  }, [status, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    }
  }

  const fetchProblems = async () => {
    try {
      setError(null)
      const params = new URLSearchParams({
        difficulty: filters.difficulty,
        tags: filters.tags.join(","),
        minRating: filters.rating.min.toString(),
        maxRating: filters.rating.max.toString(),
        solved: filters.solved,
        search: filters.search,
      })

      const response = await fetch(`/api/problems?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch problems: ${response.status}`)
      }
      const data = await response.json()
      setProblems(data.problems || [])
      setAvailableTags(data.availableTags || [])
    } catch (error) {
      console.error("Failed to fetch problems:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load problems"
      setError(errorMessage)
      toast({
        title: "Error loading problems",
        description: "We couldn't load the problems. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/problems/recommendations")
      if (response.ok) {
        const data = await response.json()
        setRecommendations(Array.isArray(data) ? data : data.recommendations || [])
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
    } finally {
      setRecommendationsLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      const debounceTimer = setTimeout(() => {
        setLoading(true)
        fetchProblems()
      }, 500)

      return () => clearTimeout(debounceTimer)
    }
  }, [filters, status])

  const getDifficultyColor = (rating: number | null) => {
    if (!rating) return "text-gray-600"
    if (rating < 1200) return "text-gray-600"
    if (rating < 1400) return "text-green-600"
    if (rating < 1600) return "text-cyan-600"
    if (rating < 1900) return "text-blue-600"
    if (rating < 2100) return "text-purple-600"
    if (rating < 2300) return "text-yellow-600"
    if (rating < 2400) return "text-orange-600"
    return "text-red-600"
  }

  const getDifficultyLevel = (rating: number | null) => {
    if (!rating) return "Unrated"
    if (rating < 1200) return "Beginner"
    if (rating < 1600) return "Pupil"
    if (rating < 1900) return "Specialist"
    if (rating < 2100) return "Expert"
    if (rating < 2400) return "Candidate Master"
    return "Master+"
  }

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const ProblemSkeleton = () => (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex-1 mb-4 md:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex items-center space-x-4 mb-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  )

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading problems...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RealGrind
              </h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/problems" className="text-blue-600 font-medium">
                Problems
              </Link>
              <Link href="/contests" className="text-gray-600 hover:text-blue-600">
                Contests
              </Link>
              <Link href="/leaderboard" className="text-gray-600 hover:text-blue-600">
                Leaderboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {userProfile && !userProfile.codeforces_handle && (
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <Sync className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <span>
                  Connect your Codeforces account to get personalized problem recommendations and track your progress.
                </span>
                <Link href="/profile/setup">
                  <Button size="sm" className="ml-4 bg-blue-600 hover:bg-blue-700">
                    Sync Account
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center space-x-3">
                <Target className="w-8 h-8 text-blue-600" />
                <span>Problems</span>
              </h2>
              <p className="text-gray-600">Practice competitive programming problems and improve your skills</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search problems..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 w-64 bg-white"
                />
              </div>
              <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="bg-white" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Filter Problems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <Select
                    value={filters.difficulty}
                    onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="Beginner">Beginner (800-1199)</SelectItem>
                      <SelectItem value="Pupil">Pupil (1200-1599)</SelectItem>
                      <SelectItem value="Specialist">Specialist (1600-1899)</SelectItem>
                      <SelectItem value="Expert">Expert (1900-2099)</SelectItem>
                      <SelectItem value="Candidate Master">Candidate Master (2100-2399)</SelectItem>
                      <SelectItem value="Master+">Master+ (2400+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filters.solved} onValueChange={(value) => setFilters({ ...filters, solved: value })}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Problems</SelectItem>
                      <SelectItem value="solved">Solved</SelectItem>
                      <SelectItem value="unsolved">Unsolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Min Rating</label>
                  <Input
                    type="number"
                    value={filters.rating.min}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        rating: { ...filters.rating, min: Number.parseInt(e.target.value) || 800 },
                      })
                    }
                    className="bg-white"
                    min="800"
                    max="3500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Max Rating</label>
                  <Input
                    type="number"
                    value={filters.rating.max}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        rating: { ...filters.rating, max: Number.parseInt(e.target.value) || 3500 },
                      })
                    }
                    className="bg-white"
                    min="800"
                    max="3500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 20).map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={filters.tags.includes(tag)}
                        onCheckedChange={() => handleTagToggle(tag)}
                      />
                      <label htmlFor={tag} className="text-sm capitalize cursor-pointer">
                        {tag.replace(/\s+/g, " ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations">Recommended for You</TabsTrigger>
            <TabsTrigger value="browse">Browse All Problems</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            {recommendationsLoading ? (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  <AlertDescription className="text-blue-800">
                    Analyzing your profile to find the best problems for you...
                  </AlertDescription>
                </Alert>
                {[...Array(3)].map((_, i) => (
                  <ProblemSkeleton key={i} />
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Recommendations Yet</h3>
                  <p className="text-gray-600 mb-6">
                    {!userProfile?.codeforces_handle
                      ? "Connect your Codeforces account to get personalized recommendations!"
                      : "Solve a few problems first, and we'll recommend personalized challenges to help you improve!"}
                  </p>
                  {!userProfile?.codeforces_handle ? (
                    <Link href="/profile/setup">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Sync className="w-4 h-4 mr-2" />
                        Connect Codeforces Account
                      </Button>
                    </Link>
                  ) : (
                    <Button onClick={() => setFilters({ ...filters, difficulty: "Beginner" })}>
                      <Target className="w-4 h-4 mr-2" />
                      Start with Beginner Problems
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    These problems are specially selected based on your current skill level and areas for improvement.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-6">
                  {recommendations.map((problem) => (
                    <Card key={problem.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex-1 mb-4 md:mb-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">{problem.name}</h3>
                              {problem.is_solved && <CheckCircle className="w-5 h-5 text-green-600" />}
                              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                <Star className="w-3 h-3 mr-1" />
                                Recommended
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mb-2">
                              <Badge className={`${getDifficultyColor(problem.rating)} bg-transparent border`}>
                                {problem.rating || "Unrated"}
                              </Badge>
                              <Badge variant="outline">{getDifficultyLevel(problem.rating)}</Badge>
                              <span className="text-sm text-gray-600">{problem.solved_count} solved</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {problem.tags.slice(0, 5).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            {problem.recommendation_reason && (
                              <div className="flex items-start space-x-2 mt-3 p-3 bg-blue-50 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-blue-800">{problem.recommendation_reason}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <a
                              href={`https://codeforces.com/problemset/problem/${problem.contest_id}/${problem.index}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm" className="bg-transparent">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Solve on CF
                              </Button>
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <ProblemSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Problems</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={fetchProblems} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {problems.map((problem) => (
                  <Card key={problem.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{problem.name}</h3>
                            {problem.is_solved && <CheckCircle className="w-5 h-5 text-green-600" />}
                          </div>
                          <div className="flex items-center space-x-4 mb-2">
                            <Badge className={`${getDifficultyColor(problem.rating)} bg-transparent border`}>
                              {problem.rating || "Unrated"}
                            </Badge>
                            <Badge variant="outline">{getDifficultyLevel(problem.rating)}</Badge>
                            <span className="text-sm text-gray-600">{problem.solved_count} solved</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {problem.tags.slice(0, 6).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <a
                            href={`https://codeforces.com/problemset/problem/${problem.contest_id}/${problem.index}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Solve on CF
                            </Button>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {problems.length === 0 && !loading && (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Problems Found</h3>
                      <p className="text-gray-600">Try adjusting your filters to see more problems.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
