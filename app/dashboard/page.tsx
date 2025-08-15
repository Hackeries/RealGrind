import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/supabase/server"

export default async function DashboardRedirect() {
  const { user, profile } = await getAuthenticatedUser()

  if (!user) {
    redirect("/auth/signin")
  }

  if (profile?.role) {
    const dashboardPath =
      profile.role === "admin"
        ? "/dashboard/admin"
        : profile.role === "organizer"
          ? "/dashboard/organizer"
          : "/dashboard/student"

    redirect(dashboardPath)
  }

  // If no role, redirect to onboarding
  redirect("/onboarding")
}
