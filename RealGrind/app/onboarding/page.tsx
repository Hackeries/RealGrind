"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Code,
  CheckCircle,
  RefreshCw,
  Target,
  Trophy,
  Users,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Shield,
  Zap,
} from "lucide-react"
import Link from "next/link"

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated") {
      fetchUserProfile()
    }
  }, [status, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)

        // If user already has a complete profile, redirect to dashboard
        if (data.user?.codeforces_handle && data.user?.college) {
          router.push("/dashboard")
          return
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Setting up your account...</p>
        </div>
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
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {session?.user?.name?.split(" ")[0]}!</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to RealGrind, {session?.user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              You're about to join India's premier competitive programming platform. Let's get you set up in just a few
              steps.
            </p>
          </div>

          {/* What You'll Get */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Smart Recommendations</h3>
                <p className="text-sm text-gray-600">Personalized problems based on your skill level</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">College Rankings</h3>
                <p className="text-sm text-gray-600">Compete with peers from your college</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Progress Tracking</h3>
                <p className="text-sm text-gray-600">Detailed analytics and improvement insights</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Real-time Sync</h3>
                <p className="text-sm text-gray-600">Automatic updates from Codeforces</p>
              </CardContent>
            </Card>
          </div>

          {/* Setup Steps */}
          <Card className="border-0 shadow-xl mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Let's Set Up Your Profile</CardTitle>
              <CardDescription className="text-lg">
                We need a few details to personalize your RealGrind experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Codeforces */}
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">Connect Your Codeforces Account</h3>
                  <p className="text-gray-600 mb-3">
                    We'll sync your submissions, ratings, and contest history to provide personalized recommendations.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">Secure verification process</span>
                  </div>
                </div>
              </div>

              {/* Step 2: College */}
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">Select Your College</h3>
                  <p className="text-gray-600 mb-3">
                    Choose from our database of 200+ Indian engineering colleges to join college-specific leaderboards.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">200+ Colleges</Badge>
                    <Badge className="bg-blue-100 text-blue-800">All Tiers</Badge>
                  </div>
                </div>
              </div>

              {/* Step 3: Verification */}
              <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">Quick Verification</h3>
                  <p className="text-gray-600 mb-3">
                    A simple one-time verification to confirm your Codeforces account ownership.
                  </p>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700">Takes less than 2 minutes</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center pt-6">
                <Link href="/profile/setup">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
                  >
                    Start Setup
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-3">
                  Setup takes about 3-5 minutes. You can always update your profile later.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 mb-4">Need Help Getting Started?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://codeforces.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Don't have a Codeforces account?</span>
              </a>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-700">
                Skip setup for now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
