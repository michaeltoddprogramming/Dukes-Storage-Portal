import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PaymentsHeader } from "@/components/payments-header"
import { CalendarPaymentTracker } from "@/components/calendar-payment-tracker"

export default async function PaymentsPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is an admin
  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

  if (!adminUser) {
    redirect("/auth/login")
  }

  // Get all active rentals with customer and unit info
  const { data: rentals } = await supabase
    .from("rentals")
    .select(`
      *,
      customers!inner(first_name, last_name),
      storage_units!inner(unit_number, monthly_rate)
    `)
    .eq("status", "active")
    .order("storage_units(unit_number)")

  // Get all payments for the last 3 months
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      rentals!inner(id)
    `)
    .gte("payment_date", threeMonthsAgo.toISOString())
    .eq("payment_type", "rent")

  return (
    <div className="min-h-screen bg-background">
      <PaymentsHeader />
      <div className="container mx-auto px-6 py-8">
        <CalendarPaymentTracker rentals={rentals || []} payments={payments || []} />
      </div>
    </div>
  )
}
