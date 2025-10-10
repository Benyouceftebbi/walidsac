"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { StopDeskProvider } from "@/contexts/stopdesk-context"
import ParcelForm from "@/components/parcel-form"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase-config"
import { onAuthStateChanged } from "firebase/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Listen for changes to the Firebase authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("[v0] Not authenticated, redirecting to login");
        router.push("/");
      } else {
        console.log("[v0] Authenticated, showing dashboard", user.email);
        setIsLoading(false);
      }
    });

    // Cleanup subscription when component unmounts
    return () => unsubscribe();
  }, [auth, router]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-indigo-600">Chargement... / جار التحميل...</div>
      </div>
    )
  }

  return (
    <StopDeskProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-indigo-900">Noest Parcels Dashboard</h1>
          </div>
          <ParcelForm />
        </div>
      </div>
    </StopDeskProvider>
  )
}
