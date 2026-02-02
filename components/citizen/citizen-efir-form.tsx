"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createEFIR } from "@/lib/efir"
import { Loader2, ArrowLeft } from "lucide-react"

interface CitizenEFIRFormProps {
  citizen: any
  onSuccess: () => void
  onCancel: () => void
}

export function CitizenEFIRForm({ citizen, onSuccess, onCancel }: CitizenEFIRFormProps) {
  const [formData, setFormData] = useState({
    /* COMPLAINANT */
    citizenName: citizen.name || "",
    fatherOrHusbandName: "",
    dob: "",
    nationality: "Indian",
    occupation: "",
    citizenPhone: citizen.phone || "",
    address: "",

    /* INCIDENT */
    incidentType: "",
    incidentDescription: "",
    incidentDate: "",
    incidentTime: "",
    location: "",
    district: "",
    policeStation: "",
    beatNumber: "",
    bnsSection: [] as string[],
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createEFIR({
        citizenId: citizen.id,
        citizenEmail: citizen.email,

        /* COMPLAINANT */
        citizenName: formData.citizenName,
        fatherOrHusbandName: formData.fatherOrHusbandName,
        dob: formData.dob,
        nationality: formData.nationality,
        occupation: formData.occupation,
        citizenPhone: formData.citizenPhone,
        address: formData.address,

        /* INCIDENT */
        incidentType: formData.incidentType,
        incidentDescription: formData.incidentDescription,
        incidentDate: formData.incidentDate,
        incidentTime: formData.incidentTime,
        location: formData.location,
        district: formData.district,
        policeStation: formData.policeStation,
        beatNumber: formData.beatNumber,
        bnsSection: formData.bnsSection,
      })

      onSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Button variant="outline" className="mb-6 bg-transparent" onClick={onCancel}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>File New eFIR</CardTitle>
        </CardHeader>
        <CardContent>

          {/* =========================
   COMPLAINANT DETAILS
========================= */}
          <h3 className="text-lg font-semibold">
            2. Complainant / Informant Details
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.citizenName}
                onChange={(e) =>
                  setFormData({ ...formData, citizenName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Father&apos;s / Husband&apos;s Name</Label>
              <Input
                value={formData.fatherOrHusbandName}
                onChange={(e) =>
                  setFormData({ ...formData, fatherOrHusbandName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Nationality</Label>
              <Input
                value={formData.nationality}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Occupation</Label>
              <Input
                value={formData.occupation}
                onChange={(e) =>
                  setFormData({ ...formData, occupation: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input
                value={formData.citizenPhone}
                required
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address *</Label>
            <Textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incidentType">Type of Incident</Label>
                <Select
                  value={formData.incidentType}
                  onValueChange={(val) => setFormData({ ...formData, incidentType: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="assault">Assault</SelectItem>
                    <SelectItem value="fraud">Fraud</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  placeholder="District name"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location of Incident</Label>
              <Input
                id="location"
                placeholder="Full address"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incidentDate">Date</Label>
                <Input
                  id="incidentDate"
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incidentTime">Time</Label>
                <Input
                  id="incidentTime"
                  type="time"
                  value={formData.incidentTime}
                  onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policeStation">Police Station</Label>
                <Input
                  id="policeStation"
                  placeholder="Nearest PS"
                  value={formData.policeStation}
                  onChange={(e) => setFormData({ ...formData, policeStation: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incidentDescription">Describe the Incident</Label>
              <Textarea
                id="incidentDescription"
                placeholder="Provide detailed description of what happened"
                value={formData.incidentDescription}
                onChange={(e) => setFormData({ ...formData, incidentDescription: e.target.value })}
                className="min-h-32"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> You must visit the nearest police station within 3 days to validate this
                eFIR request.
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Filing...
                  </>
                ) : (
                  "File eFIR"
                )}
              </Button>
              <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
