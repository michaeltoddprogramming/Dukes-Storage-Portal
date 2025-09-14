import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PaymentsHeader } from "@/components/payments-header"
import { PaymentsSummary } from "@/components/payments-summary"
import { InteractivePaymentCalendar } from "@/components/interactive-payment-calendar"

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

  // Get current date and calculate the three months to display
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const monthBeforeThat = new Date(now.getFullYear(), now.getMonth() - 2, 1)

  const months = [
    { date: monthBeforeThat, label: monthBeforeThat.toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
    { date: previousMonth, label: previousMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
    { date: currentMonth, label: currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
  ]

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

  // Get payments for the three months
  const startDate = new Date(monthBeforeThat.getFullYear(), monthBeforeThat.getMonth(), 1)
  const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      rentals!inner(id)
    `)
    .gte("payment_date", startDate.toISOString())
    .lte("payment_date", endDate.toISOString())
    .eq("payment_type", "rent")

  return (
    <div className="min-h-screen bg-background">
      <PaymentsHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <PaymentsSummary />
          <InteractivePaymentCalendar rentals={rentals || []} payments={payments || []} months={months} />
        </div>
      </div>
    </div>
  )
}
