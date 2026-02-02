export interface FIR {
  id: string
  firNumber: string
  dateTime: string
  complainantName: string
  complainantPhone: string
  complainantAddress: string
  incidentType: string
  incidentLocation: string
  incidentDateTime: string
  description: string
  priority: "Low" | "Medium" | "High" | "Critical"
  status: "Registered" | "Under Investigation" | "Evidence Collection" | "Pending" | "Closed"
  assignedOfficer: string
  bnsSection?: string
  bnsSections?: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
  fatherHusbandName?: string
  dateOfBirth?: string
  nationality?: string
  occupation?: string
  policeStation?: string
  district?: string
  directionDistance?: string
  beatNumber?: string
  informationType?: string
  reasonForDelay?: string
  propertiesInvolved?: string
}

export interface FIRFormData {
  complainantName: string
  complainantPhone: string
  complainantAddress: string
  incidentType: string
  incidentLocation: string
  incidentDateTime: string
  description: string
  priority: "Low" | "Medium" | "High" | "Critical"
  fatherHusbandName?: string
  dateOfBirth?: string
  nationality?: string
  occupation?: string
  policeStation?: string
  district?: string
  directionDistance?: string
  beatNumber?: string
  informationType?: "Written" | "Oral"
  reasonForDelay?: string
  propertiesInvolved?: string
}

// -----------------------------
// Backend Fetch Functions
// -----------------------------

export const getAllFIRs = async (): Promise<FIR[]> => {
  const res = await fetch("http://127.0.0.1:5000/get_firs")
  const data = await res.json()
  return data.firs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const getFIRById = async (id: string): Promise<FIR | null> => {
  const firs = await getAllFIRs()
  return firs.find((fir) => fir.id === id) || null
}

export const createFIR = async (formData: FIRFormData, createdBy: string, bnsSections?: string[]): Promise<FIR> => {
  const newFIR: FIR = {
    id: Date.now().toString(),
    firNumber: `FIR${String(Math.floor(Math.random() * 900) + 100)}/2026`,
    dateTime: new Date().toISOString(),
    ...formData,
    status: "Registered",
    assignedOfficer: createdBy,
    bnsSection: bnsSections?.[0],
    bnsSections,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await fetch("http://127.0.0.1:5000/save_fir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newFIR),
  })

  return newFIR
}

export const updateFIR = async (id: string, formData: FIRFormData, bnsSections?: string[]): Promise<FIR | null> => {
  const fir = await getFIRById(id)
  if (!fir) return null

  const updatedFIR = {
    ...fir,
    ...formData,
    bnsSection: bnsSections?.[0],
    bnsSections,
    updatedAt: new Date().toISOString(),
  }

  await fetch("http://127.0.0.1:5000/save_fir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedFIR),
  })

  return updatedFIR
}

export const updateFIRStatus = async (id: string, status: FIR["status"]): Promise<FIR | null> => {
  const fir = await getFIRById(id)
  if (!fir) return null

  const updated = { ...fir, status, updatedAt: new Date().toISOString() }

  await fetch("http://127.0.0.1:5000/save_fir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  })

  return updated
}

export const searchFIRs = async (query: string): Promise<FIR[]> => {
  const firs = await getAllFIRs()
  if (!query.trim()) return firs

  const q = query.toLowerCase()
  return firs.filter(
    (fir) =>
      fir.firNumber.toLowerCase().includes(q) ||
      fir.complainantName.toLowerCase().includes(q) ||
      fir.incidentType.toLowerCase().includes(q) ||
      fir.incidentLocation.toLowerCase().includes(q) ||
      fir.description.toLowerCase().includes(q),
  )
}

export const getIncidentTypes = () => [
  "Theft",
  "Robbery",
  "Burglary",
  "Assault",
  "Domestic Violence",
  "Fraud",
  "Cybercrime",
  "Drug Offense",
  "Traffic Violation",
  "Vandalism",
  "Missing Person",
  "Other",
]