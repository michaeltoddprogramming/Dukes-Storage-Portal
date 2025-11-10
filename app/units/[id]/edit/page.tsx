"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { UnitForm } from "@/components/unit-form"

interface EditUnitPageProps {
  params: Promise<{ id: string }>
}

export default function EditUnitPage({ params }: EditUnitPageProps) {
  const [id, setId] = useState<string>("")
  const [unit, setUnit] = useState<any>(null)
  const [facilities, setFacilities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!id) return

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

        // Get the unit to edit
        const { data: unitData, error: unitError } = await supabase
          .from("storage_units")
          .select("*")
          .eq("id", id)
          .single()

        if (unitError || !unitData) {
          setNotFound(true)
          setIsLoading(false)
          return
        }

        // Get facilities for the form
        const { data: facilitiesData } = await supabase
          .from("facilities")
          .select("id, name")
          .order("name")

        setUnit(unitData)
        setFacilities(facilitiesData || [])
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading data:", err)
        router.push("/auth/login")
      }
    }

    checkAuthAndLoadData()
  }, [id, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Unit Not Found</h1>
          <p className="text-muted-foreground">The unit you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Edit Storage Unit</h1>
          <p className="text-muted-foreground">Update unit {unit?.unit_number} details</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <UnitForm facilities={facilities} unit={unit} />
        </div>
      </div>
    </div>
  )
}
