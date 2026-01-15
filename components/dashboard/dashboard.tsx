"use client"

import { getCurrentUser } from "@/lib/auth"
import { CitizenDashboard } from "@/components/citizen/citizen-dashboard"
import { PoliceDashboard } from "@/components/police/police-dashboard"

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const user = getCurrentUser()
  if (!user) return <div>Please login</div>

  // Only two roles now: "citizen" or "officer"
  if (user.role === "citizen") {
    return <CitizenDashboard user={user} onLogout={onLogout} />
  }

  // Anything else is police/officer
  return <PoliceDashboard user={user} onLogout={onLogout} />
}
