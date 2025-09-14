import { createClient } from "@/lib/supabase/server"
import { PaymentsHeader } from "@/components/payments-header"
import { CalendarPaymentTracker } from "@/components/calendar-payment-tracker"

export default async function PaymentsPage() {
  const supabase = await createClient()

  console.log("[v0] Fetching rentals data...")

  // Get all active rentals with customer and unit info
  const { data: rentals, error: rentalsError } = await supabase
    .from("rentals")
    .select(`
      *,
      customers!inner(first_name, last_name),
      storage_units!inner(unit_number, monthly_rate)
    `)
    .eq("status", "active")
    .order("storage_units(unit_number)")

  console.log("[v0] Rentals data:", rentals)
  console.log("[v0] Rentals error:", rentalsError)

  // Get all payments for the last 3 months
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  console.log("[v0] Fetching payments data...")

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select(`
      *,
      rentals!inner(id)
    `)
    .gte("payment_date", threeMonthsAgo.toISOString())
    .eq("payment_type", "rent")

  console.log("[v0] Payments data:", payments)
  console.log("[v0] Payments error:", paymentsError)

  return (
    <div className="min-h-screen bg-background">
      <PaymentsHeader />
      <div className="container mx-auto px-6 py-8">
        <CalendarPaymentTracker rentals={rentals || []} payments={payments || []} />
      </div>
    </div>
  )
}
