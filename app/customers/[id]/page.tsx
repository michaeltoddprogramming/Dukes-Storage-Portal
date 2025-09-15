import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CustomerDetails } from "@/components/customer-details"

export default async function CustomerPage({ params }) {
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

  return <CustomerDetails customerId={params.id} />
}