"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Shield } from "lucide-react"

interface RoleSelectorProps {
  onSelectRole: (role: "citizen" | "police") => void
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  const handleSelectRole = (role: "citizen" | "police") => {
    localStorage.setItem("selectedRole", role)
    onSelectRole(role)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 text-white">eFIR System</h1>
          <p className="text-xl text-gray-400">Electronic First Information Report Management</p>
          <p className="text-sm text-gray-500 mt-2">Choose your role to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Citizen */}
          <Card
            className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-950 to-gray-900 border-blue-800 hover:border-blue-600"
            onClick={() => handleSelectRole("citizen")}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Citizen</CardTitle>
              <CardDescription className="text-gray-300">File complaints & track status</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <ul className="text-sm text-gray-300 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> File eFIR complaints
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> Track complaint status
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> 24/7 AI assistance
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Continue as Citizen</Button>
            </CardContent>
          </Card>

          {/* Police */}
          <Card
            className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-red-950 to-gray-900 border-red-800 hover:border-red-600"
            onClick={() => handleSelectRole("police")}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Shield className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Police</CardTitle>
              <CardDescription className="text-gray-300">Manage & investigate complaints</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <ul className="text-sm text-gray-300 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✓</span> Review filed complaints
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✓</span> Track investigations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">✓</span> AI-powered insights
                </li>
              </ul>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Continue as Police</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-xs text-gray-500">
          <p>Secure • Encrypted • Compliant with Indian law enforcement standards</p>
        </div>
      </div>
    </div>
  )
}
