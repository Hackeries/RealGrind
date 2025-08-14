"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Users, Clock, Target, Tags } from "lucide-react"
import { toast } from "sonner"

const COMMON_TAGS = [
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
]

interface ContestCreatorProps {
  onContestCreated?: (contest: any) => void
}

export function ContestCreator({ onContestCreated }: ContestCreatorProps) {
  const [title, setTitle] = useState("")
  const [ratingRange, setRatingRange] = useState([1200, 1600])
  const [problemCount, setProblemCount] = useState<3 | 5 | 7>(5)
  const [duration, setDuration] = useState(120)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const createContest = async () => {
    if (!title.trim()) {
      toast.error("Please enter a contest title")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/custom-contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          ratingMin: ratingRange[0],
          ratingMax: ratingRange[1],
          count: problemCount,
          duration,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create contest")
      }

      toast.success("Contest created successfully!")
      onContestCreated?.(data.contest)

      // Reset form
      setTitle("")
      setRatingRange([1200, 1600])
      setProblemCount(5)
      setDuration(120)
      setSelectedTags([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create contest")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Create Custom Contest
        </CardTitle>
        <CardDescription>
          Generate a personalized practice contest with problems matching your skill level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Contest Title</Label>
          <Input
            id="title"
            placeholder="My Practice Contest"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Rating Range: {ratingRange[0]} - {ratingRange[1]}
              </Label>
              <Slider
                value={ratingRange}
                onValueChange={setRatingRange}
                min={800}
                max={3000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Beginner (800)</span>
                <span>Expert (3000)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Problem Count
              </Label>
              <Select value={problemCount.toString()} onValueChange={(v) => setProblemCount(Number(v) as 3 | 5 | 7)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Problems (Quick)</SelectItem>
                  <SelectItem value="5">5 Problems (Standard)</SelectItem>
                  <SelectItem value="7">7 Problems (Extended)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration: {duration} minutes
              </Label>
              <Slider
                value={[duration]}
                onValueChange={([value]) => setDuration(value)}
                min={60}
                max={300}
                step={30}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Tags className="w-4 h-4" />
              Topic Tags (Optional)
            </Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {COMMON_TAGS.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  />
                  <Label htmlFor={tag} className="text-sm font-normal cursor-pointer">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button onClick={createContest} disabled={isCreating || !title.trim()} className="w-full">
          {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create Contest
        </Button>
      </CardContent>
    </Card>
  )
}
