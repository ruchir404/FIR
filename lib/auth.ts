import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { auth, db } from "@/lib/FirebaseConfig"


// =======================
// TYPES
// =======================

export interface User {
  id: string
  email: string
  phone?: string
  name: string
  role: "officer" | "citizen"
  badgeNumber?: string
  rank?: string
  station?: string
  department?: string
  createdAt: string
  lastLogin: string
  isVerified?: boolean
}

export interface LoginCredentials {
  badgeNumber: string
  password: string
}

export interface CitizenLoginCredentials {
  phone: string
  password: string
}

export interface CitizenRegisterData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface PoliceRegisterData {
  name: string
  email: string
  badgeNumber: string
  rank: string
  station: string
  department: string
  password: string
  confirmPassword: string
}

// =======================
// STORAGE KEYS
// =======================

const CITIZEN_STORAGE_KEY = "fir_registered_citizens"
const POLICE_STORAGE_KEY = "fir_registered_police"
const CURRENT_USER_KEY = "fir_user"
const AUTH_TOKEN_KEY = "fir_auth_token"

// =======================
// MOCK DATA (FOR DEMO)
// =======================

const mockPoliceUsers: (User & { password: string })[] = [
  {
    id: "police_1",
    email: "john.smith@police.gov",
    name: "Officer John Smith",
    badgeNumber: "PO001",
    rank: "Police Officer",
    station: "Central Station",
    department: "Criminal Investigation",
    password: "password123",
    role: "officer",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isVerified: true,
  },
  {
    id: "police_2",
    email: "sarah.johnson@police.gov",
    name: "Inspector Sarah Johnson",
    badgeNumber: "PO002",
    rank: "Inspector",
    station: "North Station",
    department: "Cyber Crime",
    password: "password123",
    role: "officer",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isVerified: true,
  },
]

const mockCitizenUsers: (User & { password: string })[] = [
  {
    id: "citizen_1",
    email: "citizen1@example.com",
    phone: "9999999999",
    name: "Raj Kumar",
    password: "citizen123",
    role: "citizen",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isVerified: true,
  },
]

// =======================
// HELPERS (STORAGE)
// =======================

// const getStoredCitizens = (): (User & {
//   phone: string
//   password: string
// })[] => {
//   if (typeof window === "undefined") return []
//   const data = localStorage.getItem(CITIZEN_STORAGE_KEY)
//   return data ? JSON.parse(data) : mockCitizenUsers
// }

const getStoredPolice = (): (User & { password: string })[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(POLICE_STORAGE_KEY)
  return data ? JSON.parse(data) : mockPoliceUsers
}

const saveCitizens = (citizens: any[]) => {
  localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(citizens))
}

const savePolice = (police: any[]) => {
  localStorage.setItem(POLICE_STORAGE_KEY, JSON.stringify(police))
}

// =======================
// VALIDATION HELPERS
// =======================

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const re = /^[0-9]{10}$/
  return re.test(phone.replace(/\D/g, ""))
}

export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" }
  }
  return { valid: true, message: "" }
}

// =======================
// POLICE AUTH
// =======================

export const registerPolice = async (
  data: PoliceRegisterData
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // Validation
    if (!validateEmail(data.email)) {
      return { success: false, message: "Invalid email format" }
    }

    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.valid) {
      return { success: false, message: passwordValidation.message }
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, message: "Passwords do not match" }
    }

    // 🔍 Check badge number uniqueness
    const badgeQuery = query(
      collection(db, "police_officers"),
      where("badgeNumber", "==", data.badgeNumber.trim().toUpperCase())
    )

    const badgeSnap = await getDocs(badgeQuery)
    if (!badgeSnap.empty) {
      return { success: false, message: "Officer already registered with this badge number" }
    }

    // 🔐 Firebase Auth
    const cred = await createUserWithEmailAndPassword(
      auth,
      data.email.trim(),
      data.password
    )

    const firebaseUser = cred.user

    const officerDoc: User = {
      id: firebaseUser.uid,
      name: data.name.trim(),
      email: data.email.trim(),
      badgeNumber: data.badgeNumber.trim().toUpperCase(),
      rank: data.rank,
      station: data.station,
      department: data.department,
      role: "officer",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isVerified: true,
    }

    await setDoc(doc(db, "police_officers", firebaseUser.uid), {
      ...officerDoc,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    })

    return {
      success: true,
      message: "Police officer registered successfully",
      user: officerDoc,
    }
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      return { success: false, message: "Email already registered" }
    }

    console.error("Police register error:", error)
    return { success: false, message: "Registration failed" }
  }
}


export const loginPolice = async (
  credentials: LoginCredentials
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const badgeNumber = credentials.badgeNumber.trim().toUpperCase()
    const password = credentials.password.trim()

    // 🔍 Find officer by badge number
    const q = query(
      collection(db, "police_officers"),
      where("badgeNumber", "==", badgeNumber)
    )

    const snap = await getDocs(q)
    if (snap.empty) {
      return { success: false, message: "Invalid badge number or password" }
    }

    const officer = snap.docs[0].data() as User

    // 🔐 Firebase Auth login using email
    await signInWithEmailAndPassword(auth, officer.email, password)

    const loggedInOfficer: User = {
      ...officer,
      lastLogin: new Date().toISOString(),
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedInOfficer))
    localStorage.setItem(AUTH_TOKEN_KEY, `token_${loggedInOfficer.id}_${Date.now()}`)

    return {
      success: true,
      message: "Login successful",
      user: loggedInOfficer,
    }
  } catch (error) {
    console.error("Police login error:", error)
    return { success: false, message: "Invalid badge number or password" }
  }
}


// =======================
// CITIZEN AUTH
// =======================

// export const registerCitizen = async (
//   data: CitizenRegisterData
// ): Promise<{ success: boolean; message: string; user?: User }> => {
//   await new Promise((r) => setTimeout(r, 500))

//   // Validation
//   if (!validateEmail(data.email)) {
//     return { success: false, message: "Invalid email format" }
//   }

//   if (!validatePhone(data.phone)) {
//     return { success: false, message: "Invalid phone number (must be 10 digits)" }
//   }

//   const passwordValidation = validatePassword(data.password)
//   if (!passwordValidation.valid) {
//     return { success: false, message: passwordValidation.message }
//   }

//   if (data.password !== data.confirmPassword) {
//     return { success: false, message: "Passwords do not match" }
//   }

//   const citizens = getStoredCitizens()

//   const exists = citizens.some((c) => c.email === data.email.trim() || c.phone === data.phone.trim())
//   if (exists) {
//     return { success: false, message: "Citizen already registered with this email or phone" }
//   }

//   const newCitizen: User & { password: string } = {
//     id: `citizen_${Date.now()}`,
//     name: data.name.trim(),
//     email: data.email.trim(),
//     phone: data.phone.trim(),
//     password: data.password,
//     role: "citizen",
//     createdAt: new Date().toISOString(),
//     lastLogin: new Date().toISOString(),
//     isVerified: false,
//   }

//   citizens.push(newCitizen)
//   saveCitizens(citizens)

//   const { password: _, ...safeUser } = newCitizen
//   return { success: true, message: "Citizen registered successfully", user: safeUser }
// }

export const registerCitizen = async (
  data: CitizenRegisterData
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    // Validation (keep same behavior)
    if (!validateEmail(data.email)) {
      return { success: false, message: "Invalid email format" }
    }

    if (!validatePhone(data.phone)) {
      return { success: false, message: "Invalid phone number (must be 10 digits)" }
    }

    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.valid) {
      return { success: false, message: passwordValidation.message }
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, message: "Passwords do not match" }
    }

    // 🔍 Check phone uniqueness
    const phoneQuery = query(
      collection(db, "citizens"),
      where("phone", "==", data.phone.trim())
    )

    const phoneSnap = await getDocs(phoneQuery)
    if (!phoneSnap.empty) {
      return { success: false, message: "Citizen already registered with this phone" }
    }

    // 🔐 Firebase Auth (email + password)
    const cred = await createUserWithEmailAndPassword(
      auth,
      data.email.trim(),
      data.password
    )

    const firebaseUser = cred.user

    // 🧾 Firestore profile
    const citizenDoc: User = {
      id: firebaseUser.uid,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      role: "citizen",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isVerified: true,
    }

    await setDoc(doc(db, "citizens", firebaseUser.uid), {
      ...citizenDoc,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    })

    return { success: true, message: "Citizen registered successfully", user: citizenDoc }
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      return { success: false, message: "Email already registered" }
    }

    return { success: false, message: "Registration failed" }
  }
}


// export const loginCitizen = async (
//   credentials: CitizenLoginCredentials
// ): Promise<{ success: boolean; message: string; user?: User }> => {
//   await new Promise((r) => setTimeout(r, 500))

//   const phone = credentials.phone.trim()
//   const password = credentials.password.trim()

//   const citizens = getStoredCitizens()

//   const citizen = citizens.find((c) => c.phone === phone && c.password === password)

//   if (!citizen) {
//     return { success: false, message: "Invalid phone number or password" }
//   }

//   // Update last login
//   citizen.lastLogin = new Date().toISOString()
//   saveCitizens(citizens)

//   const { password: _pwd, ...safeCitizen } = citizen
//   localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeCitizen))
//   localStorage.setItem(AUTH_TOKEN_KEY, `token_${safeCitizen.id}_${Date.now()}`)

//   return { success: true, message: "Login successful", user: safeCitizen }
// }

// =======================
// COMMON HELPERS
// =======================

export const loginCitizen = async (
  credentials: CitizenLoginCredentials
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const phone = credentials.phone.trim()
    const password = credentials.password.trim()

    // 🔍 Find citizen by phone
    const q = query(
      collection(db, "citizens"),
      where("phone", "==", phone)
    )

    const snap = await getDocs(q)
    if (snap.empty) {
      return { success: false, message: "Invalid phone number or password" }
    }

    const citizen = snap.docs[0].data() as User

    // 🔐 Firebase Auth login using email
    await signInWithEmailAndPassword(auth, citizen.email, password)

    const loggedInUser: User = {
      ...citizen,
      lastLogin: new Date().toISOString(),
    }

    return {
      success: true,
      message: "Login successful",
      user: loggedInUser,
    }
  } catch {
    return { success: false, message: "Invalid phone number or password" }
  }
}

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY)
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem(CURRENT_USER_KEY)
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}

export const isPoliceOfficer = (): boolean => {
  const user = getCurrentUser()
  return user?.role === "officer"
}

export const isCitizen = (): boolean => {
  const user = getCurrentUser()
  return user?.role === "citizen"
}
