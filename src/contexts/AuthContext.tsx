import React, { createContext, useContext, useEffect, useState } from 'react'
import { platformApi, setToken, decodeJwt } from '@/lib/api'

interface User { id: string; email: string; role: string }

interface AuthContextValue {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    platformApi.post('/api/auth/refresh')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setToken(data.accessToken)
          const payload = decodeJwt(data.accessToken)
          setUser({ id: payload.userId, email: payload.email, role: payload.role })
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const res = await platformApi.post('/api/auth/login', { email, password })
    if (!res.ok) throw new Error('Invalid credentials')
    const data = await res.json()
    setToken(data.accessToken)
    setUser(data.user)
  }

  async function logout() {
    await platformApi.post('/api/auth/logout').catch(() => {})
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
