"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { UnitsGrid } from "@/components/units-grid"
import { UnitsHeader } from "@/components/units-header"

export default function UnitsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
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
        const { data: adminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

        if (!adminUser) {
          router.push("/auth/login")
          return
        }

        setIsLoading(false)
      } catch (err) {
        router.push("/auth/login")
      }
    }

    checkAuth()
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
      <UnitsHeader />
      <div className="container mx-auto px-6 py-8">
        <UnitsGrid />
      </div>
    </div>
  )
}
