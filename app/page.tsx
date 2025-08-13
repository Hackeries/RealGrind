import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Target, TrendingUp, Code, Calendar, Zap, Globe, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              RealGrind
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="container mx-auto text-center max-w-6xl relative z-10">
          <div className="mb-8">
            <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                🚀 RealGrind
              </span>
              <br />
              <span className="text-white">Your Competitive</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Programming Powerhouse
              </span>
            </h2>
          </div>

          <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            From your first AC to your next ICPC, RealGrind is the all-in-one platform to train, track, and triumph in
            competitive programming.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/auth/signin">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Grinding
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 rounded-xl border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-purple-500 transition-all duration-300 bg-transparent"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Explore Leaderboards
              </Button>
            </Link>
          </div>

          {/* Animated laptop mockup */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 transform hover:scale-105 transition-transform duration-500">
              <div className="bg-black rounded-lg p-6 font-mono text-sm">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="ml-4 text-gray-400">RealGrind Dashboard</div>
                </div>
                <div className="space-y-2 text-green-400">
                  <div className="animate-pulse">📊 Rating: 1847 (+23)</div>
                  <div className="animate-pulse delay-300">🏆 Rank: #42 in College</div>
                  <div className="animate-pulse delay-500">✅ Problems Solved: 847</div>
                  <div className="animate-pulse delay-700">🔥 Current Streak: 15 days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why RealGrind Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-black">
        <div className="container mx-auto max-w-7xl">
          <h3 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Why RealGrind?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-Time Tracking */}
            <Card className="group border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-purple-900/50 hover:to-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:animate-bounce">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-purple-300 group-hover:text-purple-200">
                  📈 Real-Time Tracking
                </CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300">
                  Sync with Codeforces API to track your submissions, ratings, and contest performance automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* College Contests */}
            <Card className="group border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-blue-900/50 hover:to-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center group-hover:animate-bounce">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-300 group-hover:text-blue-200">🏆 College Contests</CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300">
                  Create and participate in college-specific contests. Compete with your peers and climb institutional
                  rankings.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Smart Problem Picks */}
            <Card className="group border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-green-900/50 hover:to-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center group-hover:animate-bounce">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-green-300 group-hover:text-green-200">
                  🧠 Smart Problem Picks
                </CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300">
                  Get personalized problem recommendations based on your skill level and areas for improvement.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Progress Analytics */}
            <Card className="group border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-orange-900/50 hover:to-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center group-hover:animate-bounce">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-orange-300 group-hover:text-orange-200">
                  📊 Progress Analytics
                </CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300">
                  Detailed analytics and visualizations to track your improvement over time and identify patterns.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Activity Feed */}
            <Card className="group border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-pink-900/50 hover:to-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20 cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center group-hover:animate-bounce">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-pink-300 group-hover:text-pink-200">🔔 Activity Feed</CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300">
                  Stay updated with your friends' achievements and recent activities in the competitive programming
                  world.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Global Leaderboards */}
            <Card className="group border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-indigo-900/50 hover:to-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 cursor-pointer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center group-hover:animate-bounce">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-indigo-300 group-hover:text-indigo-200">
                  🌍 Global Leaderboards
                </CardTitle>
                <CardDescription className="text-gray-400 group-hover:text-gray-300">
                  Compete globally and see how you rank against programmers from colleges worldwide.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-black to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            How It Works
          </h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 rounded-full hidden md:block"></div>

            <div className="space-y-16">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 text-center md:text-right">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h4 className="text-2xl font-bold mb-4 text-purple-300">Sign in with Google</h4>
                  <p className="text-gray-400">
                    Quick and secure authentication with your Google account. No sign-up forms needed!
                  </p>
                </div>
                <div className="md:w-1/2">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                      <span className="text-white font-semibold">Google OAuth</span>
                    </div>
                    <div className="text-green-400 font-mono text-sm">✓ Authenticated successfully</div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="md:w-1/2 text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h4 className="text-2xl font-bold mb-4 text-blue-300">Link Codeforces account</h4>
                  <p className="text-gray-400">
                    Connect your Codeforces handle with live API integration for real-time sync.
                  </p>
                </div>
                <div className="md:w-1/2">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full"></div>
                      <span className="text-white font-semibold">Codeforces API</span>
                    </div>
                    <div className="text-green-400 font-mono text-sm">✓ Handle verified & synced</div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 text-center md:text-right">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h4 className="text-2xl font-bold mb-4 text-green-300">Start solving & competing</h4>
                  <p className="text-gray-400">
                    Get personalized recommendations and track your progress with animated charts!
                  </p>
                </div>
                <div className="md:w-1/2">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-white font-semibold">Progress Tracking</span>
                    </div>
                    <div className="text-green-400 font-mono text-sm animate-pulse">📈 Rating increased by +47!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Appeal Banner */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Globe className="w-8 h-8 text-blue-300 animate-spin" />
              <span className="text-2xl font-bold text-blue-300">Global Impact</span>
            </div>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Whether you're preparing for ICPC, chasing Codeforces Expert, or starting your CP journey — RealGrind pushes
            you to the next level.
          </h3>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-blue-300 mb-2">🇮🇳</div>
              <div className="text-white font-semibold">Indian Students</div>
              <div className="text-blue-200 text-sm">IIT, NIT, IIIT & More</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-green-300 mb-2">🌍</div>
              <div className="text-white font-semibold">Global Programmers</div>
              <div className="text-green-200 text-sm">Worldwide Community</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-purple-300 mb-2">🏆</div>
              <div className="text-white font-semibold">Contest Ready</div>
              <div className="text-purple-200 text-sm">ICPC, ACM, IOI</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call-to-Action */}
      <section className="py-20 px-4 bg-gradient-to-br from-black via-gray-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <h3 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to turn practice into podium finishes?
          </h3>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of competitive programmers who are already grinding their way to success.
          </p>
          <Link href="/auth/signin">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-110 animate-pulse"
            >
              <Zap className="w-6 h-6 mr-3" />
              Join the Grind Now — It's Free 🚀
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black border-t border-gray-800">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              RealGrind
            </span>
          </div>
          <p className="text-gray-400 mb-4">Empowering competitive programmers worldwide</p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <span>© 2024 RealGrind</span>
            <span>•</span>
            <span>Built for CP enthusiasts</span>
            <span>•</span>
            <span>Made with ❤️ for coders</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
