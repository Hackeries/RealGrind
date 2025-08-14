import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, BarChart3, Globe, Target, Trophy, Zap } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Real-Time Tracking",
      subtitle: "Sync with Codeforces API to track your submissions, ratings, and contest performance automatically.",
      color: "from-sky-400 to-blue-500",
      hoverColor: "hover:shadow-sky-500/25",
      textColor: "text-sky-300",
    },
    {
      icon: Trophy,
      title: "College Contests",
      subtitle:
        "Create and participate in college-specific contests. Compete with your peers and climb institutional rankings.",
      color: "from-yellow-400 to-orange-500",
      hoverColor: "hover:shadow-yellow-500/25",
      textColor: "text-yellow-300",
    },
    {
      icon: Target,
      title: "Smart Problem Picks",
      subtitle: "Get personalized problem recommendations based on your skill level and areas for improvement.",
      color: "from-green-400 to-emerald-500",
      hoverColor: "hover:shadow-green-500/25",
      textColor: "text-green-300",
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      subtitle: "Detailed analytics and visualizations to track your improvement over time and identify patterns.",
      color: "from-orange-400 to-red-500",
      hoverColor: "hover:shadow-orange-500/25",
      textColor: "text-orange-300",
    },
    {
      icon: Activity,
      title: "Activity Feed",
      subtitle:
        "Stay updated with your friends' achievements and recent activities in the competitive programming world.",
      color: "from-pink-400 to-rose-500",
      hoverColor: "hover:shadow-pink-500/25",
      textColor: "text-pink-300",
    },
    {
      icon: Globe,
      title: "Global Leaderboards",
      subtitle: "Compete globally and see how you rank against programmers from colleges worldwide.",
      color: "from-purple-400 to-indigo-500",
      hoverColor: "hover:shadow-purple-500/25",
      textColor: "text-purple-300",
    },
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-black">
      <div className="container mx-auto max-w-7xl">
        <h3 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-sans">
          Why RealGrind?
        </h3>

        {/* 2-row, 3-column grid on desktop, single column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 grid-rows-2">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card
                key={index}
                className={`group border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${feature.hoverColor} cursor-pointer rounded-xl`}
              >
                <CardHeader className="text-center p-8">
                  {/* Colored circle with icon */}
                  <div
                    className={`mx-auto mb-6 w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Feature title with modern font */}
                  <CardTitle
                    className={`text-xl font-bold mb-4 ${feature.textColor} group-hover:text-white transition-colors duration-300 font-sans`}
                  >
                    {feature.title}
                  </CardTitle>

                  {/* Feature subtitle */}
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed font-sans">
                    {feature.subtitle}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
