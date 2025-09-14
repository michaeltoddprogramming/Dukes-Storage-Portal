import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PaymentsHeader } from "@/components/payments-header"
import { PaymentsSummary } from "@/components/payments-summary"
import { PaymentCalendar } from "@/components/payment-calendar"

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

  return (
    <div className="min-h-screen bg-background">
      <PaymentsHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <PaymentsSummary />
          <PaymentCalendar />
        </div>
      </div>
    </div>
  )
}
