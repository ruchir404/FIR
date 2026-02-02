"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  LogOut,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bot,
  FileText,
} from "lucide-react"

import { getEFIRsByCitizen } from "@/lib/efir"
import { CitizenEFIRForm } from "@/components/citizen/citizen-efir-form"
import { ChatInterface } from "@/components/chatbot/citizenchat-interface"
import type { EFIR } from "@/lib/efir"

import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/FirebaseConfig"

interface CitizenDashboardProps {
  onLogout: () => void
}

export function CitizenDashboard({ onLogout }: CitizenDashboardProps) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [efirs, setEFIRs] = useState<EFIR[]>([])
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "chatbot" | "details" | "settings"
  >("dashboard")
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ============================
     AUTH + DATA LOAD (FIXED)
  ============================ */
  useEffect(() => {
    let isMounted = true

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          if (isMounted) {
            setError("User not logged in")
            setIsLoading(false)
          }
          return
        }

        const user = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "Citizen",
          phone: firebaseUser.phoneNumber || "",
          email: firebaseUser.email || "",
        }

        if (!isMounted) return
        setCurrentUser(user)

        const data = await getEFIRsByCitizen(user.id)

        if (!isMounted) return
        setEFIRs(data)
      } catch (err) {
        console.error("Dashboard load failed:", err)
        if (isMounted) {
          setError("Failed to load eFIR data")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  /* ============================
     HELPERS
  ============================ */
  const getStatusColor = (status: EFIR["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getStatusIcon = (status: EFIR["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "expired":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  /* ============================
     LOADING / ERROR STATES
  ============================ */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    )
  }

  /* ============================
     EFIR FORM
  ============================ */
  if (showForm && currentUser) {
    return (
      <CitizenEFIRForm
        citizen={currentUser}
        onSuccess={async () => {
          const data = await getEFIRsByCitizen(currentUser.id)
          setEFIRs(data)
          setShowForm(false)
          setActiveTab("dashboard")
        }}
        onCancel={() => setShowForm(false)}
      />
    )
  }

  /* ============================
     MAIN DASHBOARD
  ============================ */
  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">eFIR System – Citizen Portal</h1>
            <p className="text-sm text-muted-foreground">
              File and track your complaints
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{currentUser?.name}</p>
              <p className="text-sm text-muted-foreground">
                {currentUser?.phone}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav className="border-b bg-card px-6">
        <div className="flex space-x-8">
          {[
            { id: "dashboard", label: "Dashboard", icon: FileText },
            { id: "chatbot", label: "AI Assistant", icon: Bot },
            { id: "details", label: "My eFIRs", icon: FileText },
            { id: "settings", label: "Settings", icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-4 border-b-2 ${
                activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENT */}
      <main className="p-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Dashboard</h2>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                File New eFIR
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                ["Total", efirs.length],
                ["Pending", efirs.filter(e => e.status === "pending").length],
                ["Accepted", efirs.filter(e => e.status === "accepted").length],
                ["Rejected", efirs.filter(e => e.status === "rejected").length],
              ].map(([label, value]) => (
                <Card key={label as string}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>My eFIR Requests</CardTitle>
                <CardDescription>
                  All complaints filed by you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {efirs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No eFIRs filed yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {efirs.map(efir => (
                      <div
                        key={efir.id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between mb-2">
                          <div>
                            <p className="font-semibold">{efir.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {efir.incidentType}
                            </p>
                          </div>
                          <Badge className={getStatusColor(efir.status)}>
                            {getStatusIcon(efir.status)}
                            <span className="ml-1 capitalize">
                              {efir.status}
                            </span>
                          </Badge>
                        </div>

                        <p className="text-sm">{efir.incidentDescription}</p>

                        <p className="text-xs text-muted-foreground mt-2">
                          Submitted:{" "}
                          {new Date(efir.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "chatbot" && <ChatInterface />}
      </main>
    </div>
  )
}
