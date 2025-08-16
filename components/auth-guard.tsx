"use client"

import type React from "react"
import { useAuth } from "@/components/providers"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { UserRole } from "@/lib/auth"
import { RefreshCw } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole[]
  fallbackUrl?: string
  showLoading?: boolean
}

export function AuthGuard({
  children,
  requiredRole,
  fallbackUrl = "/auth/signin",
  showLoading = true,
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && requiredRole) {
        try {
          setError(null)
          const response = await fetch("/api/user/profile")

          if (!response.ok) {
            throw new Error("Failed to fetch user profile")
          }

          const data = await response.json()
          setUserRole(data.user.role as UserRole)
        } catch (error) {
          console.error("Failed to fetch user role:", error)
          setError("Failed to verify permissions")
        }
      }
      setRoleLoading(false)
    }

    if (!loading) {
      fetchUserRole()
    }
  }, [user, loading, requiredRole])

  useEffect(() => {
    if (!loading && !roleLoading) {
      if (!user) {
        router.push(fallbackUrl)
        return
      }

      if (requiredRole && userRole && !requiredRole.includes(userRole)) {
        const defaultFallback = `/dashboard/${userRole}`
        router.push(fallbackUrl || defaultFallback)
        return
      }
    }
  }, [user, userRole, loading, roleLoading, requiredRole, router, fallbackUrl])

  if (loading || (requiredRole && roleLoading)) {
    if (!showLoading) return null

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">{loading ? "Loading..." : "Verifying permissions..."}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!user || (requiredRole && userRole && !requiredRole.includes(userRole))) {
    return null
  }

  return <>{children}</>
}
