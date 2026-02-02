"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, X, MapPin } from "lucide-react"
import { createFIR, updateFIR, getIncidentTypes, type FIRFormData } from "@/lib/fir"
import { getCurrentUser } from "@/lib/auth"
import type { FIR } from "@/lib/types" // Import FIR type
import { BNSSuggestionsPanel } from "./bns-suggestions-panel"

interface FIRFormProps {
  onSuccess: () => void
  onCancel: () => void
  editingFIR?: FIR | null
  initialData?: Partial<FIRFormData> | null
}


export function FIRForm({
  onSuccess,
  onCancel,
  editingFIR,
  initialData,
}: FIRFormProps) {
  const user = getCurrentUser()
  
  // const [formData, setFormData] = useState<FIRFormData>({
  //   complainantName: "",
  //   complainantPhone: "",
  //   complainantAddress: "",
  //   incidentType: "",
  //   incidentLocation: "",
  //   incidentDateTime: "",
  //   description: "",
  //   priority: "Medium",
  //   fatherHusbandName: "",
  //   dateOfBirth: "",
  //   nationality: "Indian",
  //   occupation: "",
  //   policeStation: "",
  //   district: "",
  //   directionDistance: "",
  //   beatNumber: "",
  //   informationType: "Written",
  //   reasonForDelay: "",
  //   propertiesInvolved: "",
  // })

  const [formData, setFormData] = useState<FIRFormData>({
    complainantName: initialData?.complainantName || "",
    complainantPhone: initialData?.complainantPhone || "",
    complainantAddress: initialData?.complainantAddress || "",
    incidentType: initialData?.incidentType || "",
    incidentLocation: initialData?.incidentLocation || "",
    incidentDateTime: initialData?.incidentDateTime || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "Medium",
    policeStation: initialData?.policeStation,
    district: initialData?.district,
    beatNumber: initialData?.beatNumber,
    informationType: initialData?.informationType,
    reasonForDelay: initialData?.reasonForDelay,
    propertiesInvolved: initialData?.propertiesInvolved,
  })


  const [selectedBNSSections, setSelectedBNSSections] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  useEffect(() => {
    if (editingFIR) {
      setFormData({
        complainantName: editingFIR.complainantName || "",
        complainantPhone: editingFIR.complainantPhone || "",
        complainantAddress: editingFIR.complainantAddress || "",
        incidentType: editingFIR.incidentType || "",
        incidentLocation: editingFIR.incidentLocation || "",
        incidentDateTime: editingFIR.incidentDateTime || "",
        description: editingFIR.description || "",
        priority: editingFIR.priority || "Medium",
        fatherHusbandName: editingFIR.fatherHusbandName || "",
        dateOfBirth: editingFIR.dateOfBirth || "",
        nationality: editingFIR.nationality || "Indian",
        occupation: editingFIR.occupation || "",
        policeStation: editingFIR.policeStation || "",
        district: editingFIR.district || "",
        directionDistance: editingFIR.directionDistance || "",
        beatNumber: editingFIR.beatNumber || "",
        informationType: editingFIR.informationType || "Written",
        reasonForDelay: editingFIR.reasonForDelay || "",
        propertiesInvolved: editingFIR.propertiesInvolved || "",
      })

      if (editingFIR.bnsSections && editingFIR.bnsSections.length > 0) {
        setSelectedBNSSections(editingFIR.bnsSections)
      } else if (editingFIR.bnsSection) {
        setSelectedBNSSections([editingFIR.bnsSection])
      }
    }
  }, [editingFIR])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (editingFIR) {
        await updateFIR(editingFIR.id, formData, selectedBNSSections)
        setSuccess(`FIR ${editingFIR.firNumber} updated successfully!`)
      } else {
        const newFIR = await createFIR(formData, user.badgeNumber, selectedBNSSections)
        setSuccess(`FIR ${newFIR.firNumber} created successfully!`)
      }
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err) {
      setError(editingFIR ? "Failed to update FIR. Please try again." : "Failed to create FIR. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FIRFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        (error) => reject(error),
        { enableHighAccuracy: true }
      )
    })
  }

  // const handleAutoFillPoliceStation = async () => {
  //   try {
  //     setLocating(true)

  //     const { lat, lng } = await getUserLocation()

  //     const res = await fetch("/api/nearest-police-station", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ lat, lng }),
  //     })

  //     const data = await res.json()
  //     if (!res.ok) throw new Error(data.error)

  //     setFormData((prev) => ({
  //       ...prev,
  //       policeStation: data.name,
  //       directionDistance: data.address,
  //     }))
  //   } catch (err: any) {
  //     if (err?.code === 1) {
  //       alert("Location permission denied. Please enter details manually.")
  //     } else {
  //       alert("Unable to detect nearest police station.")
  //     }
  //   } finally {
  //     setLocating(false)
  //   }
  // }

  const handleAutoFillPoliceStation = async () => {
    try {
      console.log("📍 Detecting location...")
      setLocating(true)

      const { lat, lng } = await getUserLocation()
      console.log("📍 Coordinates:", lat, lng)

      const res = await fetch("/api/nearest-police-station", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      })

      console.log("🌐 API status:", res.status)

      const data = await res.json()
      console.log("🌐 API data:", data)

      if (!res.ok) throw new Error(data.error || "API failed")

      setFormData((prev) => ({
        ...prev,
        policeStation: data.name,
        directionDistance: data.address,
      }))
    } catch (err) {
      console.error("❌ Location error:", err)
      alert("Unable to detect nearest police station")
    } finally {
      setLocating(false)
    }
  }


  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{editingFIR ? "Edit FIR (Form IF1)" : "Register New FIR (Form IF1)"}</CardTitle>
          <CardDescription>
            {editingFIR
              ? "Update the FIR details according to official format"
              : "Fill in all details to register a new First Information Report according to official format"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* POLICE STATION */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  1. Police Station Details
                </h3>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoFillPoliceStation}
                  disabled={locating}
                >
                  {locating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Detecting…
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Use My Location
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="District"
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                />
                <Input
                  placeholder="Police Station"
                  value={formData.policeStation}
                  onChange={(e) => handleInputChange("policeStation", e.target.value)}
                />
                <Input
                  placeholder="Beat Number"
                  value={formData.beatNumber}
                  onChange={(e) => handleInputChange("beatNumber", e.target.value)}
                />
                <Input
                  placeholder="Direction & Distance"
                  value={formData.directionDistance}
                  onChange={(e) =>
                    handleInputChange("directionDistance", e.target.value)
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Complainant Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">2. Complainant / Informant Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="complainantName">Full Name *</Label>
                  <Input
                    id="complainantName"
                    value={formData.complainantName}
                    onChange={(e) => handleInputChange("complainantName", e.target.value)}
                    placeholder="Enter complainant's full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherHusbandName">Father's / Husband's Name</Label>
                  <Input
                    id="fatherHusbandName"
                    value={formData.fatherHusbandName}
                    onChange={(e) => handleInputChange("fatherHusbandName", e.target.value)}
                    placeholder="Enter father's or husband's name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                    placeholder="Indian"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    placeholder="Enter occupation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complainantPhone">Phone Number *</Label>
                  <Input
                    id="complainantPhone"
                    value={formData.complainantPhone}
                    onChange={(e) => handleInputChange("complainantPhone", e.target.value)}
                    placeholder="+91-XXXXXXXXXX"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="complainantAddress">Address *</Label>
                <Textarea
                  id="complainantAddress"
                  value={formData.complainantAddress}
                  onChange={(e) => handleInputChange("complainantAddress", e.target.value)}
                  placeholder="Enter complete address"
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Incident Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">3. Incident Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentType">Incident Type *</Label>
                  <Select
                    value={formData.incidentType}
                    onValueChange={(value) => handleInputChange("incidentType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getIncidentTypes().map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange("priority", value as FIRFormData["priority"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incidentLocation">Incident Location *</Label>
                <Input
                  id="incidentLocation"
                  value={formData.incidentLocation}
                  onChange={(e) => handleInputChange("incidentLocation", e.target.value)}
                  placeholder="Where did the incident occur?"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentDateTime">Incident Date & Time *</Label>
                  <Input
                    id="incidentDateTime"
                    type="datetime-local"
                    value={formData.incidentDateTime}
                    onChange={(e) => handleInputChange("incidentDateTime", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="informationType">Type of Information</Label>
                  <Select
                    value={formData.informationType || "Written"}
                    onValueChange={(value) => handleInputChange("informationType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Written">Written</SelectItem>
                      <SelectItem value="Oral">Oral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Incident Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Provide detailed description of the incident"
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reasonForDelay">Reason for Delay in Reporting (if any)</Label>
                <Textarea
                  id="reasonForDelay"
                  value={formData.reasonForDelay}
                  onChange={(e) => handleInputChange("reasonForDelay", e.target.value)}
                  placeholder="Explain if there was any delay in reporting"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertiesInvolved">Properties Involved / Stolen</Label>
                <Textarea
                  id="propertiesInvolved"
                  value={formData.propertiesInvolved}
                  onChange={(e) => handleInputChange("propertiesInvolved", e.target.value)}
                  placeholder="List properties involved or stolen (if applicable)"
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            {/* BNS Suggestions */}
            <BNSSuggestionsPanel
              incidentType={formData.incidentType}
              description={formData.description}
              location={formData.incidentLocation}
              onSelectSections={(sections) => {
                setSelectedBNSSections(sections)
                setFormData((prev) => ({
                  ...prev,
                  bnsSection: sections[0] || "",
                }))
              }}
              selectedSections={selectedBNSSections}
              isLoading={isLoading}
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || selectedBNSSections.length === 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating FIR...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create FIR
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
