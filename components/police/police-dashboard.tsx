"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FIRForm } from "@/components/fir/fir-form"
import { FIRList } from "@/components/fir/fir-list"
import { FIRDetails } from "@/components/fir/fir-details"
import { ChatInterface } from "@/components/chatbot/chat-interface"
// import { ChatAnalytics } from "@/components/chatbot/chat-analytics" // ⏳ future
import { BNSReference } from "@/components/bns/bns-reference"
import {
  LogOut,
  Plus,
  Clock,
  AlertTriangle,
  Bot,
  // TrendingUp, // ⏳ future analytics
  FileText,
} from "lucide-react"
import { logout } from "@/lib/auth"
import type { FIR } from "@/lib/fir"

// 🔹 eFIR imports (NEW)
import { EFIRRequests } from "@/components/police/efir-requests"

interface PoliceDashboardProps {
  user: any
  onLogout: () => void
}

export function PoliceDashboard({ user, onLogout }: PoliceDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "efirs" | "firs" | "chatbot" | "bns" | "settings"
  >("overview")

  const [firView, setFirView] = useState<"list" | "form" | "details">("list")
  const [selectedFIR, setSelectedFIR] = useState<FIR | null>(null)

  // const [chatbotView, setChatbotView] = useState<"chat" | "analytics">("chat") // ⏳ future

  // 🔹 Holds eFIR-converted FIR data
  const [prefilledFIR, setPrefilledFIR] = useState<any | null>(null)

  /* =====================
     FIR HANDLERS
  ===================== */
  const handleNewFIR = () => {
    setPrefilledFIR(null)
    setSelectedFIR(null)
    setActiveTab("firs")
    setFirView("form")
  }

  const handleFIRSuccess = () => {
    setPrefilledFIR(null)
    setSelectedFIR(null)
    setFirView("list")
  }

  const handleViewFIR = (fir: FIR) => {
    setSelectedFIR(fir)
    setFirView("details")
  }

  const handleEditFIR = (fir: FIR) => {
    setSelectedFIR(fir)
    setFirView("form")
  }

  const handleBackToList = () => {
    setSelectedFIR(null)
    setFirView("list")
  }

  /* =====================
     eFIR → FIR CONVERSION
  ===================== */
  const handleConvertEFIR = (formData: any) => {
  setPrefilledFIR(formData)   // ✔ FIRFormData
  setSelectedFIR(null)
  setActiveTab("firs")
  setFirView("form")
}


  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold">FIR Management System</h1>
          <p className="text-sm text-gray-400">{user.station}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-400">{user.rank} • {user.badgeNumber}</p>
          </div>
          <Button variant="outline" onClick={() => { logout(); onLogout() }}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex px-6 space-x-4 border-b border-gray-700 bg-black">
        {[
          { id: "overview", label: "Overview" },
          { id: "efirs", label: "eFIR Requests" }, // 🆕
          { id: "firs", label: "FIR Management" },
          { id: "chatbot", label: "AI Assistant" },
          { id: "bns", label: "BNS Reference" },
          { id: "settings", label: "Settings" },
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </Button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Overview */}
        {activeTab === "overview" && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>
              <Button onClick={handleNewFIR}>
                <Plus className="h-4 w-4 mr-2" /> New FIR
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-gray-900 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>Total FIRs</span>
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-sm text-gray-400">+12% from last month</p>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>Pending Cases</span>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold">89</div>
                <p className="text-sm text-gray-400">-5% from last week</p>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>High Priority</span>
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold">23</div>
                <p className="text-sm text-gray-400">Requires attention</p>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>AI Complaints</span>
                  <Bot className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold">156</div>
                <p className="text-sm text-gray-400">Collected via chatbot</p>
              </div>
            </div>

            {/* Recent FIRs */}
            <div className="bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Recent FIRs</h3>
              {[
                { id: "FIR001", type: "Theft", location: "Market Street", status: "Under Investigation", priority: "High" },
                { id: "FIR002", type: "Assault", location: "Park Avenue", status: "Evidence Collection", priority: "Medium" },
                { id: "FIR003", type: "Fraud", location: "Business District", status: "Pending", priority: "Low" }
              ].map(fir => (
                <div key={fir.id} className="flex justify-between items-center p-3 border-b border-gray-700">
                  <div>
                    <p className="font-medium">{fir.id}</p>
                    <p className="text-sm text-gray-400">{fir.type} • {fir.location}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant={fir.priority === "High" ? "destructive" : fir.priority === "Medium" ? "default" : "secondary"}>
                      {fir.priority}
                    </Badge>
                    <Badge variant="outline">{fir.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 🔹 eFIR REQUESTS (NEW) */}
        {activeTab === "efirs" && (
          <EFIRRequests onConvertToFIR={handleConvertEFIR} />
        )}

        {/* FIR MANAGEMENT (UNCHANGED + EXTENDED) */}
        {activeTab === "firs" && (
          <>
            {firView === "list" && (
              <FIRList
                onViewFIR={handleViewFIR}
                onEditFIR={handleEditFIR}
              />
            )}

            {firView === "form" && (
              <FIRForm
                onSuccess={handleFIRSuccess}
                onCancel={handleBackToList}
                editingFIR={selectedFIR}
                initialData={prefilledFIR}   // 👈 THIS IS THE KEY
              />
            )}


            {firView === "details" && selectedFIR && (
              <FIRDetails
                fir={selectedFIR}
                onBack={handleBackToList}
                onEdit={() => handleEditFIR(selectedFIR)}
              />
            )}
          </>
        )}

        {/* Chatbot */}
        {activeTab === "chatbot" && <ChatInterface />}

        {/* BNS */}
        {activeTab === "bns" && <BNSReference />}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>

            {/* Profile */}
            <div className="p-4 bg-gray-900 rounded-lg space-y-2">
              <h3 className="text-lg font-semibold">Profile</h3>
              <p className="text-gray-400">Update your personal information</p>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <input type="text" defaultValue={user.name} className="p-2 rounded bg-gray-800 border border-gray-700 flex-1" placeholder="Name" />
                <input type="text" defaultValue={user.rank} className="p-2 rounded bg-gray-800 border border-gray-700 flex-1" placeholder="Rank" />
                <Button>Save</Button>
              </div>
            </div>

            {/* Account Security */}
            <div className="p-4 bg-gray-900 rounded-lg space-y-2">
              <h3 className="text-lg font-semibold">Account Security</h3>
              <p className="text-gray-400">Change password or enable 2FA</p>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <input type="password" placeholder="New Password" className="p-2 rounded bg-gray-800 border border-gray-700 flex-1" />
                <input type="password" placeholder="Confirm Password" className="p-2 rounded bg-gray-800 border border-gray-700 flex-1" />
                <Button>Change Password</Button>
              </div>
              <Button variant="outline" className="mt-2">Enable Two-Factor Authentication</Button>
            </div>

            {/* Notifications */}
            <div className="p-4 bg-gray-900 rounded-lg space-y-2">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="text-gray-400">Manage how you receive alerts</p>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="accent-blue-500" checked />
                  <span>Email alerts for new FIRs</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="accent-blue-500" />
                  <span>SMS reminders for pending cases</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="accent-blue-500" checked />
                  <span>AI Assistant notifications</span>
                </label>
              </div>
            </div>

            {/* Dashboard Customization */}
            <div className="p-4 bg-gray-900 rounded-lg space-y-2">
              <h3 className="text-lg font-semibold">Dashboard Customization</h3>
              <p className="text-gray-400">Personalize your dashboard appearance</p>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <Button variant="outline">Light Mode</Button>
                <Button variant="default">Dark Mode</Button>
              </div>
            </div>

            {/* Data Management */}
            <div className="p-4 bg-gray-900 rounded-lg space-y-2">
              <h3 className="text-lg font-semibold">Data Management</h3>
              <p className="text-gray-400">Export or manage FIR data</p>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                <Button variant="default">Export FIRs (CSV)</Button>
                <Button variant="default">Export FIRs (PDF)</Button>
                <Button variant="outline">Clear Temporary Data</Button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
