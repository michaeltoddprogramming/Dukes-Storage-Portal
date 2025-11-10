"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PaymentsHeader } from "@/components/payments-header"
import { CalendarPaymentTracker } from "@/components/calendar-payment-tracker"
import { Loader2 } from "lucide-react"

interface Rental {
  id: string
  start_date: string
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

      console.log("[v0] Rentals data:", rentalsData)
      console.log("[v0] Rentals error:", rentalsError)

      // Sort rentals by unit number on the client side
      const sortedRentals = rentalsData?.sort((a, b) => {
        const unitA = a.storage_units.unit_number
        const unitB = b.storage_units.unit_number
        
        // Extract numbers from unit strings (e.g., "DUKE 1" -> 1, "DUKE 20" -> 20)
        const extractNumber = (unit: string) => {
          const match = unit.match(/\d+/)
          return match ? parseInt(match[0]) : 0
        }
        
        const numA = extractNumber(unitA)
        const numB = extractNumber(unitB)
        
        // Sort numerically if both have numbers
        if (numA !== numB) {
          return numA - numB
        }
        
        // Fall back to string comparison if numbers are equal
        return unitA.localeCompare(unitB)
      }) || []

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

      setRentals(sortedRentals)
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
