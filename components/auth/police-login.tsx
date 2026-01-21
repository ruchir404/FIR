"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Loader2, Eye, EyeOff } from "lucide-react"
import { loginPolice } from "@/lib/auth"

interface PoliceLoginProps {
  onLoginSuccess: (user: any) => void
  onToggleRegister: () => void
}

export function PoliceLogin({ onLoginSuccess, onToggleRegister }: PoliceLoginProps) {
  const [badgeNumber, setBadgeNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await loginPolice({ badgeNumber, password })
      if (result.success && result.user) {
        onLoginSuccess(result.user)
      } else {
        setError(result.message || "Login failed")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Police Login</CardTitle>
          <CardDescription>Sign in with your police credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="badgeNumber">Badge Number</Label>
              <Input
                id="badgeNumber"
                type="text"
                placeholder="e.g., PO001"
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value.toUpperCase())}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading || !badgeNumber || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="space-y-3 text-center">
              <div className="text-sm text-gray-600">
                <span>New officer? </span>
                <button
                  type="button"
                  onClick={onToggleRegister}
                  className="text-red-600 hover:text-red-700 font-semibold"
                >
                  Register here
                </button>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Demo Credentials:</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                  Badge: PO001
                  <br />
                  Password: password123
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
