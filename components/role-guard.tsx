"use client"

import type React from "react"
import { useAuth } from "@/components/providers"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { UserRole } from "@/lib/auth"
import { Shield, AlertCircle, RefreshCw } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackUrl?: string
  showUnauthorized?: boolean
}

export function RoleGuard({ children, allowedRoles, fallbackUrl, showUnauthorized = false }: RoleGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
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
  }, [user, loading])

  useEffect(() => {
    if (!loading && !roleLoading) {
      if (!user) {
        router.push("/auth/signin")
        return
      }

      if (userRole && !allowedRoles.includes(userRole)) {
        if (fallbackUrl) {
          router.push(fallbackUrl)
        } else {
          const defaultFallback = `/dashboard/${userRole}`
          router.push(defaultFallback)
        }
        return
      }
    }
  }, [user, userRole, loading, roleLoading, allowedRoles, router, fallbackUrl])

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Verifying permissions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Permission Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    if (showUnauthorized) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Restricted</h2>
            <p className="text-gray-300 mb-2">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-400 mb-6">
              Required roles: {allowedRoles.join(", ")}
              <br />
              Your role: {userRole}
            </p>
            <button
              onClick={() => router.push(`/dashboard/${userRole}`)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }
    return null
  }

  return <>{children}</>
}
