"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  where,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { COLLECTIONS } from "@/lib/firestore/collections"

interface UseRealtimeFirestoreOptions {
  constraints?: QueryConstraint[]
  limitCount?: number
  enabled?: boolean
}

export function useRealtimeFirestore<T extends DocumentData>(
  collectionName: string,
  options: UseRealtimeFirestoreOptions = {},
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { constraints = [], limitCount, enabled = true } = options

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    let unsubscribe: Unsubscribe

    try {
      const queryConstraints = [...constraints]
      if (limitCount) {
        queryConstraints.push(limit(limitCount))
      }

      const q = query(collection(db, collectionName), ...queryConstraints)

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const documents = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[]

          setData(documents)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.error(`Firestore subscription error for ${collectionName}:`, err)
          setError(err.message)
          setLoading(false)
        },
      )
    } catch (err) {
      console.error(`Failed to set up Firestore subscription for ${collectionName}:`, err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [collectionName, enabled, limitCount, JSON.stringify(constraints)])

  return { data, loading, error }
}

// Specialized hooks for common use cases
export function useRealtimeLeaderboard(type: "college" | "national" = "national", collegeId?: string) {
  const constraints: QueryConstraint[] = [
    where("codeforcesHandle", "!=", null),
    orderBy("codeforcesHandle"),
    orderBy("rating", "desc"),
  ]

  if (type === "college" && collegeId) {
    constraints.unshift(where("collegeId", "==", collegeId))
  }

  return useRealtimeFirestore(COLLECTIONS.USERS, {
    constraints,
    limitCount: 50,
  })
}

export function useRealtimeActivities(userId?: string) {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")]

  if (userId) {
    constraints.unshift(where("userId", "==", userId))
  }

  return useRealtimeFirestore(COLLECTIONS.ACTIVITIES, {
    constraints,
    limitCount: 20,
  })
}

export function useRealtimeContestStandings(contestId: string) {
  const constraints: QueryConstraint[] = [where("contestId", "==", contestId), orderBy("submittedAt", "desc")]

  return useRealtimeFirestore(COLLECTIONS.SUBMISSIONS, {
    constraints,
    limitCount: 100,
  })
}
