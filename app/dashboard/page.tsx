"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

export default function DashboardRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (status === "authenticated" && session?.user?.role) {
      const dashboardPath =
        session.user.role === "admin"
          ? "/dashboard/admin"
          : session.user.role === "organizer"
            ? "/dashboard/organizer"
            : "/dashboard/student"
      router.push(dashboardPath)
    }
  }, [status, session, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
        <p className="text-gray-300">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
