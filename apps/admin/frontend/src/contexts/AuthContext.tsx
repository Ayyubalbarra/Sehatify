"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authAPI } from "../services/api.ts"
import type { User, LoginCredentials } from "../types"
import toast from "react-hot-toast"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  demoLogin: () => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem("token")
        const savedUser = localStorage.getItem("user")

        console.log("Initializing auth state:", {
          hasToken: !!savedToken,
          hasUser: !!savedUser,
        })

        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser)
          setToken(savedToken)
          setUser(parsedUser)

          // Verify token is still valid
          try {
            const response = await authAPI.verifyToken()
            if (response.success && response.data?.user) {
              setUser(response.data.user)
              localStorage.setItem("user", JSON.stringify(response.data.user))
            }
          } catch (error) {
            console.error("Token verification failed:", error)
            // Clear invalid token
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            setToken(null)
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Error initializing auth state:", error)
        // Clear corrupted data
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      console.log("AuthContext login called with:", { email: credentials.email })

      const response = await authAPI.login(credentials)

      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data

        // Set state
        setUser(userData)
        setToken(userToken)

        // Save to localStorage
        localStorage.setItem("token", userToken)
        localStorage.setItem("user", JSON.stringify(userData))

        console.log("Login successful:", { user: userData.name, role: userData.role })
        toast.success(`Welcome back, ${userData.name}!`)
      } else {
        throw new Error(response.message || "Login failed")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      const message = error.response?.data?.message || error.message || "Login failed"
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const demoLogin = async () => {
    try {
      setIsLoading(true)
      console.log("Demo login initiated")

      const response = await authAPI.demoLogin()

      if (response.success && response.data) {
        const { user: userData, token: userToken } = response.data

        // Set state
        setUser(userData)
        setToken(userToken)

        // Save to localStorage
        localStorage.setItem("token", userToken)
        localStorage.setItem("user", JSON.stringify(userData))

        console.log("Demo login successful:", { user: userData.name, role: userData.role })
        toast.success(`Demo login successful! Welcome, ${userData.name}`)
      } else {
        throw new Error(response.message || "Demo login failed")
      }
    } catch (error: any) {
      console.error("Demo login error:", error)
      const message = error.response?.data?.message || error.message || "Demo login failed"
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log("Logging out user")

    // Clear state
    setUser(null)
    setToken(null)

    // Clear localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    toast.success("Logged out successfully")

    // Redirect to login
    window.location.href = "/login"
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true)

      const response = await authAPI.updateProfile(userData)

      if (response.success && response.data?.user) {
        const updatedUser = response.data.user
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))

        console.log("User updated successfully:", updatedUser)
        toast.success("Profile updated successfully")
      } else {
        throw new Error(response.message || "Failed to update profile")
      }
    } catch (error: any) {
      console.error("Error updating user:", error)
      const message = error.response?.data?.message || error.message || "Failed to update profile"
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      if (!token) return

      const response = await authAPI.getProfile()
      if (response.success && response.data?.user) {
        setUser(response.data.user)
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }

  const isAuthenticated = !!user && !!token

  // Debug logging
  useEffect(() => {
    console.log("Auth state changed:", {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      isLoading,
      userRole: user?.role,
    })
  }, [user, token, isAuthenticated, isLoading])

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    demoLogin,
    logout,
    updateUser,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}