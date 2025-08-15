"use client"

import type React from "react"

import { useAuth } from "@/components/providers"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import type { UserRole } from "@prisma/client"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole[]
  fallbackUrl?: string
}

export function AuthGuard({ children, requiredRole, fallbackUrl = "/auth/signin" }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(fallbackUrl)
        return
      }

      // Role-based access control would require fetching user role from database
      // This is a client-side guard, server-side protection is handled by middleware
    }
  }, [user, loading, router, fallbackUrl])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
