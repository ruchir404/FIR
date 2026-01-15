// =======================
// TYPES
// =======================

export interface User {
  id: string
  badgeNumber?: string        // police only
  name: string
  rank?: string               // police only
  station?: string            // police only
  role: "officer" | "citizen"   // removed admin
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
}

// =======================
// STORAGE KEYS
// =======================

const CITIZEN_STORAGE_KEY = "registered_citizens"
const CURRENT_USER_KEY = "fir_user"

// =======================
// MOCK DATA (POLICE)
// =======================

const mockPoliceUsers: (User & { password: string })[] = [
  {
    id: "1",
    badgeNumber: "PO001",
    password: "password123",
    name: "Officer John Smith",
    rank: "Police Officer",
    station: "Central Station",
    role: "officer",
  },
  // admin removed completely
]

// =======================
// HELPERS (CITIZEN STORAGE)
// =======================

const getStoredCitizens = (): (User & {
  phone: string
  email: string
  password: string
})[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(CITIZEN_STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

const saveCitizens = (citizens: any[]) => {
  localStorage.setItem(CITIZEN_STORAGE_KEY, JSON.stringify(citizens))
}

// =======================
// POLICE AUTH
// =======================

export const login = async (
  credentials: LoginCredentials
): Promise<User | null> => {
  // small delay for realism
  await new Promise((r) => setTimeout(r, 500))

  // trim and uppercase badge number to avoid errors
  const badgeNumber = credentials.badgeNumber.trim().toUpperCase()
  const password = credentials.password.trim()

  const user = mockPoliceUsers.find(
    (u) => u.badgeNumber?.toUpperCase() === badgeNumber && u.password === password
  )

  if (!user) return null

  const { password: _pwd, ...safeUser } = user
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
  return safeUser
}

// =======================
// CITIZEN AUTH
// =======================

export const registerCitizen = async (
  data: CitizenRegisterData
): Promise<{ success: boolean; message: string }> => {
  await new Promise((r) => setTimeout(r, 500))

  const citizens = getStoredCitizens()

  const exists = citizens.some((c) => c.phone === data.phone.trim())
  if (exists) {
    return { success: false, message: "Citizen already registered" }
  }

  citizens.push({
    id: Date.now().toString(),
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    password: data.password, // plaintext for demo
    role: "citizen",
  })

  saveCitizens(citizens)

  return { success: true, message: "Citizen registered successfully" }
}

export const loginCitizen = async (
  credentials: CitizenLoginCredentials
): Promise<User | null> => {
  await new Promise((r) => setTimeout(r, 500))

  const citizens = getStoredCitizens()

  const citizen = citizens.find(
    (c) =>
      c.phone === credentials.phone.trim() &&
      c.password === credentials.password.trim()
  )

  if (!citizen) return null

  const { password: _pwd, ...safeCitizen } = citizen
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeCitizen))
  return safeCitizen
}

// =======================
// COMMON HELPERS
// =======================

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY)
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
