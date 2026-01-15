"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { registerCitizen } from "@/lib/auth"

interface CitizenRegisterProps {
  onSuccess: () => void
  onToggleLogin: () => void
}

export function CitizenRegister({ onSuccess, onToggleLogin }: CitizenRegisterProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await registerCitizen({ name, email, phone, password })
      if (res.success) {
        onSuccess()
      } else {
        setError(res.message)
      }
    } catch {
      setError("Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Citizen Registration</CardTitle>
          <CardDescription>Register to file eFIR complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />

            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />

            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
          <div className="mt-2 text-xs text-blue-500 cursor-pointer" onClick={onToggleLogin}>
            Back to Login
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
