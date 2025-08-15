"use client"

import type React from "react"

import { useAuth } from "@/components/providers"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { UserRole } from "@prisma/client"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallbackUrl?: string
}

export function RoleGuard({ children, allowedRoles, fallbackUrl }: RoleGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const token = await user.getIdToken()
          const response = await fetch("/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            setUserRole(data.user.role)
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error)
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
        const defaultFallback = `/dashboard/${userRole}`
        router.push(fallbackUrl || defaultFallback)
        return
      }
    }
  }, [user, userRole, loading, roleLoading, allowedRoles, router, fallbackUrl])

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!user || (userRole && !allowedRoles.includes(userRole))) {
    return null
  }

  return <>{children}</>
}
