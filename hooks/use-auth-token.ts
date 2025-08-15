"use client"

import { useAuth } from "@/components/providers"
import { useEffect, useState } from "react"

export function useAuthToken() {
  const { user } = useAuth()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const getToken = async () => {
      if (user) {
        try {
          const idToken = await user.getIdToken()
          setToken(idToken)
        } catch (error) {
          console.error("Failed to get ID token:", error)
          setToken(null)
        }
      } else {
        setToken(null)
      }
    }

    getToken()
  }, [user])

  return token
}
