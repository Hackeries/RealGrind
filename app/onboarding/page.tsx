import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/supabase/server"
import OnboardingClient from "./onboarding-client"

export default async function OnboardingPage() {
  const { user, profile } = await getAuthenticatedUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // If profile is complete, redirect to dashboard
  if (profile?.role && profile?.codeforces_handle && profile?.college_id) {
    const dashboardPath =
      profile.role === "admin"
        ? "/dashboard/admin"
        : profile.role === "organizer"
          ? "/dashboard/organizer"
          : "/dashboard/student"
    redirect(dashboardPath)
  }

  return <OnboardingClient user={user} profile={profile} />
}
