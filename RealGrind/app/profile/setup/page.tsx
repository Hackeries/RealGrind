"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CollegeSelector } from "@/components/college-selector"
import { Code, CheckCircle, AlertCircle, RefreshCw, GraduationCap, User } from "lucide-react"
import Link from "next/link"

interface College {
  id: number
  name: string
  short_name: string
  location: string
  state: string
  tier: number
  established_year: number
}

export default function ProfileSetupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    codeforcesHandle: "",
    college: null as College | null,
    graduationYear: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const handleNext = () => {
    if (currentStep === 1 && !formData.codeforcesHandle) {
      setError("Please enter your Codeforces handle")
      return
    }
    if (currentStep === 2 && !formData.college) {
      setError("Please select your college")
      return
    }
    setError("")
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    setError("")
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const updateResponse = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeforcesHandle: formData.codeforcesHandle,
          collegeId: formData.college?.id,
          graduationYear: formData.graduationYear ? Number.parseInt(formData.graduationYear) : null,
        }),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/verify-cf")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Profile Setup Complete!</h2>
            <p className="text-gray-600 mb-4">Great! Now let's verify your Codeforces handle to unlock all features.</p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Next:</strong> We'll ask you to submit a simple compilation error to verify account ownership.
              </p>
            </div>
            <p className="text-sm text-gray-500">Redirecting to verification...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RealGrind
            </h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  <User className="w-4 h-4" />
                </div>
                <span className="font-medium">Basic Info</span>
              </div>
              <div className={`w-8 h-1 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-medium">College</span>
              </div>
              <div className={`w-8 h-1 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"}`} />
              <div className={`flex items-center space-x-2 ${currentStep >= 3 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="font-medium">Complete</span>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">
                {currentStep === 1 && "Basic Information"}
                {currentStep === 2 && "Select Your College"}
                {currentStep === 3 && "Final Details"}
              </CardTitle>
              <CardDescription className="text-lg">
                {currentStep === 1 && "Let's start with your Codeforces handle"}
                {currentStep === 2 && "Choose your college from our comprehensive database"}
                {currentStep === 3 && "Add your graduation year to complete setup"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="codeforcesHandle">Codeforces Handle *</Label>
                    <Input
                      id="codeforcesHandle"
                      type="text"
                      placeholder="Enter your Codeforces username"
                      value={formData.codeforcesHandle}
                      onChange={(e) => setFormData({ ...formData, codeforcesHandle: e.target.value })}
                      required
                      className="text-lg py-3"
                    />
                    <p className="text-sm text-gray-500">
                      We'll verify this handle and sync your submissions, ratings, and contest history.
                    </p>
                  </div>

                  <Button
                    onClick={handleNext}
                    disabled={!formData.codeforcesHandle}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Select Your College *</Label>
                    <CollegeSelector
                      onSelect={(college) => setFormData({ ...formData, college })}
                      selectedCollege={formData.college}
                    />
                    <p className="text-sm text-gray-500">
                      Choose from our database of Indian engineering colleges. This helps us create accurate college
                      rankings.
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!formData.college}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Select
                      value={formData.graduationYear}
                      onValueChange={(value) => setFormData({ ...formData, graduationYear: value })}
                    >
                      <SelectTrigger className="text-lg py-3">
                        <SelectValue placeholder="Select graduation year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i - 2
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      This helps us group you with peers and track graduation cohorts.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h3 className="font-medium text-gray-900">Summary</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Codeforces Handle:</strong> {formData.codeforcesHandle}
                      </p>
                      <p>
                        <strong>College:</strong> {formData.college?.name}
                      </p>
                      <p>
                        <strong>Location:</strong> {formData.college?.location}, {formData.college?.state}
                      </p>
                      {formData.graduationYear && (
                        <p>
                          <strong>Graduation Year:</strong> {formData.graduationYear}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        "Complete Setup"
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
