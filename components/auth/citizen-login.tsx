"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Loader2, Eye, EyeOff } from "lucide-react"
import { loginCitizen } from "@/lib/auth"

interface CitizenLoginProps {
  onLoginSuccess: (user: any) => void
  onToggleRegister: () => void
}

export function CitizenLogin({ onLoginSuccess, onToggleRegister }: CitizenLoginProps) {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await loginCitizen({ phone, password })
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

  const formatPhoneNumber = (value: string) => {
    const numeric = value.replace(/\D/g, "")
    return numeric.slice(0, 10)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <User className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Citizen Login</CardTitle>
          <CardDescription>Sign in with your phone number and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                maxLength={10}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">Format: 10 digits (e.g., 9876543210)</p>
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || !phone || !password}
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
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={onToggleRegister}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Register here
                </button>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Demo Credentials:</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded">
                  Phone: 9999999999
                  <br />
                  Password: citizen123
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
