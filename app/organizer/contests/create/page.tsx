"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Code, Target, Zap, Plus, Trash2, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Problem {
  id: string
  name: string
  rating: number
  tags: string[]
  contest_id: string
}

interface ContestForm {
  name: string
  description: string
  difficulty_level: string
  start_time: string
  duration_minutes: number
  max_participants: number | null
  is_college_specific: boolean
  is_public: boolean
  registration_deadline: string
}

export default function CreateContestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [loading, setLoading] = useState(false)
  const [searchingProblems, setSearchingProblems] = useState(false)

  const [form, setForm] = useState<ContestForm>({
    name: "",
    description: "",
    difficulty_level: "mixed",
    start_time: "",
    duration_minutes: 120,
    max_participants: null,
    is_college_specific: true,
    is_public: true,
    registration_deadline: "",
  })

  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([])
  const [problemSearch, setProblemSearch] = useState("")
  const [availableProblems, setAvailableProblems] = useState<Problem[]>([])
  const [autoGenerate, setAutoGenerate] = useState(false)
  const [autoSettings, setAutoSettings] = useState({
    problem_count: 5,
    min_rating: 1200,
    max_rating: 1800,
    exclude_solved: true,
    tag_diversity: true,
  })

  const handleFormChange = (field: keyof ContestForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const searchProblems = async () => {
    if (!problemSearch.trim()) return

    setSearchingProblems(true)
    try {
      const response = await fetch(`/api/problems/search?q=${encodeURIComponent(problemSearch)}&limit=20`)
      if (!response.ok) throw new Error("Failed to search problems")

      const data = await response.json()
      setAvailableProblems(data.problems || [])
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not search for problems. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSearchingProblems(false)
    }
  }

  const addProblem = (problem: Problem) => {
    if (!selectedProblems.find((p) => p.id === problem.id)) {
      setSelectedProblems((prev) => [...prev, problem])
    }
  }

  const removeProblem = (problemId: string) => {
    setSelectedProblems((prev) => prev.filter((p) => p.id !== problemId))
  }

  const generateAutoProblems = async () => {
    setSearchingProblems(true)
    try {
      const response = await fetch("/api/organizer/contests/auto-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(autoSettings),
      })

      if (!response.ok) throw new Error("Failed to generate problems")

      const data = await response.json()
      setSelectedProblems(data.problems || [])

      toast({
        title: "Problems generated",
        description: `Generated ${data.problems?.length || 0} problems based on your criteria.`,
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Could not generate problems automatically. Please try manual selection.",
        variant: "destructive",
      })
    } finally {
      setSearchingProblems(false)
    }
  }

  const createContest = async () => {
    if (!form.name.trim() || !form.start_time || selectedProblems.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select at least one problem.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/organizer/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          problems: selectedProblems.map((p, index) => ({
            problem_id: p.id,
            problem_index: String.fromCharCode(65 + index), // A, B, C, etc.
            points: 100,
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to create contest")

      const data = await response.json()

      toast({
        title: "Contest created",
        description: "Your contest has been created successfully!",
      })

      router.push(`/organizer/contests/${data.contest_id}`)
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "Could not create the contest. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating < 1200) return "text-gray-400"
    if (rating < 1400) return "text-green-400"
    if (rating < 1600) return "text-cyan-400"
    if (rating < 1900) return "text-blue-400"
    if (rating < 2100) return "text-purple-400"
    if (rating < 2300) return "text-yellow-400"
    return "text-orange-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/organizer" className="flex items-center space-x-2 text-gray-300 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Code className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white">Create Contest</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
              <TabsTrigger value="details" className="data-[state=active]:bg-purple-600">
                Contest Details
              </TabsTrigger>
              <TabsTrigger value="problems" className="data-[state=active]:bg-purple-600">
                Problem Selection
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
                Settings & Review
              </TabsTrigger>
            </TabsList>

            {/* Contest Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Basic Information</CardTitle>
                  <CardDescription className="text-gray-400">Set up the basic details for your contest</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">
                        Contest Name *
                      </Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                        placeholder="e.g., Weekly Programming Contest #1"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty" className="text-white">
                        Difficulty Level
                      </Label>
                      <Select
                        value={form.difficulty_level}
                        onValueChange={(value) => handleFormChange("difficulty_level", value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="beginner">Beginner (800-1200)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (1200-1600)</SelectItem>
                          <SelectItem value="advanced">Advanced (1600+)</SelectItem>
                          <SelectItem value="mixed">Mixed Difficulty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      placeholder="Describe your contest, rules, and any special instructions..."
                      className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time" className="text-white">
                        Start Time *
                      </Label>
                      <Input
                        id="start_time"
                        type="datetime-local"
                        value={form.start_time}
                        onChange={(e) => handleFormChange("start_time", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-white">
                        Duration (minutes)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={form.duration_minutes}
                        onChange={(e) => handleFormChange("duration_minutes", Number.parseInt(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_participants" className="text-white">
                        Max Participants
                      </Label>
                      <Input
                        id="max_participants"
                        type="number"
                        value={form.max_participants || ""}
                        onChange={(e) =>
                          handleFormChange("max_participants", e.target.value ? Number.parseInt(e.target.value) : null)
                        }
                        placeholder="Unlimited"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">College-Specific Contest</Label>
                        <p className="text-sm text-gray-400">Only students from your college can participate</p>
                      </div>
                      <Switch
                        checked={form.is_college_specific}
                        onCheckedChange={(checked) => handleFormChange("is_college_specific", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Public Contest</Label>
                        <p className="text-sm text-gray-400">Contest appears in public listings</p>
                      </div>
                      <Switch
                        checked={form.is_public}
                        onCheckedChange={(checked) => handleFormChange("is_public", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("problems")} className="bg-purple-600 hover:bg-purple-700">
                  Next: Select Problems
                </Button>
              </div>
            </TabsContent>

            {/* Problem Selection Tab */}
            <TabsContent value="problems" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Problem Selection Mode</CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose how you want to select problems for your contest
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <Button
                      variant={!autoGenerate ? "default" : "outline"}
                      onClick={() => setAutoGenerate(false)}
                      className={!autoGenerate ? "bg-purple-600" : "border-gray-600 text-gray-300"}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Manual Selection
                    </Button>
                    <Button
                      variant={autoGenerate ? "default" : "outline"}
                      onClick={() => setAutoGenerate(true)}
                      className={autoGenerate ? "bg-purple-600" : "border-gray-600 text-gray-300"}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Auto Generate
                    </Button>
                  </div>

                  {autoGenerate ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Problem Count</Label>
                          <Input
                            type="number"
                            value={autoSettings.problem_count}
                            onChange={(e) =>
                              setAutoSettings((prev) => ({ ...prev, problem_count: Number.parseInt(e.target.value) }))
                            }
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Min Rating</Label>
                          <Input
                            type="number"
                            value={autoSettings.min_rating}
                            onChange={(e) =>
                              setAutoSettings((prev) => ({ ...prev, min_rating: Number.parseInt(e.target.value) }))
                            }
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Max Rating</Label>
                          <Input
                            type="number"
                            value={autoSettings.max_rating}
                            onChange={(e) =>
                              setAutoSettings((prev) => ({ ...prev, max_rating: Number.parseInt(e.target.value) }))
                            }
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Actions</Label>
                          <Button
                            onClick={generateAutoProblems}
                            disabled={searchingProblems}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {searchingProblems ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Generate"}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-white">Exclude Solved Problems</Label>
                          <Switch
                            checked={autoSettings.exclude_solved}
                            onCheckedChange={(checked) =>
                              setAutoSettings((prev) => ({ ...prev, exclude_solved: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-white">Ensure Tag Diversity</Label>
                          <Switch
                            checked={autoSettings.tag_diversity}
                            onCheckedChange={(checked) =>
                              setAutoSettings((prev) => ({ ...prev, tag_diversity: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          value={problemSearch}
                          onChange={(e) => setProblemSearch(e.target.value)}
                          placeholder="Search problems by name, ID, or tags..."
                          className="bg-gray-700 border-gray-600 text-white"
                          onKeyPress={(e) => e.key === "Enter" && searchProblems()}
                        />
                        <Button
                          onClick={searchProblems}
                          disabled={searchingProblems}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {searchingProblems ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Search"}
                        </Button>
                      </div>

                      {availableProblems.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-white font-medium">Available Problems</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                            {availableProblems.map((problem) => (
                              <div
                                key={problem.id}
                                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <h5 className="font-medium text-white truncate">{problem.name}</h5>
                                  <p className="text-sm text-gray-400">{problem.id}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant="outline"
                                    className={`${getRatingColor(problem.rating)} border-current`}
                                  >
                                    {problem.rating}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    onClick={() => addProblem(problem)}
                                    disabled={selectedProblems.some((p) => p.id === problem.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Selected Problems */}
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Selected Problems ({selectedProblems.length})</CardTitle>
                  <CardDescription className="text-gray-400">
                    Problems that will be included in your contest
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedProblems.length > 0 ? (
                    <div className="space-y-2">
                      {selectedProblems.map((problem, index) => (
                        <div
                          key={problem.id}
                          className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="border-purple-500 text-purple-400">
                              {String.fromCharCode(65 + index)}
                            </Badge>
                            <div>
                              <h5 className="font-medium text-white">{problem.name}</h5>
                              <p className="text-sm text-gray-400">{problem.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`${getRatingColor(problem.rating)} border-current`}>
                              {problem.rating}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeProblem(problem.id)}
                              className="border-red-500 text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">No problems selected</p>
                      <p className="text-sm text-gray-500">Search and add problems or use auto-generation</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("details")}
                  className="border-gray-600 text-gray-300"
                >
                  Previous: Contest Details
                </Button>
                <Button
                  onClick={() => setActiveTab("settings")}
                  disabled={selectedProblems.length === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Next: Review & Create
                </Button>
              </div>
            </TabsContent>

            {/* Settings & Review Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Contest Review</CardTitle>
                  <CardDescription className="text-gray-400">
                    Review your contest details before creating
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Basic Information</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-300">
                            <span className="text-gray-400">Name:</span> {form.name}
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-400">Difficulty:</span> {form.difficulty_level}
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-400">Duration:</span> {form.duration_minutes} minutes
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-400">Start:</span> {new Date(form.start_time).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-white mb-2">Settings</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-300">
                            <span className="text-gray-400">College-specific:</span>{" "}
                            {form.is_college_specific ? "Yes" : "No"}
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-400">Public:</span> {form.is_public ? "Yes" : "No"}
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-400">Max participants:</span>{" "}
                            {form.max_participants || "Unlimited"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">Problems ({selectedProblems.length})</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedProblems.map((problem, index) => (
                          <div key={problem.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">
                              {String.fromCharCode(65 + index)}. {problem.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={`${getRatingColor(problem.rating)} border-current text-xs`}
                            >
                              {problem.rating}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {form.description && (
                    <div>
                      <h4 className="font-medium text-white mb-2">Description</h4>
                      <p className="text-gray-300 text-sm bg-gray-700/50 p-3 rounded-lg">{form.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("problems")}
                  className="border-gray-600 text-gray-300"
                >
                  Previous: Problem Selection
                </Button>
                <Button
                  onClick={createContest}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Creating Contest...
                    </>
                  ) : (
                    "Create Contest"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
