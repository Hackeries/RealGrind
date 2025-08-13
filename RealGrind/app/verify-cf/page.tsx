"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, ExternalLink, Code, User } from "lucide-react"

interface VerificationProblem {
  contestId: number
  index: string
  name: string
  rating: number
  url: string
}

export default function VerifyCodeforcesPage() {
  const { data: session } = useSession()
  const [handle, setHandle] = useState("")
  const [loading, setLoading] = useState(false)
  const [verificationProblem, setVerificationProblem] = useState<VerificationProblem | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "pending" | "checking" | "verified">("idle")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const startVerification = async () => {
    if (!handle.trim()) {
      setError("Please enter your Codeforces handle")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/verify-cf/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to start verification")
      }

      setVerificationProblem(data.problem)
      setVerificationStatus("pending")
      setMessage(
        `Verification started! Please submit a compilation error solution to problem ${data.problem.contestId}${data.problem.index}.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const checkVerification = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/verify-cf/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check verification")
      }

      if (data.success) {
        setVerificationStatus("verified")
        setMessage(data.message)
      } else {
        setMessage(data.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to verify your Codeforces handle.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Codeforces Handle</h1>
          <p className="text-gray-600">
            Connect your Codeforces account to track your competitive programming progress
          </p>
        </div>

        {verificationStatus === "verified" ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                Verification Complete!
              </CardTitle>
              <CardDescription className="text-green-700">
                Your Codeforces handle has been successfully verified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">{handle}</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Enter Your Handle</CardTitle>
              <CardDescription>Enter your Codeforces handle to start the verification process.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="handle">Codeforces Handle</Label>
                <Input
                  id="handle"
                  placeholder="your_handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  disabled={verificationStatus === "pending"}
                />
              </div>

              <Button
                onClick={startVerification}
                disabled={loading || verificationStatus === "pending"}
                className="w-full"
              >
                {loading ? "Starting Verification..." : "Start Verification"}
              </Button>
            </CardContent>
          </Card>
        )}

        {verificationProblem && verificationStatus === "pending" && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Code className="h-5 w-5 mr-2" />
                Step 2: Submit Compilation Error
              </CardTitle>
              <CardDescription className="text-blue-700">
                Submit a solution that causes a compilation error to the problem below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{verificationProblem.name}</h3>
                  <Badge variant="outline">Rating: {verificationProblem.rating}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Problem {verificationProblem.contestId}
                  {verificationProblem.index}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href={verificationProblem.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Problem
                  </a>
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Instructions:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Click "Open Problem" to view the problem on Codeforces</li>
                    <li>
                      Submit any code that will cause a compilation error (e.g., missing semicolon, undefined variable)
                    </li>
                    <li>Come back here and click "Check Verification" after submitting</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Button onClick={checkVerification} disabled={loading} className="w-full">
                {loading ? "Checking..." : "Check Verification"}
              </Button>
            </CardContent>
          </Card>
        )}

        {message && (
          <Alert className={verificationStatus === "verified" ? "border-green-200 bg-green-50" : ""}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={verificationStatus === "verified" ? "text-green-800" : ""}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Why do we need verification?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>• Ensures you own the Codeforces account you're claiming</p>
            <p>• Prevents impersonation and maintains leaderboard integrity</p>
            <p>• Enables accurate tracking of your competitive programming progress</p>
            <p>• Required for college rankings and contest participation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
