"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, RefreshCw, Code, AlertCircle, TrendingUp } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  name: string
  email: string
  codeforces_handle?: string
  college?: string
  college_id?: string
  rating?: number
  verified?: boolean
}

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)

  // Step 2 states
  const [codeforcesHandle, setCodeforcesHandle] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [verificationMessage, setVerificationMessage] = useState("")

  // Step 3 states
  const [colleges, setColleges] = useState<any[]>([])
  const [selectedCollege, setSelectedCollege] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchUserProfile()
      fetchColleges()
    }
  }, [status, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)

        // If user already has a complete profile, redirect to dashboard
        if (data.user?.codeforces_handle && data.user?.college && data.user?.verified) {
          router.push("/dashboard")
          return
        }

        // Set current step based on profile completion
        if (!data.user?.codeforces_handle) {
          setCurrentStep(2)
        } else if (!data.user?.college) {
          setCurrentStep(3)
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/colleges")
      if (response.ok) {
        const data = await response.json()
        setColleges(data.colleges || [])
      }
    } catch (error) {
      console.error("Failed to fetch colleges:", error)
    }
  }

  const handleCodeforcesVerification = async () => {
    if (!codeforcesHandle.trim()) return

    setVerifying(true)
    setVerificationStatus("pending")
    setVerificationMessage("Starting verification process...")

    try {
      // Start verification
      const startResponse = await fetch("/api/verify-cf/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: codeforcesHandle.trim() }),
      })

      const startData = await startResponse.json()

      if (!startResponse.ok) {
        throw new Error(startData.error || "Failed to start verification")
      }

      setVerificationMessage(`Please solve problem: ${startData.problem}`)

      // Wait a moment then check verification
      setTimeout(async () => {
        try {
          const checkResponse = await fetch("/api/verify-cf/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ handle: codeforcesHandle.trim() }),
          })

          const checkData = await checkResponse.json()

          if (checkResponse.ok && checkData.verified) {
            setVerificationStatus("success")
            setVerificationMessage("Codeforces account verified successfully!")
            setUserProfile((prev) =>
              prev ? { ...prev, codeforces_handle: codeforcesHandle.trim(), verified: true } : null,
            )
            setTimeout(() => setCurrentStep(3), 2000)
          } else {
            setVerificationStatus("error")
            setVerificationMessage(checkData.error || "Verification failed. Please try again.")
          }
        } catch (error) {
          setVerificationStatus("error")
          setVerificationMessage("Verification check failed. Please try again.")
        }
      }, 3000)
    } catch (error: any) {
      setVerificationStatus("error")
      setVerificationMessage(error.message || "Verification failed. Please try again.")
    } finally {
      setVerifying(false)
    }
  }

  const handleCompleteSetup = async () => {
    if (!selectedCollege) return

    setSavingProfile(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ college_id: selectedCollege }),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        throw new Error("Failed to save profile")
      }
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setSavingProfile(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Setting up your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              RealGrind
            </h1>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">Welcome, {session?.user?.name?.split(" ")[0]}!</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Complete Your Setup</h1>
            <p className="text-xl text-gray-300">Just a few steps to unlock your competitive programming journey</p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-8">
            {/* Step 1: Google OAuth - Completed */}
            <Card className="bg-gray-800/50 border-green-500/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">Google OAuth</h3>
                    <p className="text-green-400 font-medium">Authenticated successfully</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Codeforces API */}
            <Card
              className={`${currentStep === 2 ? "bg-purple-800/50 border-purple-500" : "bg-gray-800/50 border-gray-600"}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      verificationStatus === "success"
                        ? "bg-green-500"
                        : currentStep === 2
                          ? "bg-purple-500"
                          : "bg-gray-600"
                    }`}
                  >
                    {verificationStatus === "success" ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white font-semibold">2</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Codeforces API</h3>

                    {verificationStatus === "success" ? (
                      <p className="text-green-400 font-medium">Handle verified & synced successfully</p>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-300">Input field for CF handle + "Verify" button</p>

                        <div className="flex space-x-3">
                          <Input
                            placeholder="Enter your Codeforces handle"
                            value={codeforcesHandle}
                            onChange={(e) => setCodeforcesHandle(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            disabled={verifying}
                          />
                          <Button
                            onClick={handleCodeforcesVerification}
                            disabled={!codeforcesHandle.trim() || verifying}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify"}
                          </Button>
                        </div>

                        {verificationMessage && (
                          <div
                            className={`flex items-center space-x-2 p-3 rounded-lg ${
                              verificationStatus === "error"
                                ? "bg-red-900/50 border border-red-500/50"
                                : verificationStatus === "pending"
                                  ? "bg-yellow-900/50 border border-yellow-500/50"
                                  : "bg-blue-900/50 border border-blue-500/50"
                            }`}
                          >
                            {verificationStatus === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
                            {verificationStatus === "pending" && (
                              <RefreshCw className="w-4 h-4 animate-spin text-yellow-400" />
                            )}
                            <p
                              className={`text-sm ${
                                verificationStatus === "error"
                                  ? "text-red-300"
                                  : verificationStatus === "pending"
                                    ? "text-yellow-300"
                                    : "text-blue-300"
                              }`}
                            >
                              {verificationMessage}
                            </p>
                          </div>
                        )}

                        {verificationStatus === "success" && (
                          <div className="bg-green-900/50 border border-green-500/50 p-3 rounded-lg">
                            <p className="text-green-300 text-sm">
                              ✓ Handle verified & synced, mark step complete with green check and success text
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Progress Tracking */}
            <Card
              className={`${currentStep === 3 ? "bg-cyan-800/50 border-cyan-500" : "bg-gray-800/50 border-gray-600"}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep === 3 ? "bg-cyan-500" : "bg-gray-600"
                    }`}
                  >
                    <span className="text-white font-semibold">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Progress Tracking</h3>

                    {currentStep === 3 ? (
                      <div className="space-y-4">
                        <p className="text-gray-300">Select your college to join college-specific leaderboards</p>

                        <div className="space-y-3">
                          <select
                            value={selectedCollege}
                            onChange={(e) => setSelectedCollege(e.target.value)}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          >
                            <option value="">Select your college</option>
                            {colleges.map((college) => (
                              <option key={college.id} value={college.id}>
                                {college.name} - {college.state}
                              </option>
                            ))}
                          </select>

                          <Button
                            onClick={handleCompleteSetup}
                            disabled={!selectedCollege || savingProfile}
                            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                          >
                            {savingProfile ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                Setting up...
                              </>
                            ) : (
                              "Complete Setup & Go to Dashboard"
                            )}
                          </Button>
                        </div>

                        <div className="bg-cyan-900/50 border border-cyan-500/50 p-4 rounded-lg">
                          <p className="text-cyan-300 text-sm font-medium mb-2">
                            Preview card with "Rating increased by +XX!" from API
                          </p>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">Rating increased by +42!</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Complete previous steps to unlock</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final CTA */}
          {verificationStatus === "success" && currentStep < 3 && (
            <div className="text-center mt-8">
              <p className="text-gray-300 mb-4">
                Once Codeforces is linked, show "Start Grinding" button → redirect to /dashboard
              </p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 px-8 py-3"
              >
                Start Grinding
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
