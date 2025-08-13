"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, MapPin, GraduationCap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { debounce } from "lodash"

interface College {
  id: number
  name: string
  short_name: string
  location: string
  state: string
  tier: number
  established_year: number
}

interface CollegeSelectorProps {
  onSelect: (college: College) => void
  selectedCollege?: College | null
}

export function CollegeSelector({ onSelect, selectedCollege }: CollegeSelectorProps) {
  const [colleges, setColleges] = useState<College[]>([])
  const [states, setStates] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedTier, setSelectedTier] = useState<string>("all")
  const [selectedState, setSelectedState] = useState<string>("all")

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string, tier: string, state: string) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append("search", searchTerm)
        if (tier !== "all") params.append("tier", tier)
        if (state !== "all") params.append("state", state)
        params.append("limit", "100")

        const response = await fetch(`/api/colleges?${params}`)
        const data = await response.json()
        setColleges(data.colleges || [])
      } catch (error) {
        console.error("Error searching colleges:", error)
      } finally {
        setLoading(false)
      }
    }, 300),
    [],
  )

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch("/api/colleges/states")
        const data = await response.json()
        setStates(data.states || [])
      } catch (error) {
        console.error("Error fetching states:", error)
      }
    }
    fetchStates()
  }, [])

  // Trigger search when filters change
  useEffect(() => {
    debouncedSearch(search, selectedTier, selectedState)
  }, [search, selectedTier, selectedState, debouncedSearch])

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case 2:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case 3:
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1:
        return "Tier 1"
      case 2:
        return "Tier 2"
      case 3:
        return "Tier 3"
      default:
        return "Unknown"
    }
  }

  if (selectedCollege) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">{selectedCollege.name}</h3>
                <p className="text-sm text-green-700 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {selectedCollege.location}, {selectedCollege.state}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getTierColor(selectedCollege.tier)}>{getTierLabel(selectedCollege.tier)}</Badge>
              <Button variant="outline" size="sm" onClick={() => onSelect(null as any)}>
                Change
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search colleges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedTier} onValueChange={setSelectedTier}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="1">Tier 1</SelectItem>
            <SelectItem value="2">Tier 2</SelectItem>
            <SelectItem value="3">Tier 3</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Searching colleges...</div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No colleges found. Try adjusting your search criteria.</div>
        ) : (
          colleges.map((college) => (
            <Card
              key={college.id}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onSelect(college)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{college.name}</h3>
                      {college.short_name && <span className="text-sm text-gray-500">({college.short_name})</span>}
                    </div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {college.location}, {college.state}
                      {college.established_year && <span className="ml-2">• Est. {college.established_year}</span>}
                    </p>
                  </div>
                  <Badge className={getTierColor(college.tier)}>{getTierLabel(college.tier)}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
