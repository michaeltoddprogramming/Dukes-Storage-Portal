import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PaymentForm } from "@/components/payment-form"

export default async function NewPaymentPage() {
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

  // Get active rentals for the form
  const { data: rentals } = await supabase
    .from("rentals")
    .select(`
      id,
      monthly_rate,
      customers!inner(first_name, last_name),
      storage_units!inner(unit_number)
    `)
    .eq("status", "active")
    .order("customers(last_name)")

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Record New Payment</h1>
          <p className="text-muted-foreground">Add a payment to the system</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <PaymentForm rentals={rentals || []} />
        </div>
      </div>
    </div>
  )
}
