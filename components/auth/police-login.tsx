"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Loader2 } from "lucide-react"
import { login } from "@/lib/auth"

interface PoliceLoginProps {
  onLoginSuccess: (user: any) => void
}

export function PoliceLogin({ onLoginSuccess }: PoliceLoginProps) {
  const [badgeNumber, setBadgeNumber] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = await login({ badgeNumber, password })
      if (user) {
        localStorage.setItem("fir_user", JSON.stringify(user))
        onLoginSuccess(user)
      } else {
        setError("Invalid credentials")
      }
    } catch {
      setError("Login failed. Try again")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Police Login</CardTitle>
          <CardDescription>Sign in with your police credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Badge Number</Label>
              <Input value={badgeNumber} onChange={(e) => setBadgeNumber(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-xs text-gray-400">
            Demo: PO001 / password123
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
