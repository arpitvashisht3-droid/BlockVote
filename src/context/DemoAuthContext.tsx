import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

/**
 * AUTHENTICATION CONTEXT
 * Provides session management, role selection, and user state.
 */

export type DemoUserRole = 'admin' | 'voter'

export interface DemoUser {
  email: string
  name: string
  role: DemoUserRole
}

interface DemoAuthContextType {
  user: DemoUser | null
  signIn: (email: string, pass: string, role?: DemoUserRole) => Promise<DemoUser>
  createAccount: (
    name: string,
    email: string,
    pass: string,
    role?: DemoUserRole,
  ) => Promise<DemoUser>
  logout: () => void
  isAuthenticated: boolean
}

const STORAGE_KEY = 'blockvote_session'

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined)

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Ignore JSON parse error
    }
    return null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const signIn = async (
    email: string,
    pass: string,
    role?: DemoUserRole,
  ): Promise<DemoUser> => {
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.')
    }
    if (!pass || pass.length < 4) {
      throw new Error('Password must be at least 4 characters.')
    }

    // Role: explicit selection first, fallback to checking email prefix, else 'voter'
    const targetRole: DemoUserRole =
      role ||
      (cleanEmail.startsWith('admin') || cleanEmail.startsWith('conductor')
        ? 'admin'
        : 'voter')

    const prefix = cleanEmail.split('@')[0]
    const derivedName = prefix
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

    const displayName =
      derivedName || (targetRole === 'admin' ? 'Election Conductor' : 'Voter')

    const userObj: DemoUser = {
      email: cleanEmail,
      name: displayName,
      role: targetRole,
    }

    setUser(userObj)
    return userObj
  }

  const createAccount = async (
    name: string,
    email: string,
    _pass: string,
    role: DemoUserRole = 'voter',
  ): Promise<DemoUser> => {
    const cleanEmail = email.trim().toLowerCase()
    const newUser: DemoUser = {
      email: cleanEmail,
      name: name.trim() || (role === 'admin' ? 'Election Conductor' : 'Voter'),
      role,
    }
    setUser(newUser)
    return newUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <DemoAuthContext.Provider
      value={{
        user,
        signIn,
        createAccount,
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
