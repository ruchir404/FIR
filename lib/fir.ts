import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/FirebaseConfig"

/* =======================
   TYPES
======================= */

export interface FIR {
  id: string
  firNumber: string
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

/* =======================
   COLLECTION REF
======================= */

const firsRef = collection(db, "firs")

/* =======================
   HELPERS
======================= */

const formatTimestamp = (ts?: Timestamp) =>
  ts ? ts.toDate().toISOString() : new Date().toISOString()

const generateFIRNumber = async () => {
  const snapshot = await getDocs(firsRef)
  const count = snapshot.size + 1
  const year = new Date().getFullYear()
  return `FIR${String(count).padStart(3, "0")}/${year}`
}

/* =======================
   READ
======================= */

export const getAllFIRs = async (): Promise<FIR[]> => {
  const q = query(firsRef, orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      createdAt: formatTimestamp(data.createdAt),
      updatedAt: formatTimestamp(data.updatedAt),
    } as FIR
  })
}

export const getFIRById = async (id: string): Promise<FIR | null> => {
  const ref = doc(db, "firs", id)
  const snap = await getDoc(ref)

  if (!snap.exists()) return null

  const data = snap.data()
  return {
    id: snap.id,
    ...data,
    createdAt: formatTimestamp(data.createdAt),
    updatedAt: formatTimestamp(data.updatedAt),
  } as FIR
}

/* =======================
   CREATE
======================= */

export const createFIR = async (
  formData: FIRFormData,
  createdBy: string,
  bnsSections: string[] = []
): Promise<FIR> => {
  const firNumber = await generateFIRNumber()

  const payload = {
    firNumber,
    ...formData,

    status: "Registered",
    assignedOfficer: createdBy,

    bnsSection: bnsSections[0] || "",
    bnsSections,

    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(firsRef, payload)
  const savedSnap = await getDoc(docRef)

  const savedData = savedSnap.data()!

  return {
    id: docRef.id,
    ...savedData,
    createdAt: formatTimestamp(savedData.createdAt),
    updatedAt: formatTimestamp(savedData.updatedAt),
  } as FIR
}

/* =======================
   UPDATE
======================= */

export const updateFIR = async (
  id: string,
  formData: FIRFormData,
  bnsSections: string[] = []
): Promise<void> => {
  const ref = doc(db, "firs", id)

  await updateDoc(ref, {
    ...formData,
    bnsSection: bnsSections[0] || "",
    bnsSections,
    updatedAt: serverTimestamp(),
  })
}

/* =======================
   STATUS UPDATE
======================= */

export const updateFIRStatus = async (
  id: string,
  status: FIR["status"]
): Promise<void> => {
  const ref = doc(db, "firs", id)

  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  })
}

/* =======================
   CONSTANTS
======================= */

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
  "Rape",
  "Kidnap",
  "Child Marriage",
  "Other",
]
