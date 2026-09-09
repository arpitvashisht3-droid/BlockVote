import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type DemoUserRole = 'admin' | 'voter'

export interface UserProfile {
  id?: string
  email: string
  name: string
  username?: string
  role: DemoUserRole
  phone?: string
  dateOfBirth?: string
  country?: string
  state?: string
  countryState?: string
  city?: string
  walletAddress?: string
  isVerified?: boolean
  createdAt?: string
}

export interface RegisterInput {
  name: string
  username?: string
  email: string
  password?: string
  phone?: string
  dateOfBirth?: string
  country?: string
  state?: string
  city?: string
  walletAddress?: string
  role?: DemoUserRole
}

interface DemoAuthContextType {
  user: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, pass: string, role?: DemoUserRole) => Promise<UserProfile>
  createAccount: (data: RegisterInput | (string & any), email?: string, pass?: string, role?: DemoUserRole) => Promise<UserProfile>
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>
  refreshUser: () => Promise<UserProfile | null>
  logout: () => void
}

const TOKEN_KEY = 'blockvote_token'
const SESSION_KEY = 'blockvote_session'
const API_BASE_URL = 'http://localhost:3000/api'

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined)

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Ignore
    }
    return null
  })
  const [loading, setLoading] = useState<boolean>(true)

  // Verify and restore session on mount
  useEffect(() => {
    let isMounted = true
    async function initAuth() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            if (isMounted) {
              setUser(json.data)
              localStorage.setItem(SESSION_KEY, JSON.stringify(json.data))
            }
          } else {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(SESSION_KEY)
            if (isMounted) setUser(null)
          }
        } else {
          // Fallback to local session if backend server is temporarily unreachable
          const stored = localStorage.getItem(SESSION_KEY)
          if (stored && isMounted) {
            setUser(JSON.parse(stored))
          }
        }
      } catch (err) {
        console.warn('Auth check fallback to cached session:', err)
        const stored = localStorage.getItem(SESSION_KEY)
        if (stored && isMounted) {
          try {
            setUser(JSON.parse(stored))
          } catch {
            // Ignore
          }
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAuth()
    return () => {
      isMounted = false
    }
  }, [])

  const signIn = async (
    email: string,
    pass: string,
    role?: DemoUserRole,
  ): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.')
    }
    if (!pass || pass.length < 4) {
      throw new Error('Password must be at least 4 characters.')
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass, role })
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Invalid email or password.')
      }

      const userObj: UserProfile = json.data.user
      const token: string = json.data.token

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(SESSION_KEY, JSON.stringify(userObj))
      setUser(userObj)
      return userObj
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err
      }
      const targetRole: DemoUserRole =
        role ||
        (cleanEmail.startsWith('admin') || cleanEmail.startsWith('conductor')
          ? 'admin'
          : 'voter')

      const prefix = cleanEmail.split('@')[0]
      const derivedName = prefix
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())

      const userObj: UserProfile = {
        email: cleanEmail,
        name: derivedName || (targetRole === 'admin' ? 'Election Conductor' : 'Voter'),
        username: prefix,
        role: targetRole,
        isVerified: true
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(userObj))
      setUser(userObj)
      return userObj
    }
  }

  const createAccount = async (
    dataOrName: RegisterInput | string,
    email?: string,
    pass?: string,
    role: DemoUserRole = 'voter',
  ): Promise<UserProfile> => {
    let payload: RegisterInput
    if (typeof dataOrName === 'object') {
      payload = dataOrName
    } else {
      payload = {
        name: dataOrName,
        email: email || '',
        password: pass || '',
        role
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to create account.')
      }

      const userObj: UserProfile = json.data.user
      const token: string = json.data.token

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(SESSION_KEY, JSON.stringify(userObj))
      setUser(userObj)
      return userObj
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err
      }
      const cleanEmail = payload.email.trim().toLowerCase()
      const newUser: UserProfile = {
        email: cleanEmail,
        name: payload.name.trim() || (payload.role === 'admin' ? 'Election Conductor' : 'Voter'),
        username: payload.username || cleanEmail.split('@')[0],
        role: payload.role || 'voter',
        phone: payload.phone,
        dateOfBirth: payload.dateOfBirth,
        country: payload.country,
        state: payload.state,
        city: payload.city,
        isVerified: true
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))
      setUser(newUser)
      return newUser
    }
  }

  const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(data)
        })
        const json = await res.json()
        if (res.ok && json.success) {
          const updated = json.data
          setUser(updated)
          localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
          return updated
        } else if (json.message) {
          throw new Error(json.message)
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('fetch')) {
          throw err
        }
        console.warn('Profile update fallback:', err)
      }
    }

    const updatedUser = { ...(user || {}), ...data } as UserProfile
    setUser(updatedUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser))
    return updatedUser
  }

  const refreshUser = async (): Promise<UserProfile | null> => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return user
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          setUser(json.data)
          localStorage.setItem(SESSION_KEY, JSON.stringify(json.data))
          return json.data
        }
      }
    } catch {
      // Ignore
    }
    return user
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <DemoAuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        createAccount,
        updateProfile,
        refreshUser,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </DemoAuthContext.Provider>
  )
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext)
  if (!context) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider')
  }
  return context
}
