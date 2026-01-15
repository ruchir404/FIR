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
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 text-white">eFIR System</h1>
          <p className="text-gray-400">Choose your role to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Citizen */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gray-900 border-gray-800"
            onClick={() => handleSelectRole("citizen")}
          >
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <CardTitle className="text-2xl text-white">Citizen</CardTitle>
              <CardDescription className="text-gray-400">
                File a complaint
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Continue as Citizen
              </Button>
            </CardContent>
          </Card>

          {/* Police */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow bg-gray-900 border-gray-800"
            onClick={() => handleSelectRole("police")}
          >
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <CardTitle className="text-2xl text-white">Police</CardTitle>
              <CardDescription className="text-gray-400">
                Manage complaints
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Continue as Police
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
