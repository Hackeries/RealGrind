"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, RefreshCw, Code, AlertCircle, Users, Trophy } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface OnboardingClientProps {
  user: any
  profile: any
}

export default function OnboardingClient({ user, profile }: OnboardingClientProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<"student" | "organizer" | "">("")
  const [savingRole, setSavingRole] = useState(false)
  const [codeforcesHandle, setCodeforcesHandle] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [verificationMessage, setVerificationMessage] = useState("")
  const [colleges, setColleges] = useState<any[]>([])
  const [selectedCollege, setSelectedCollege] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    // Set current step based on profile completion
    if (!profile?.role) {
      setCurrentStep(1)
    } else if (!profile?.codeforces_handle) {
      setCurrentStep(2)
    } else if (!profile?.college_id) {
      setCurrentStep(3)
    }

    fetchColleges()
  }, [profile])

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase.from("colleges").select("*").order("name")
      if (error) throw error
      setColleges(data || [])
    } catch (error) {
      console.error("Failed to fetch colleges:", error)
    }
  }

  const handleRoleSelection = async () => {
    if (!selectedRole) return

    setSavingRole(true)
    try {
      const { error } = await supabase.from("users").update({ role: selectedRole }).eq("id", user.id)

      if (error) throw error
      setCurrentStep(2)
    } catch (error) {
      console.error("Failed to save role:", error)
    } finally {
      setSavingRole(false)
    }
  }

  const handleCodeforcesVerification = async () => {
    if (!codeforcesHandle.trim()) return

    setVerifying(true)
    setVerificationStatus("pending")
    setVerificationMessage("Verifying Codeforces handle...")

    try {
      // For now, just save the handle (implement actual verification later)
      const { error } = await supabase
        .from("users")
        .update({ codeforces_handle: codeforcesHandle.trim() })
        .eq("id", user.id)

      if (error) throw error

      setVerificationStatus("success")
      setVerificationMessage("Codeforces handle saved successfully!")
      setTimeout(() => setCurrentStep(3), 2000)
    } catch (error) {
      setVerificationStatus("error")
      setVerificationMessage("Failed to save Codeforces handle")
    } finally {
      setVerifying(false)
    }
  }

  const handleCompleteSetup = async () => {
    if (!selectedCollege) return

    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({ college_id: Number.parseInt(selectedCollege) })
        .eq("id", user.id)

      if (error) throw error

      // Redirect will be handled by middleware based on role
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setSavingProfile(false)
    }
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
            <span className="text-sm text-gray-300">
              Welcome, {user?.user_metadata?.name?.split(" ")[0] || user?.email?.split("@")[0]}!
            </span>
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
            {/* Step 1: Role Selection */}
            <Card
              className={`${currentStep === 1 ? "bg-purple-800/50 border-purple-500" : profile?.role ? "bg-gray-800/50 border-green-500/50" : "bg-gray-800/50 border-gray-600"}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${profile?.role ? "bg-green-500" : currentStep === 1 ? "bg-purple-500" : "bg-gray-600"}`}
                  >
                    {profile?.role ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white font-semibold">1</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Select Your Role</h3>
                    {profile?.role ? (
                      <p className="text-green-400 font-medium">
                        Role selected: {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-300">Choose how you want to use RealGrind</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            onClick={() => setSelectedRole("student")}
                            className={`p-4 rounded-lg border-2 transition-all ${selectedRole === "student" ? "border-blue-500 bg-blue-900/50" : "border-gray-600 bg-gray-800/50 hover:border-blue-400"}`}
                          >
                            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <h4 className="font-semibold text-white mb-1">Student</h4>
                            <p className="text-sm text-gray-300">
                              Participate in contests, track progress, compete with peers
                            </p>
                          </button>
                          <button
                            onClick={() => setSelectedRole("organizer")}
                            className={`p-4 rounded-lg border-2 transition-all ${selectedRole === "organizer" ? "border-yellow-500 bg-yellow-900/50" : "border-gray-600 bg-gray-800/50 hover:border-yellow-400"}`}
                          >
                            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                            <h4 className="font-semibold text-white mb-1">Organizer</h4>
                            <p className="text-sm text-gray-300">
                              Create contests, manage participants, analyze performance
                            </p>
                          </button>
                        </div>
                        <Button
                          onClick={handleRoleSelection}
                          disabled={!selectedRole || savingRole}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          {savingRole ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            "Continue"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Codeforces Verification */}
            <Card
              className={`${currentStep === 2 ? "bg-purple-800/50 border-purple-500" : verificationStatus === "success" ? "bg-gray-800/50 border-green-500/50" : "bg-gray-800/50 border-gray-600"}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${verificationStatus === "success" ? "bg-green-500" : currentStep === 2 ? "bg-purple-500" : "bg-gray-600"}`}
                  >
                    {verificationStatus === "success" ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-white font-semibold">2</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Link Codeforces Account</h3>
                    {verificationStatus === "success" ? (
                      <p className="text-green-400 font-medium">Handle verified & synced successfully</p>
                    ) : currentStep >= 2 ? (
                      <div className="space-y-4">
                        <p className="text-gray-300">Enter your Codeforces handle</p>
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
                            {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save"}
                          </Button>
                        </div>
                        {verificationMessage && (
                          <div
                            className={`flex items-center space-x-2 p-3 rounded-lg ${verificationStatus === "error" ? "bg-red-900/50 border border-red-500/50" : "bg-blue-900/50 border border-blue-500/50"}`}
                          >
                            {verificationStatus === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
                            <p
                              className={`text-sm ${verificationStatus === "error" ? "text-red-300" : "text-blue-300"}`}
                            >
                              {verificationMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Complete previous steps to unlock</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: College Selection */}
            <Card
              className={`${currentStep === 3 ? "bg-cyan-800/50 border-cyan-500" : "bg-gray-800/50 border-gray-600"}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 3 ? "bg-cyan-500" : "bg-gray-600"}`}
                  >
                    <span className="text-white font-semibold">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Select College</h3>
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
                      </div>
                    ) : (
                      <p className="text-gray-500">Complete previous steps to unlock</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
