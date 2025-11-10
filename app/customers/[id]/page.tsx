"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CustomerDetails } from "@/components/customer-details"

interface CustomerPageProps {
  params: Promise<{ id: string }>
}

export default function CustomerPage({ params }: CustomerPageProps) {
  const [customerId, setCustomerId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      setCustomerId(resolvedParams.id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!customerId) return

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
        const { data: adminUser } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", user.id)
          .single()

        if (!adminUser) {
          router.push("/auth/login")
          return
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error checking auth:", err)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [customerId, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return <CustomerDetails customerId={customerId} />
}