import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/FirebaseConfig"

/* =========================
   TYPES
========================= */

export interface EFIR {
  id: string
  citizenId: string
  citizenName: string
  fatherOrHusbandName: string
  dob: string
  nationality: string
  occupation: string
  citizenPhone: string
  citizenEmail: string
  address: string

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

/* =========================
   COLLECTION
========================= */

const efirsRef = collection(db, "efirs")

/* =========================
   HELPERS
========================= */

const toISO = (ts?: Timestamp) =>
  ts ? ts.toDate().toISOString() : new Date().toISOString()

const getValidationDeadline = () =>
  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

/* =========================
   CREATE eFIR (Citizen)
========================= */

export const createEFIR = async (
  data: Omit<
    EFIR,
    "id" | "status" | "submissionDate" | "validationDeadline"
  >
): Promise<EFIR> => {
  const deadline = getValidationDeadline()

  const payload = {
    ...data,
    status: "pending" as const,
    submissionDate: serverTimestamp(),
    validationDeadline: Timestamp.fromDate(deadline),
  }

  const docRef = await addDoc(efirsRef, payload)
  const snap = await getDoc(docRef)
  const saved = snap.data()!

  return {
    id: docRef.id,
    ...saved,
    submissionDate: toISO(saved.submissionDate),
    validationDeadline: toISO(saved.validationDeadline),
  } as EFIR
}

/* =========================
   READ — Citizen Dashboard
========================= */

export const getEFIRsByCitizen = async (
  citizenId: string
): Promise<EFIR[]> => {
  const q = query(
    efirsRef,
    where("citizenId", "==", citizenId),
    orderBy("submissionDate", "desc")
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      submissionDate: toISO(data.submissionDate),
      validationDeadline: toISO(data.validationDeadline),
      acceptedDate: data.acceptedDate
        ? toISO(data.acceptedDate)
        : undefined,
    } as EFIR
  })
}

/* =========================
   READ — Police Dashboard
========================= */

export const getPendingEFIRsByStation = async (
  policeStation: string
): Promise<EFIR[]> => {
  const q = query(
    efirsRef,
    where("policeStation", "==", policeStation),
    where("status", "==", "pending"),
    orderBy("submissionDate", "asc")
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      submissionDate: toISO(data.submissionDate),
      validationDeadline: toISO(data.validationDeadline),
    } as EFIR
  })
}

/* =========================
   UPDATE — Police Action
========================= */

export const updateEFIRStatus = async (
  efirId: string,
  status: EFIR["status"],
  remarks?: string,
  acceptedBy?: string
): Promise<void> => {
  const ref = doc(db, "efirs", efirId)

  const payload: any = {
    status,
  }

  if (remarks) payload.policeRemarks = remarks
  if (acceptedBy) {
    payload.acceptedBy = acceptedBy
    payload.acceptedDate = serverTimestamp()
  }

  await updateDoc(ref, payload)
}

/* =========================
   READ — Single eFIR
========================= */

export const getEFIRById = async (id: string): Promise<EFIR | null> => {
  const ref = doc(db, "efirs", id)
  const snap = await getDoc(ref)

  if (!snap.exists()) return null

  const data = snap.data()

  return {
    id: snap.id,
    ...data,
    submissionDate: toISO(data.submissionDate),
    validationDeadline: toISO(data.validationDeadline),
    acceptedDate: data.acceptedDate
      ? toISO(data.acceptedDate)
      : undefined,
  } as EFIR
}
