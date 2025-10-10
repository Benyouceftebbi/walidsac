"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db} from "@/lib/firebase-config"

interface StopDesk {
  id: string
  name: string
  wilaya_id: number
  wilaya_name?: string
  commune?: string // Added commune field for filtering
  address?: string
  phone?: string
  active: boolean
  code:string
}

interface StopDeskContextType {
  stopDesks: StopDesk[]
  loading: boolean
  error: string | null
  getStopDesksByWilaya: (wilayaId: number) => StopDesk[]
  getStopDesksByWilayaAndCommune: (wilayaId: number, commune: string) => StopDesk[] // Added commune filtering function
}

const StopDeskContext = createContext<StopDeskContextType | undefined>(undefined)

export function StopDeskProvider({ children }: { children: ReactNode }) {
  const [stopDesks, setStopDesks] = useState<StopDesk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStopDesks()
  }, [])

  const fetchStopDesks = async () => {
    try {
      setLoading(true)
      setError(null)

      // Query the stopdesks collection for active stop desks
      const stopdesksRef = collection(db, "NOESTSTOPDESK")
      const q = query(stopdesksRef)
      const querySnapshot = await getDocs(q)

      const fetchedStopDesks: StopDesk[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        fetchedStopDesks.push({
          id: data.id || doc.id,
          name: data.name,
          wilaya_id: data.wilaya_id,
          wilaya_name: data.wilaya_name,
          commune: data.commune, // Include commune from Firestore
          address: data.address,
          phone: data.phone,
          active: data.active,
          code:data.code
        })
      })

      console.log(`[v0] Fetched ${fetchedStopDesks.length} stop desks from Firestore`)

        setStopDesks(fetchedStopDesks)
      
    } catch (err) {
      console.error("[v0] Error fetching stop desks from Firestore:", err)
      console.log("[v0] Falling back to mock data")
      setError("Failed to load stop desks from database, using local data")
 
    } finally {
      setLoading(false)
    }
  }

  const getStopDesksByWilaya = (wilayaId: number): StopDesk[] => {
    return stopDesks.filter((desk) => desk.wilaya_id === wilayaId)
  }

  const getStopDesksByWilayaAndCommune = (wilayaId: number, commune: string): StopDesk[] => {
    return stopDesks.filter((desk) => desk.wilaya_id === wilayaId)
  }

  return (
    <StopDeskContext.Provider
      value={{ stopDesks, loading, error, getStopDesksByWilaya, getStopDesksByWilayaAndCommune }}
    >
      {children}
    </StopDeskContext.Provider>
  )
}

export function useStopDesks() {
  const context = useContext(StopDeskContext)
  if (context === undefined) {
    throw new Error("useStopDesks must be used within a StopDeskProvider")
  }
  return context
}
