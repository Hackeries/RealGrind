import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

// User roles enum
export enum UserRole {
  student = "student",
  organizer = "organizer",
  admin = "admin",
}

// Server-side auth helpers for API routes
export async function getServerSession(request?: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return { user }
  } catch (error) {
    console.error("Failed to get server session:", error)
    return null
  }
}

export async function getCurrentUser(request?: NextRequest) {
  const session = await getServerSession(request)
  return session?.user || null
}

export async function requireAuth(request?: NextRequest) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Authentication required")
  }

  return user
}

export async function requireRole(allowedRoles: UserRole[], request?: NextRequest) {
  const user = await requireAuth(request)
  const supabase = createServerComponentClient({ cookies })

  // Get user role from database
  const { data: userData, error } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (error || !userData) {
    throw new Error("Failed to fetch user role")
  }

  if (!allowedRoles.includes(userData.role as UserRole)) {
    throw new Error("Insufficient permissions")
  }

  return { ...user, role: userData.role as UserRole }
}

// Role-based redirect logic
export function getRoleBasedRedirect(role: UserRole): string {
  switch (role) {
    case UserRole.student:
      return "/dashboard/student"
    case UserRole.organizer:
      return "/dashboard/organizer"
    case UserRole.admin:
      return "/dashboard/admin"
    default:
      return "/onboarding"
  }
}

// Helper to get user with role from database
export async function getUserWithRole(userId: string) {
  const supabase = createServerComponentClient({ cookies })

  const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error || !user) {
    return null
  }

  return user
}

// Helper to update user role (admin only)
export async function updateUserRole(userId: string, role: UserRole, adminUserId: string) {
  const supabase = createServerComponentClient({ cookies })

  // Verify admin permissions
  const admin = await requireRole([UserRole.admin])

  const { error } = await supabase
    .from("users")
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    throw new Error("Failed to update user role")
  }
}

export async function syncFirebaseUser(userId: string, userData: any) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Check if user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError
    }

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from("users")
        .update({
          email: userData.email,
          name: userData.name || userData.displayName,
          avatar_url: userData.photoURL,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        throw updateError
      }
    } else {
      // Create new user
      const { error: insertError } = await supabase.from("users").insert({
        id: userId,
        email: userData.email,
        name: userData.name || userData.displayName,
        avatar_url: userData.photoURL,
        role: "student", // Default role
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        throw insertError
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to sync Firebase user:", error)
    throw error
  }
}
