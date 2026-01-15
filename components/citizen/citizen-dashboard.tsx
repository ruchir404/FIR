"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { LogOut, Plus, Clock, CheckCircle, XCircle, AlertCircle, Bot, FileText } from "lucide-react"
import { getEFIRsByCitizen } from "@/lib/efir"
import { CitizenEFIRForm } from "@/components/citizen/citizen-efir-form"
import { ChatInterface } from "@/components/chatbot/citizenchat-interface"
import type { EFIR } from "@/lib/efir"

interface CitizenDashboardProps {
  onLogout: () => void
}

export function CitizenDashboard({ onLogout }: CitizenDashboardProps) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [efirs, setEFIRs] = useState<EFIR[]>([])
  const [activeTab, setActiveTab] = useState<"dashboard" | "chatbot" | "details" | "settings">("dashboard")
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("current_user") || "null")
    setCurrentUser(user)
    if (user?.id) {
      const citizenEFIRs = getEFIRsByCitizen(user.id)
      setEFIRs(citizenEFIRs)
    }
    setIsLoading(false)
  }, [])

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (showForm) {
    return (
      <CitizenEFIRForm
        citizen={currentUser}
        onSuccess={() => {
          const citizenEFIRs = getEFIRsByCitizen(currentUser.id)
          setEFIRs(citizenEFIRs)
          setShowForm(false)
          setActiveTab("dashboard")
        }}
        onCancel={() => setShowForm(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">eFIR System - Citizen Portal</h1>
            <p className="text-sm text-muted-foreground">File and track your complaints</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">Hello, {currentUser?.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser?.phone}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-border bg-card">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "My Dashboard", icon: FileText },
              { id: "chatbot", label: "AI Assistant", icon: Bot },
              { id: "details", label: "FIR Details", icon: FileText },
              { id: "settings", label: "Settings", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Dashboard</h2>
              <Button onClick={() => setShowForm(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                File New eFIR
              </Button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total eFIRs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{efirs.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {efirs.filter((e) => e.status === "pending").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {efirs.filter((e) => e.status === "accepted").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {efirs.filter((e) => e.status === "rejected").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* eFIR List */}
            <Card>
              <CardHeader>
                <CardTitle>My eFIR Requests</CardTitle>
                <CardDescription>View all your filed complaints</CardDescription>
              </CardHeader>
              <CardContent>
                {efirs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No eFIRs filed yet. Click "File New eFIR" to get started.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {efirs.map((efir) => (
                      <div key={efir.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{efir.id}</p>
                            <p className="text-sm text-muted-foreground">{efir.incidentType}</p>
                          </div>
                          <Badge className={getStatusColor(efir.status)}>
                            {getStatusIcon(efir.status)}
                            <span className="ml-1 capitalize">{efir.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{efir.incidentDescription}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted: {new Date(efir.submissionDate).toLocaleDateString()}
                          {efir.status === "pending" && (
                            <> • Deadline: {new Date(efir.validationDeadline).toLocaleDateString()}</>
                          )}
                        </p>
                        {efir.policeRemarks && (
                          <p className="text-sm mt-2 text-red-600">Remarks: {efir.policeRemarks}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chatbot Tab */}
        {activeTab === "chatbot" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">AI Assistant - File eFIR via Chat</h2>
            <ChatInterface />
          </div>
        )}

        {/* FIR Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My FIR Details</h2>
            {efirs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">No eFIRs Filed Yet</p>
                  <p className="text-muted-foreground mt-2">File a new eFIR to see details here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {efirs.map((efir) => (
                  <Card key={efir.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{efir.id}</CardTitle>
                          <CardDescription>{efir.incidentType}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(efir.status)}>
                          {getStatusIcon(efir.status)}
                          <span className="ml-1 capitalize">{efir.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Complaint Details */}
                      <div>
                        <Label className="text-sm font-semibold">Complaint Description</Label>
                        <p className="text-sm mt-2">{efir.incidentDescription}</p>
                      </div>

                      {/* Suggested BNS Sections */}
                      <div>
                        <Label className="text-sm font-semibold">Suggested BNS Sections</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {efir.bnsSection && efir.bnsSection.length > 0 ? (
                            efir.bnsSection.map((section) => (
                              <Badge key={section} variant="secondary">
                                {section}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No BNS sections assigned</p>
                          )}
                        </div>
                      </div>

                      {/* Police Remarks */}
                      {efir.policeRemarks && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <Label className="text-sm font-semibold text-red-800">Police Remarks</Label>
                          <p className="text-sm text-red-700 mt-2">{efir.policeRemarks}</p>
                        </div>
                      )}

                      {/* Status Timeline */}
                      <div>
                        <Label className="text-sm font-semibold mb-4 block">Status Timeline</Label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            <div>
                              <p className="text-sm font-medium">Submitted</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(efir.submissionDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                efir.status !== "pending" ? "bg-blue-600" : "bg-gray-300"
                              }`}
                            ></div>
                            <div>
                              <p className="text-sm font-medium">Under Review</p>
                              <p className="text-xs text-muted-foreground">Awaiting police validation</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                efir.status === "accepted" || efir.status === "rejected" ? "bg-blue-600" : "bg-gray-300"
                              }`}
                            ></div>
                            <div>
                              <p className="text-sm font-medium capitalize">
                                {efir.status === "accepted"
                                  ? "Accepted"
                                  : efir.status === "rejected"
                                    ? "Rejected"
                                    : "Pending"}
                              </p>
                              {efir.acceptedDate && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(efir.acceptedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          {efir.status === "pending" && (
                            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-xs text-yellow-800">
                                Validation deadline: {new Date(efir.validationDeadline).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Profile & Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{currentUser?.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone Number</Label>
                    <p className="font-medium">{currentUser?.phone}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-medium">{currentUser?.email || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Address</Label>
                    <p className="font-medium">{currentUser?.address || "Not provided"}</p>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Preferences Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="language">Preferred Language</Label>
                    <div className="mt-2 flex space-x-2">
                      <Button variant="outline" className="flex-1 bg-transparent">
                        English
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Hindi
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Marathi
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Help & FAQs */}
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <strong>What is eFIR?</strong> Electronic First Information Report - A digital complaint filing
                  system.
                </p>
                <p className="text-sm">
                  <strong>How long is the validation period?</strong> You have 3 days to visit the nearest police
                  station to validate your eFIR.
                </p>
                <p className="text-sm">
                  <strong>What happens if I don't validate?</strong> Your eFIR will automatically expire after 3 days.
                </p>
              </CardContent>
            </Card>

            {/* Logout */}
            <Button onClick={onLogout} variant="destructive" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
