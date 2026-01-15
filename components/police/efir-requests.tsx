"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { getPendingEFIRs, updateEFIRStatus, checkAndExpireEFIRs, type EFIR } from "@/lib/efir"
import { getCurrentUser } from "@/lib/auth"

export function EFIRRequests() {
  const [efirs, setEFIRs] = useState<EFIR[]>([])
  const [selectedEFIR, setSelectedEFIR] = useState<EFIR | null>(null)
  const [action, setAction] = useState<"accept" | "reject" | null>(null)
  const [remarks, setRemarks] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const user = getCurrentUser()

  useEffect(() => {
    loadEFIRs()
  }, [])

  const loadEFIRs = () => {
    checkAndExpireEFIRs()
    const pending = getPendingEFIRs()
    setEFIRs(pending)
  }

  const handleAccept = (efir: EFIR) => {
    setSelectedEFIR(efir)
    setAction("accept")
    setRemarks("")
    setIsDialogOpen(true)
  }

  const handleReject = (efir: EFIR) => {
    setSelectedEFIR(efir)
    setAction("reject")
    setRemarks("")
    setIsDialogOpen(true)
  }

  const submitAction = () => {
    if (!selectedEFIR || !action) return

    const newStatus = action === "accept" ? "accepted" : "rejected"
    updateEFIRStatus(selectedEFIR.id, newStatus, remarks, user?.badgeNumber)

    loadEFIRs()
    setIsDialogOpen(false)
    setSelectedEFIR(null)
    setAction(null)
    setRemarks("")
  }

  const getDeadlineStatus = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysRemaining < 0) return { color: "text-gray-600", icon: AlertCircle, text: "Expired" }
    if (daysRemaining <= 1) return { color: "text-red-600", icon: AlertCircle, text: `${daysRemaining} day left` }
    return { color: "text-blue-600", icon: Clock, text: `${daysRemaining} days left` }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Citizen eFIR Requests</h2>
        <p className="text-muted-foreground">Review and process citizen eFIR submissions</p>
      </div>

      {efirs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <p className="text-lg font-medium">All Caught Up!</p>
            <p className="text-muted-foreground mt-2">No pending eFIR requests at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {efirs.map((efir) => {
            const deadline = getDeadlineStatus(efir.validationDeadline)
            const DeadlineIcon = deadline.icon

            return (
              <Card key={efir.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{efir.id}</CardTitle>
                      <CardDescription className="mt-1">
                        Filed by {efir.citizenName} • {efir.citizenPhone}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DeadlineIcon className={`h-4 w-4 ${deadline.color}`} />
                      <span className={`text-sm font-medium ${deadline.color}`}>{deadline.text}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Incident Type</Label>
                      <p className="font-medium">{efir.incidentType}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Location</Label>
                      <p className="font-medium">{efir.location}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">District</Label>
                      <p className="font-medium">{efir.district}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Police Station</Label>
                      <p className="font-medium">{efir.policeStation}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm mt-1">{efir.incidentDescription}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Suggested BNS Sections</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {efir.bnsSection.map((section) => (
                        <Badge key={section} variant="secondary">
                          {section}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button onClick={() => handleAccept(efir)} className="flex-1" variant="default">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button onClick={() => handleReject(efir)} className="flex-1" variant="destructive">
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

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{action === "accept" ? "Accept eFIR" : "Reject eFIR"}</DialogTitle>
            <DialogDescription>
              {selectedEFIR?.id} • {selectedEFIR?.citizenName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="remarks">Remarks (optional)</Label>
              <Textarea
                id="remarks"
                placeholder={
                  action === "accept" ? "Enter acceptance remarks or instructions..." : "Enter reason for rejection..."
                }
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAction} variant={action === "accept" ? "default" : "destructive"}>
              {action === "accept" ? "Accept eFIR" : "Reject eFIR"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
