"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getUserByEmail } from "@/lib/allowed-users"

interface User {
  name: string
  email: string
  avatar?: string
  role?: 'admin' | 'user'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (userData: { name: string; email: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = "biteengine_auth"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedAuth) {
      try {
        const userData = JSON.parse(storedAuth)
        setUser(userData)
      } catch (error) {
        console.error("Failed to parse auth data:", error)
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
  }, [])

  const login = async (userData: { name: string; email: string }) => {
    const allowedUser = await getUserByEmail(userData.email)

    const user: User = {
      name: userData.name,
      email: userData.email,
      avatar: allowedUser?.avatar || "/professional-smiling-man-headshot.png", // 화이트리스트의 아바타 또는 기본 아바타
      role: allowedUser?.role || 'user',
    }

    setUser(user)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
