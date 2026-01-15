"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, logout } from "@/lib/auth"

// Auth Components
import { RoleSelector } from "@/components/auth/role-selector"
import { CitizenLogin } from "@/components/auth/citizen-login"
import { CitizenRegister } from "@/components/auth/citizen-register"
import { PoliceLogin } from "@/components/auth/police-login"

// Dashboards
import { PoliceDashboard } from "@/components/police/police-dashboard"
import { CitizenDashboard } from "@/components/citizen/citizen-dashboard"

export default function Home() {
  // 🔹 State
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<"citizen" | "police" | null>(null)
  const [citizenView, setCitizenView] = useState<"login" | "register">("login")
  const [currentUser, setCurrentUser] = useState<any>(null)

  // 🔹 On load: fetch user & role
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    const role = localStorage.getItem("selectedRole") as "citizen" | "police" | null
    if (role) setSelectedRole(role)

    setIsLoading(false)
  }, [])

  // 🔹 Logout
  const handleLogout = () => {
    logout()
    localStorage.removeItem("selectedRole")
    setCurrentUser(null)
    setSelectedRole(null)
    setCitizenView("login")
  }

  // 🔹 Loading
  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>
  }

  // 🔹 Logged in dashboard
  if (currentUser) {
    const isPolice = currentUser.role === "officer" || currentUser.role === "admin"

    return isPolice ? (
      <PoliceDashboard user={currentUser} onLogout={handleLogout} />
    ) : (
      <CitizenDashboard user={currentUser} onLogout={handleLogout} />
    )
  }

  // 🔹 Role selection
  if (!selectedRole) {
    return <RoleSelector onSelectRole={setSelectedRole} />
  }

  // 🔹 Citizen login/register flow
  if (selectedRole === "citizen") {
    return citizenView === "register" ? (
      <CitizenRegister
        onSuccess={() => setCitizenView("login")}
        onToggleLogin={() => setCitizenView("login")}
      />
    ) : (
      <CitizenLogin
        onLoginSuccess={(user) => setCurrentUser(user)}
        onToggleRegister={() => setCitizenView("register")}
      />
    )
  }

  // 🔹 Police login flow
  if (selectedRole === "police") {
    return <PoliceLogin onLoginSuccess={(user) => setCurrentUser(user)} />
  }

  return null
}
