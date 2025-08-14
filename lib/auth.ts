import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // Fetch user with role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { college: true },
        })

        session.user.id = user.id
        session.user.role = dbUser?.role || UserRole.student
        session.user.codeforcesHandle = dbUser?.codeforcesHandle
        session.user.college = dbUser?.college
        session.user.rating = dbUser?.rating
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle role-based redirects after sign in
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/onboarding",
  },
  session: {
    strategy: "database",
  },
}

// Server-side helpers
export async function getServerSession() {
  const { getServerSession: nextAuthGetServerSession } = await import("next-auth")
  const session = await nextAuthGetServerSession(authOptions)
  return session
}

export async function getCurrentUser() {
  const session = await getServerSession()
  return session?.user || null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions")
  }
  return user
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
