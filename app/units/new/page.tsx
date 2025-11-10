"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { UnitForm } from "@/components/unit-form"

export default function NewUnitPage() {
  const [facilities, setFacilities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const supabase = createClient()

        // Check authentication
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error || !user) {
          router.push("/auth/login")
          return
        }

        // Check if user is an admin
        const { data: adminUser } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", user.id)
          .single()

        if (!adminUser) {
          router.push("/auth/login")
          return
        }

        // Get facilities for the form
        const { data: facilitiesData } = await supabase
          .from("facilities")
          .select("id, name")
          .order("name")

        setFacilities(facilitiesData || [])
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading data:", err)
        router.push("/auth/login")
      }
    }

    checkAuthAndLoadData()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Add New Storage Unit</h1>
          <p className="text-muted-foreground">Create a new storage unit in your facility</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <UnitForm facilities={facilities} />
        </div>
      </div>
    </div>
  )
}
