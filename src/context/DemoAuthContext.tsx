import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

/**
 * FRONTEND-ONLY DEMO AUTHENTICATION CONTEXT
 * Note: This module is strictly for website presentation/demonstration purposes.
 * It does NOT call backend APIs, Supabase, or PostgreSQL, and does NOT process real credentials.
 */

export type DemoUserRole = 'admin' | 'voter'

export interface DemoUser {
  email: string
  name: string
  role: DemoUserRole
}

interface DemoAuthContextType {
  user: DemoUser | null
  signIn: (email: string, pass: string) => Promise<DemoUser>
  createAccount: (name: string, email: string, pass: string) => Promise<DemoUser>
  logout: () => void
  isAuthenticated: boolean
}

const STORAGE_KEY = 'blockvote_demo_session'

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

  const signIn = async (email: string, pass: string): Promise<DemoUser> => {
    const cleanEmail = email.trim().toLowerCase()

    // Frontend-only demo credential checks
    if (cleanEmail === 'admin@blockvote.demo' && pass === 'Admin@123') {
      const adminUser: DemoUser = {
        email: 'admin@blockvote.demo',
        name: 'Demo Admin',
        role: 'admin',
      }
      setUser(adminUser)
      return adminUser
    }

    if (cleanEmail === 'voter@blockvote.demo' && pass === 'Voter@123') {
      const voterUser: DemoUser = {
        email: 'voter@blockvote.demo',
        name: 'Demo Voter',
        role: 'voter',
      }
      setUser(voterUser)
      return voterUser
    }

    throw new Error('Invalid email or password.')
  }

  const createAccount = async (
    name: string,
    email: string,
    _pass: string,
  ): Promise<DemoUser> => {
    const newUser: DemoUser = {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: 'voter',
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
