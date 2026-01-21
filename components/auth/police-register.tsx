"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react"
import { registerPolice, validateEmail, validatePassword } from "@/lib/auth"

interface PoliceRegisterProps {
  onSuccess: () => void
  onToggleLogin: () => void
}

export function PoliceRegister({ onSuccess, onToggleLogin }: PoliceRegisterProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    badgeNumber: "",
    rank: "",
    station: "",
    department: "",
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
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

    if (!formData.badgeNumber.trim()) {
      setError("Badge number is required")
      setIsLoading(false)
      return
    }

    if (!formData.rank || !formData.station || !formData.department) {
      setError("All fields are required")
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
      const result = await registerPolice(formData)
      if (result.success) {
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
    formData.badgeNumber &&
    formData.rank &&
    formData.station &&
    formData.department &&
    passwordValidation.length &&
    passwordValidation.uppercase &&
    passwordValidation.lowercase &&
    passwordValidation.number &&
    formData.password === formData.confirmPassword

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Police Officer Registration</CardTitle>
          <CardDescription>Register a new police officer account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Officer name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="officer@police.gov"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="badgeNumber" className="text-sm">
                Badge Number
              </Label>
              <Input
                id="badgeNumber"
                name="badgeNumber"
                placeholder="e.g., PO001"
                value={formData.badgeNumber}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    badgeNumber: e.target.value.toUpperCase(),
                  }))
                  setError("")
                }}
                required
                disabled={isLoading}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="rank" className="text-sm">
                Rank
              </Label>
              <Select value={formData.rank} onValueChange={(value) => handleSelectChange("rank", value)}>
                <SelectTrigger id="rank" disabled={isLoading}>
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Constable">Constable</SelectItem>
                  <SelectItem value="Head Constable">Head Constable</SelectItem>
                  <SelectItem value="Police Officer">Police Officer</SelectItem>
                  <SelectItem value="Sub-Inspector">Sub-Inspector</SelectItem>
                  <SelectItem value="Inspector">Inspector</SelectItem>
                  <SelectItem value="Senior Inspector">Senior Inspector</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="station" className="text-sm">
                Station
              </Label>
              <Input
                id="station"
                name="station"
                placeholder="Police station name"
                value={formData.station}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="department" className="text-sm">
                Department
              </Label>
              <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)}>
                <SelectTrigger id="department" disabled={isLoading}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Criminal Investigation">Criminal Investigation</SelectItem>
                  <SelectItem value="Cyber Crime">Cyber Crime</SelectItem>
                  <SelectItem value="Traffic">Traffic</SelectItem>
                  <SelectItem value="Community Policing">Community Policing</SelectItem>
                  <SelectItem value="Special Forces">Special Forces</SelectItem>
                  <SelectItem value="Narcotics">Narcotics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
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
                  size="sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                <div className="flex items-center gap-1">
                  {passwordValidation.length ? (
                    <Check size={12} className="text-green-600" />
                  ) : (
                    <X size={12} className="text-red-600" />
                  )}
                  <span>8+ chars</span>
                </div>
                <div className="flex items-center gap-1">
                  {passwordValidation.uppercase ? (
                    <Check size={12} className="text-green-600" />
                  ) : (
                    <X size={12} className="text-red-600" />
                  )}
                  <span>Uppercase</span>
                </div>
                <div className="flex items-center gap-1">
                  {passwordValidation.lowercase ? (
                    <Check size={12} className="text-green-600" />
                  ) : (
                    <X size={12} className="text-red-600" />
                  )}
                  <span>Lowercase</span>
                </div>
                <div className="flex items-center gap-1">
                  {passwordValidation.number ? (
                    <Check size={12} className="text-green-600" />
                  ) : (
                    <X size={12} className="text-red-600" />
                  )}
                  <span>Number</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  size="sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="text-xs flex items-center gap-1">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check size={12} className="text-green-600" />
                      <span className="text-green-600">Match</span>
                    </>
                  ) : (
                    <>
                      <X size={12} className="text-red-600" />
                      <span className="text-red-600">No match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="text-sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Registering...
                </>
              ) : (
                "Register Officer"
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already registered?{" "}
              <button
                type="button"
                onClick={onToggleLogin}
                className="text-red-600 hover:text-red-700 font-semibold"
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
