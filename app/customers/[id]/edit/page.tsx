"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CustomerForm } from "@/components/customer-form"

interface EditCustomerPageProps {
  params: Promise<{ id: string }>
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
  const [id, setId] = useState<string>("")
  const [customer, setCustomer] = useState<any>(null)
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

        // Get the customer to edit
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("id", id)
          .single()

        if (customerError || !customerData) {
          setNotFound(true)
          setIsLoading(false)
          return
        }

        setCustomer(customerData)
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
          <h1 className="text-2xl font-bold mb-2">Customer Not Found</h1>
          <p className="text-muted-foreground">The customer you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Edit Customer</h1>
          <p className="text-muted-foreground">
            Update {customer?.first_name} {customer?.last_name}'s information
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <CustomerForm customer={customer} />
        </div>
      </div>
    </div>
  )
}
