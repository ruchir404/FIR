"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, logout } from "@/lib/auth"

// Auth Components
import { RoleSelector } from "@/components/auth/role-selector"
import { CitizenLogin } from "@/components/auth/citizen-login"
import { CitizenRegister } from "@/components/auth/citizen-register"
import { PoliceLogin } from "@/components/auth/police-login"
import { PoliceRegister } from "@/components/auth/police-register"

// Dashboards
import { PoliceDashboard } from "@/components/police/police-dashboard"
import { CitizenDashboard } from "@/components/citizen/citizen-dashboard"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<"citizen" | "police" | null>(null)
  const [authView, setAuthView] = useState<"login" | "register">("login")
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)

    const role = localStorage.getItem("selectedRole") as "citizen" | "police" | null
    if (role) setSelectedRole(role)

    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    logout()
    localStorage.removeItem("selectedRole")
    setCurrentUser(null)
    setSelectedRole(null)
    setAuthView("login")
  }

  const handleRoleChange = (newRole: "citizen" | "police") => {
    logout()
    localStorage.removeItem("selectedRole")
    setCurrentUser(null)
    setAuthView("login")
    setSelectedRole(newRole)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Logged in - show dashboard
  if (currentUser) {
    const isPolice = currentUser.role === "officer"

    return isPolice ? (
      <PoliceDashboard user={currentUser} onLogout={handleLogout} />
    ) : (
      <CitizenDashboard user={currentUser} onLogout={handleLogout} />
    )
  }

  // Role selection
  if (!selectedRole) {
    return <RoleSelector onSelectRole={setSelectedRole} />
  }

  // Citizen auth flow
  if (selectedRole === "citizen") {
    return authView === "register" ? (
      <CitizenRegister
        onSuccess={() => setAuthView("login")}
        onToggleLogin={() => setAuthView("login")}
      />
    ) : (
      <CitizenLogin
        onLoginSuccess={(user) => setCurrentUser(user)}
        onToggleRegister={() => setAuthView("register")}
      />
    )
  }

  // Police auth flow
  if (selectedRole === "police") {
    return authView === "register" ? (
      <PoliceRegister
        onSuccess={() => setAuthView("login")}
        onToggleLogin={() => setAuthView("login")}
      />
    ) : (
      <PoliceLogin
        onLoginSuccess={(user) => setCurrentUser(user)}
        onToggleRegister={() => setAuthView("register")}
      />
    )
  }

  return null
}
