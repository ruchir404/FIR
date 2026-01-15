export interface EFIR {
  id: string
  citizenId: string
  citizenName: string
  citizenPhone: string
  citizenEmail: string
  status: "pending" | "under_review" | "accepted" | "rejected" | "expired"
  submissionDate: string
  validationDeadline: string
  incidentType: string
  incidentDescription: string
  incidentDate: string
  incidentTime: string
  location: string
  district: string
  policeStation: string
  beatNumber: string
  bnsSection: string[]
  policeRemarks?: string
  acceptedBy?: string
  acceptedDate?: string
}

export const createEFIR = (data: Omit<EFIR, "id" | "status" | "submissionDate" | "validationDeadline">): EFIR => {
  const now = new Date()
  const deadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  const efir: EFIR = {
    ...data,
    id: `EFIR_${Date.now()}`,
    status: "pending",
    submissionDate: now.toISOString(),
    validationDeadline: deadline.toISOString(),
  }

  const efirs = JSON.parse(localStorage.getItem("efirs") || "[]")
  efirs.push(efir)
  localStorage.setItem("efirs", JSON.stringify(efirs))
  return efir
}

export const getEFIRsByCitizen = (citizenId: string): EFIR[] => {
  const efirs = JSON.parse(localStorage.getItem("efirs") || "[]")
  return efirs.filter((e: EFIR) => e.citizenId === citizenId)
}

export const getPendingEFIRs = (): EFIR[] => {
  const efirs = JSON.parse(localStorage.getItem("efirs") || "[]")
  return efirs.filter((e: EFIR) => e.status === "pending")
}

export const updateEFIRStatus = (
  efirId: string,
  status: EFIR["status"],
  remarks?: string,
  acceptedBy?: string,
): EFIR | null => {
  const efirs = JSON.parse(localStorage.getItem("efirs") || "[]")
  const index = efirs.findIndex((e: EFIR) => e.id === efirId)

  if (index !== -1) {
    efirs[index].status = status
    if (remarks) efirs[index].policeRemarks = remarks
    if (acceptedBy) {
      efirs[index].acceptedBy = acceptedBy
      efirs[index].acceptedDate = new Date().toISOString()
    }
    localStorage.setItem("efirs", JSON.stringify(efirs))
    return efirs[index]
  }
  return null
}

export const checkAndExpireEFIRs = () => {
  const efirs = JSON.parse(localStorage.getItem("efirs") || "[]")
  const now = new Date()

  efirs.forEach((e: EFIR) => {
    if (e.status === "pending" && new Date(e.validationDeadline) < now) {
      e.status = "expired"
    }
  })

  localStorage.setItem("efirs", JSON.stringify(efirs))
}

export const getEFIRById = (id: string): EFIR | null => {
  const efirs = JSON.parse(localStorage.getItem("efirs") || "[]")
  return efirs.find((e: EFIR) => e.id === id) || null
}
