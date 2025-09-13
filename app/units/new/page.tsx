import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UnitForm } from "@/components/unit-form"

export default async function NewUnitPage() {
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

  // Get facilities for the form
  const { data: facilities } = await supabase.from("facilities").select("id, name").order("name")

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Add New Storage Unit</h1>
          <p className="text-muted-foreground">Create a new storage unit in your facility</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <UnitForm facilities={facilities || []} />
        </div>
      </div>
    </div>
  )
}
