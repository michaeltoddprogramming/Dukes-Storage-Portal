import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CustomersTable } from "@/components/customers-table"
import { CustomersHeader } from "@/components/customers-header"

export default async function CustomersPage() {
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
      <CustomersHeader />
      <div className="container mx-auto px-6 py-8">
        <CustomersTable />
      </div>
    </div>
  )
}
