"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PaymentsHeader } from "@/components/payments-header"
import { CalendarPaymentTracker } from "@/components/calendar-payment-tracker"
import { Loader2 } from "lucide-react"

interface Rental {
  id: string
  customers: {
    first_name: string
    last_name: string
  }
  storage_units: {
    unit_number: string
    monthly_rate: number
  }
}

interface Payment {
  id: string
  rental_id: string
  payment_date: string
  amount: number
}

export default function PaymentsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      console.log("[v0] Fetching rentals data...")

      // Get all active rentals with customer and unit info
      const { data: rentalsData, error: rentalsError } = await supabase
        .from("rentals")
        .select(`
          *,
          customers!inner(first_name, last_name),
          storage_units!inner(unit_number, monthly_rate)
        `)
        .eq("status", "active")
        .order("storage_units(unit_number)")

      console.log("[v0] Rentals data:", rentalsData)
      console.log("[v0] Rentals error:", rentalsError)

      // Get all payments for the last 3 months
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

      console.log("[v0] Fetching payments data...")

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          *,
          rentals!inner(id)
        `)
        .gte("payment_date", threeMonthsAgo.toISOString())
        .eq("payment_type", "rent")

      console.log("[v0] Payments data:", paymentsData)
      console.log("[v0] Payments error:", paymentsError)

      setRentals(rentalsData || [])
      setPayments(paymentsData || [])
      setIsLoading(false)
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <PaymentsHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading payment data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <PaymentsHeader />
      <div className="container mx-auto px-6 py-8">
        <CalendarPaymentTracker rentals={rentals} payments={payments} />
      </div>
    </div>
  )
}
