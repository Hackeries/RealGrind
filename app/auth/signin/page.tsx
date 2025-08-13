"use client"

import { signIn, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Chrome, Trophy, Target, Users, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/onboarding")
      }
    })
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const result = await signIn("google", {
        callbackUrl: "/onboarding",
        redirect: false,
      })

      if (result?.ok) {
        router.push("/onboarding")
      }
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Code className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RealGrind
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Master Competitive Programming</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your progress, compete with peers from your college, and climb the leaderboards in India's premier
              competitive programming platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Features */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Smart Recommendations</h3>
                    <p className="text-gray-600 text-sm">
                      Get personalized problem suggestions based on your skill level and weak areas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">College Rankings</h3>
                    <p className="text-gray-600 text-sm">
                      Compete with students from your college and see how your institution ranks nationally.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Progress Tracking</h3>
                    <p className="text-gray-600 text-sm">
                      Visualize your improvement with detailed analytics and rating progression charts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">College Contests</h3>
                    <p className="text-gray-600 text-sm">
                      Create and participate in college-specific programming contests and competitions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-gray-800 mb-2">🎯 Perfect for Indian Students</h3>
                <p className="text-gray-600 text-sm">
                  Built specifically for Indian engineering colleges with comprehensive college rankings, peer
                  comparisons, and localized competitive programming insights.
                </p>
              </div>
            </div>

            {/* Sign In Card */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center space-y-4">
                  <CardTitle className="text-2xl font-bold text-gray-800">Get Started</CardTitle>
                  <CardDescription className="text-gray-600">
                    Sign in with Google to start your competitive programming journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-sm"
                    size="lg"
                  >
                    {loading ? (
                      <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    ) : (
                      <Chrome className="w-5 h-5 mr-3" />
                    )}
                    Continue with Google
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-500">
                      By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                    <p className="text-xs text-gray-400">
                      We'll help you connect your Codeforces account and set up your profile after signing in.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">200+</div>
                <div className="text-gray-600">Engineering Colleges</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">10K+</div>
                <div className="text-gray-600">Problems Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600">Real-time Sync</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
