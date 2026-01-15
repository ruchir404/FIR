"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Loader2 } from "lucide-react"
import { loginCitizen } from "@/lib/auth"

interface CitizenLoginProps {
  onLoginSuccess: (user: any) => void
  onToggleRegister: () => void
}

export function CitizenLogin({ onLoginSuccess, onToggleRegister }: CitizenLoginProps) {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = await loginCitizen({ phone, password })
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
          <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Citizen Login</CardTitle>
          <CardDescription>Sign in with your phone number</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
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
            Demo: 9999999999 / citizen123
          </div>
          <div className="mt-2 text-xs text-blue-500 cursor-pointer" onClick={onToggleRegister}>
            Register as a new citizen
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
