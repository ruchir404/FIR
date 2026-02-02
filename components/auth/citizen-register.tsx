"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react"
import { registerCitizen, validateEmail, validatePhone, validatePassword } from "@/lib/auth"

interface CitizenRegisterProps {
  onSuccess: () => void
  onToggleLogin: () => void
}

export function CitizenRegister({ onSuccess, onToggleLogin }: CitizenRegisterProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }

      if (name === "password") {
        setPasswordValidation({
          length: value.length >= 8,
          uppercase: /[A-Z]/.test(value),
          lowercase: /[a-z]/.test(value),
          number: /[0-9]/.test(value),
        })
      }

      return updated
    })
    setError("")
  }

  const formatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 10)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      phone: formatPhoneNumber(e.target.value),
    }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Client-side validation
    if (!formData.name.trim()) {
      setError("Name is required")
      setIsLoading(false)
      return
    }

    if (!validateEmail(formData.email)) {
      setError("Invalid email format")
      setIsLoading(false)
      return
    }

    if (!validatePhone(formData.phone)) {
      setError("Phone number must be 10 digits")
      setIsLoading(false)
      return
    }

    const pwValidation = validatePassword(formData.password)
    if (!pwValidation.valid) {
      setError(pwValidation.message)
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const result = await registerCitizen(formData)
      if (result.success) {
        // Show success and redirect to login after a moment
        setTimeout(onSuccess, 500)
      } else {
        setError(result.message || "Registration failed")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid =
    formData.name &&
    validateEmail(formData.email) &&
    validatePhone(formData.phone) &&
    passwordValidation.length &&
    passwordValidation.uppercase &&
    passwordValidation.lowercase &&
    passwordValidation.number &&
    formData.password === formData.confirmPassword

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Citizen Registration</CardTitle>
          <CardDescription>Create an account to file eFIR complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="10-digit phone number"
                value={formData.phone}
                onChange={handlePhoneChange}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  value={formData.password}
                  onChange={handleInputChange}
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
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  {passwordValidation.length ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <X size={14} className="text-red-600" />
                  )}
                  <span>8+ characters</span>
                </div>
                <div className="flex items-center gap-1">
                  {passwordValidation.uppercase ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <X size={14} className="text-red-600" />
                  )}
                  <span>Uppercase</span>
                </div>
                <div className="flex items-center gap-1">
                  {passwordValidation.lowercase ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <X size={14} className="text-red-600" />
                  )}
                  <span>Lowercase</span>
                </div>
                <div className="flex items-center gap-1">
                  {passwordValidation.number ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <X size={14} className="text-red-600" />
                  )}
                  <span>Number</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="text-xs flex items-center gap-1">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check size={14} className="text-green-600" />
                      <span className="text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X size={14} className="text-red-600" />
                      <span className="text-red-600">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onToggleLogin}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign in
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
