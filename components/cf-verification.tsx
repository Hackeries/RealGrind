"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface VerificationData {
  token: string
  handle: string
  problemId: string
  problemUrl: string
  verificationCode: string
  expiresAt: string
  instructions: string[]
}

export function CFVerification({ onVerified }: { onVerified: (handle: string, rating: number) => void }) {
  const [handle, setHandle] = useState("")
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [copied, setCopied] = useState(false)

  const startVerification = async () => {
    if (!handle.trim()) {
      toast.error("Please enter your Codeforces handle")
      return
    }

    setIsStarting(true)
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

      setVerificationData(data)
      toast.success("Verification started! Follow the instructions below.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start verification")
    } finally {
      setIsStarting(false)
    }
  }

  const checkVerification = async () => {
    if (!verificationData) return

    setIsChecking(true)
    try {
      const response = await fetch("/api/verify-cf/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationData.token }),
      })

      const data = await response.json()

      if (data.verified) {
        toast.success(data.message)
        onVerified(data.handle, data.rating)
      } else {
        toast.warning(data.message)
      }
    } catch (error) {
      toast.error("Failed to check verification")
    } finally {
      setIsChecking(false)
    }
  }

  const copyCode = async () => {
    if (!verificationData) return

    await navigator.clipboard.writeText(verificationData.verificationCode)
    setCopied(true)
    toast.success("Code copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            CF
          </div>
          Verify Codeforces Handle
        </CardTitle>
        <CardDescription>Prove ownership of your Codeforces account by submitting a compilation error</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!verificationData ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Codeforces Handle</label>
              <Input
                placeholder="Enter your CF handle (e.g., tourist)"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startVerification()}
              />
            </div>
            <Button onClick={startVerification} disabled={isStarting || !handle.trim()} className="w-full">
              {isStarting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Start Verification
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Handle: {verificationData.handle}</p>
                <p className="text-sm text-muted-foreground">
                  Token expires: {new Date(verificationData.expiresAt).toLocaleTimeString()}
                </p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Instructions:</h3>
              <ol className="space-y-2 text-sm">
                {verificationData.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Verification Code:</label>
                <Button variant="outline" size="sm" onClick={copyCode} className="h-8 bg-transparent">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <pre className="p-3 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                {verificationData.verificationCode}
              </pre>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(verificationData.problemUrl, "_blank")}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Problem
              </Button>
              <Button onClick={checkVerification} disabled={isChecking} className="flex-1">
                {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Check Verification
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
