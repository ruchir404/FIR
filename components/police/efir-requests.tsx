"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

import {
  getPendingEFIRsByStation,
  updateEFIRStatus,
  type EFIR,
} from "@/lib/efir"

import { getCurrentUser } from "@/lib/auth"
import { mapEFIRToFIRForm } from "@/lib/efir-to-fir"

/* ======================================================
   PROPS
====================================================== */

interface EFIRRequestsProps {
  onConvertToFIR: (formData: any) => void
}

/* ======================================================
   COMPONENT
====================================================== */

export function EFIRRequests({ onConvertToFIR }: EFIRRequestsProps) {
  const [efirs, setEFIRs] = useState<EFIR[]>([])
  const [selectedEFIR, setSelectedEFIR] = useState<EFIR | null>(null)
  const [remarks, setRemarks] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const user = getCurrentUser()

  /* ======================================================
     LOAD EFIRS (STATION-WISE)
  ====================================================== */

  const loadEFIRs = async () => {
    if (!user?.station) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const pending = await getPendingEFIRsByStation("Vakola")
      setEFIRs(pending)
    } catch (err) {
      console.error("Failed to load eFIRs", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEFIRs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.station])

  /* ======================================================
     ACCEPT → CONVERT TO FIR
  ====================================================== */

  const handleAccept = async (efir: EFIR) => {
    if (!user?.badgeNumber) {
      alert("Police session expired. Please login again.")
      return
    }

    setIsProcessing(true)

    try {
      const firFormData = mapEFIRToFIRForm(efir)

      await updateEFIRStatus(
        efir.id,
        "accepted",
        "Converted to FIR",
        user.badgeNumber
      )

      onConvertToFIR(firFormData)
      await loadEFIRs()
    } catch (err) {
      console.error("Failed to convert eFIR", err)
    } finally {
      setIsProcessing(false)
    }
  }

  /* ======================================================
     REJECT FLOW
  ====================================================== */

  const handleReject = (efir: EFIR) => {
    setSelectedEFIR(efir)
    setRemarks("")
    setIsDialogOpen(true)
  }

  const submitReject = async () => {
    if (!selectedEFIR || !user?.badgeNumber) return

    setIsProcessing(true)

    try {
      await updateEFIRStatus(
        selectedEFIR.id,
        "rejected",
        remarks,
        user.badgeNumber
      )

      await loadEFIRs()
      setIsDialogOpen(false)
      setSelectedEFIR(null)
      setRemarks("")
    } catch (err) {
      console.error("Failed to reject eFIR", err)
    } finally {
      setIsProcessing(false)
    }
  }

  /* ======================================================
     DEADLINE STATUS
  ====================================================== */

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const daysRemaining = Math.ceil(
      (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysRemaining < 0)
      return { color: "text-gray-600", icon: AlertCircle, text: "Expired" }

    if (daysRemaining <= 1)
      return {
        color: "text-red-600",
        icon: AlertCircle,
        text: `${daysRemaining} day left`,
      }

    return {
      color: "text-blue-600",
      icon: Clock,
      text: `${daysRemaining} days left`,
    }
  }

  /* ======================================================
     UI
  ====================================================== */

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Clock className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Citizen eFIR Requests</h2>
        <p className="text-muted-foreground">
          Pending eFIRs for {user?.station}
        </p>
      </div>

      {efirs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <p className="text-lg font-medium">All caught up</p>
            <p className="text-muted-foreground">
              No pending eFIR requests
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {efirs.map((efir) => {
            const deadline = getDeadlineStatus(efir.validationDeadline)
            const DeadlineIcon = deadline.icon

            return (
              <Card key={efir.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{efir.id}</CardTitle>
                      <CardDescription>
                        {efir.citizenName} • {efir.citizenPhone}
                      </CardDescription>
                    </div>

                    <div
                      className={`flex items-center gap-1 ${deadline.color}`}
                    >
                      <DeadlineIcon className="h-4 w-4" />
                      <span className="text-sm">{deadline.text}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs">Incident Type</Label>
                      <p>{efir.incidentType}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Location</Label>
                      <p>{efir.location}</p>
                    </div>
                    <div>
                      <Label className="text-xs">District</Label>
                      <p>{efir.district}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Police Station</Label>
                      <p>{efir.policeStation}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Description</Label>
                    <p className="text-sm mt-1">
                      {efir.incidentDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {efir.bnsSection.map((section) => (
                      <Badge key={section} variant="secondary">
                        {section}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      disabled={isProcessing}
                      onClick={() => handleAccept(efir)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Convert to FIR
                    </Button>

                    <Button
                      variant="destructive"
                      className="flex-1"
                      disabled={isProcessing}
                      onClick={() => handleReject(efir)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* REJECT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject eFIR</DialogTitle>
            <DialogDescription>
              {selectedEFIR?.id} • {selectedEFIR?.citizenName}
            </DialogDescription>
          </DialogHeader>

          <Label>Reason for rejection</Label>
          <Textarea
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isProcessing}
              onClick={submitReject}
            >
              Reject eFIR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
