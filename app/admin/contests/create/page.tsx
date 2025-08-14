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
import { Shield, Globe, Zap, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Problem {
  id: string
  name: string
  rating: number
  tags: string[]
  contest_id: string
}

interface NationalContestForm {
  name: string
  description: string
  difficulty_curve: string
  start_time: string
  duration_minutes: number
  registration_deadline: string
  is_rated: boolean
  max_participants: number | null
}

export default function CreateNationalContestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("details")
  const [loading, setLoading] = useState(false)
  const [generatingProblems, setGeneratingProblems] = useState(false)

  const [form, setForm] = useState<NationalContestForm>({
    name: "",
    description: "",
    difficulty_curve: "div2",
    start_time: "",
    duration_minutes: 150,
    registration_deadline: "",
    is_rated: true,
    max_participants: null,
  })

  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([])
  const [autoGenerate, setAutoGenerate] = useState(true)

  const handleFormChange = (field: keyof NationalContestForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const generateDiv2Problems = async () => {
    setGeneratingProblems(true)
    try {
      const response = await fetch("/api/admin/contests/generate-div2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty_curve: form.difficulty_curve,
          problem_count: 4,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate problems")

      const data = await response.json()
      setSelectedProblems(data.problems || [])

      toast({
        title: "Problems generated",
        description: `Generated ${data.problems?.length || 0} problems using Div.2 difficulty curve.`,
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Could not generate problems automatically. Please try manual selection.",
        variant: "destructive",
      })
    } finally {
      setGeneratingProblems(false)
    }
  }

  const createNationalContest = async () => {
    if (!form.name.trim() || !form.start_time || selectedProblems.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select problems.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/contests/national", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          problems: selectedProblems.map((p, index) => ({
            problem_id: p.id,
            problem_index: String.fromCharCode(65 + index), // A, B, C, D
            points: [500, 1000, 1500, 2000][index] || 1000, // Div.2 scoring
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to create national contest")

      const data = await response.json()

      toast({
        title: "National contest created",
        description: "The national contest has been created successfully!",
      })

      router.push(`/admin/contests/${data.contest_id}`)
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "Could not create the national contest. Please try again.",
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
            <Link href="/dashboard/admin" className="flex items-center space-x-2 text-gray-300 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Admin Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-red-400" />
            <h1 className="text-xl font-bold text-white">Create National Contest</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
              <TabsTrigger value="details" className="data-[state=active]:bg-red-600">
                Contest Details
              </TabsTrigger>
              <TabsTrigger value="problems" className="data-[state=active]:bg-red-600">
                Problem Generation
              </TabsTrigger>
              <TabsTrigger value="review" className="data-[state=active]:bg-red-600">
                Review & Create
              </TabsTrigger>
            </TabsList>

            {/* Contest Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Globe className="w-5 h-5 text-red-400" />
                    <span>National Contest Information</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Set up a nationwide competitive programming contest
                  </CardDescription>
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
                        placeholder="e.g., RealGrind National Championship #1"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty_curve" className="text-white">
                        Difficulty Curve
                      </Label>
                      <Select
                        value={form.difficulty_curve}
                        onValueChange={(value) => handleFormChange("difficulty_curve", value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="div2">Div.2 Style (Default)</SelectItem>
                          <SelectItem value="div1">Div.1 Style</SelectItem>
                          <SelectItem value="educational">Educational</SelectItem>
                          <SelectItem value="global">Global Round</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">
                      Contest Description
                    </Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      placeholder="Describe the national contest, rules, and any special announcements..."
                      className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
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
                      <Label htmlFor="registration_deadline" className="text-white">
                        Registration Deadline
                      </Label>
                      <Input
                        id="registration_deadline"
                        type="datetime-local"
                        value={form.registration_deadline}
                        onChange={(e) => handleFormChange("registration_deadline", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Rated Contest</Label>
                        <p className="text-sm text-gray-400">Contest affects participant ratings</p>
                      </div>
                      <Switch
                        checked={form.is_rated}
                        onCheckedChange={(checked) => handleFormChange("is_rated", checked)}
                      />
                    </div>
                  </div>

                  <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                    <h4 className="text-red-400 font-medium mb-2">National Contest Guidelines</h4>
                    <ul className="text-sm text-red-300 space-y-1">
                      <li>• National contests are visible to all colleges and students</li>
                      <li>• Default Div.2 difficulty curve: Easy (-200), Medium (median), Hard (+200)</li>
                      <li>• Rated contests affect national leaderboard rankings</li>
                      <li>• Registration is open to all verified students</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("problems")} className="bg-red-600 hover:bg-red-700">
                  Next: Generate Problems
                </Button>
              </div>
            </TabsContent>

            {/* Problem Generation Tab */}
            <TabsContent value="problems" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>Div.2 Problem Generation</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Automatically generate problems using the standard Div.2 difficulty curve
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-yellow-900/20 border border-yellow-500/50 p-4 rounded-lg">
                    <h4 className="text-yellow-400 font-medium mb-2">Div.2 Difficulty Curve</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-white font-medium">Problem A</p>
                        <p className="text-green-400">Easy (-200 from median)</p>
                        <p className="text-gray-400">~800-1200 rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-medium">Problem B</p>
                        <p className="text-cyan-400">Medium (median)</p>
                        <p className="text-gray-400">~1200-1600 rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-medium">Problem C</p>
                        <p className="text-blue-400">Medium (median)</p>
                        <p className="text-gray-400">~1400-1800 rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-medium">Problem D</p>
                        <p className="text-purple-400">Hard (+200 from median)</p>
                        <p className="text-gray-400">~1600-2000 rating</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={generateDiv2Problems}
                      disabled={generatingProblems}
                      size="lg"
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                    >
                      {generatingProblems ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                          Generating Div.2 Problems...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Generate Div.2 Problem Set
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Problems */}
              {selectedProblems.length > 0 && (
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Generated Problem Set</CardTitle>
                    <CardDescription className="text-gray-400">
                      Problems selected for your national contest
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedProblems.map((problem, index) => (
                        <div
                          key={problem.id}
                          className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline" className="border-red-500 text-red-400 font-bold">
                              {String.fromCharCode(65 + index)}
                            </Badge>
                            <div>
                              <h5 className="font-medium text-white">{problem.name}</h5>
                              <p className="text-sm text-gray-400">{problem.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className={`${getRatingColor(problem.rating)} border-current`}>
                              {problem.rating}
                            </Badge>
                            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                              {[500, 1000, 1500, 2000][index]} pts
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("details")}
                  className="border-gray-600 text-gray-300"
                >
                  Previous: Contest Details
                </Button>
                <Button
                  onClick={() => setActiveTab("review")}
                  disabled={selectedProblems.length === 0}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Next: Review & Create
                </Button>
              </div>
            </TabsContent>

            {/* Review Tab */}
            <TabsContent value="review" className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">National Contest Review</CardTitle>
                  <CardDescription className="text-gray-400">
                    Review all details before creating the national contest
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Contest Information</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-300">
                            <span className="text-gray-400">Name:</span> {form.name}
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-400">Difficulty:</span> {form.difficulty_curve}
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-400">Duration:</span> {form.duration_minutes} minutes
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-400">Start:</span> {new Date(form.start_time).toLocaleString()}
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-400">Rated:</span> {form.is_rated ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">Problem Set ({selectedProblems.length})</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedProblems.map((problem, index) => (
                          <div key={problem.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">
                              {String.fromCharCode(65 + index)}. {problem.name}
                            </span>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className={`${getRatingColor(problem.rating)} border-current text-xs`}
                              >
                                {problem.rating}
                              </Badge>
                              <Badge variant="outline" className="border-yellow-500 text-yellow-400 text-xs">
                                {[500, 1000, 1500, 2000][index]}
                              </Badge>
                            </div>
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

                  <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                    <h4 className="text-red-400 font-medium mb-2">Final Confirmation</h4>
                    <p className="text-red-300 text-sm">
                      This will create a national contest visible to all students across all colleges. The contest will
                      be rated and affect national leaderboard rankings.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("problems")}
                  className="border-gray-600 text-gray-300"
                >
                  Previous: Problem Generation
                </Button>
                <Button
                  onClick={createNationalContest}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Creating National Contest...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      Create National Contest
                    </>
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
