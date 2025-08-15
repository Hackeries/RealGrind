"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Chrome, Trophy, Target, Users, TrendingUp, Github } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<"google" | "github" | null>(null)

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.push("/dashboard")
      }
    }
    checkUser()
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      setLoading("google")
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("Google sign in error:", error.message)
        alert(`Google sign-in failed: ${error.message}`)
        setLoading(null)
      }
      // Note: Don't set loading to null on success as redirect will happen
    } catch (error) {
      console.error("Google sign in error:", error)
      alert("An unexpected error occurred during Google sign-in")
      setLoading(null)
    }
  }

  const handleGitHubSignIn = async () => {
    try {
      setLoading("github")
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("GitHub sign in error:", error.message)
        alert(`GitHub sign-in failed: ${error.message}`)
        setLoading(null)
      }
      // Note: Don't set loading to null on success as redirect will happen
    } catch (error) {
      console.error("GitHub sign in error:", error)
      alert("An unexpected error occurred during GitHub sign-in")
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Code className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                RealGrind
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">🚀 Welcome to RealGrind</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Sign in to start competing and tracking your progress.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Features */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-green-500/30">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Smart Recommendations</h3>
                    <p className="text-gray-400 text-sm">
                      Get personalized problem suggestions based on your skill level and weak areas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-orange-500/30">
                    <Trophy className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">College Rankings</h3>
                    <p className="text-gray-400 text-sm">
                      Compete with students from your college and see how your institution ranks nationally.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Progress Tracking</h3>
                    <p className="text-gray-400 text-sm">
                      Visualize your improvement with detailed analytics and rating progression charts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">College Contests</h3>
                    <p className="text-gray-400 text-sm">
                      Create and participate in college-specific programming contests and competitions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 p-6 rounded-xl border border-purple-500/20">
                <h3 className="font-semibold text-white mb-2">🎯 Perfect for Indian Students</h3>
                <p className="text-gray-400 text-sm">
                  Built specifically for Indian engineering colleges with comprehensive college rankings, peer
                  comparisons, and localized competitive programming insights.
                </p>
              </div>
            </div>

            {/* Sign In Card */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4">
                  <CardTitle className="text-2xl font-bold text-white">Get Started</CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose your preferred sign-in method to start your competitive programming journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={loading !== null}
                    className="w-full bg-white hover:bg-gray-100 text-gray-900 border-0 shadow-lg"
                    size="lg"
                  >
                    {loading === "google" ? (
                      <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    ) : (
                      <Chrome className="w-5 h-5 mr-3" />
                    )}
                    Sign in with Google
                  </Button>

                  <Button
                    onClick={handleGitHubSignIn}
                    disabled={loading !== null}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 shadow-lg"
                    size="lg"
                  >
                    {loading === "github" ? (
                      <div className="w-5 h-5 mr-3 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                    ) : (
                      <Github className="w-5 h-5 mr-3" />
                    )}
                    Sign in with GitHub
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-400">
                      By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                    <p className="text-xs text-gray-500">
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
                <div className="text-3xl font-bold text-purple-400 mb-2">200+</div>
                <div className="text-gray-400">Engineering Colleges</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">10K+</div>
                <div className="text-gray-400">Problems Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400 mb-2">24/7</div>
                <div className="text-gray-400">Real-time Sync</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
