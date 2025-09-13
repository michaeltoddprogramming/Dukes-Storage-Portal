import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentActivity } from "@/components/recent-activity"
import { UnitOccupancyChart } from "@/components/unit-occupancy-chart"
import { Navigation } from "@/components/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check if user is authenticated admin
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
      <Navigation userEmail={user.email} userName={adminUser.full_name} />

      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {adminUser.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8">
          {/* Dashboard Stats */}
          <DashboardStats />

          {/* Charts and Activity */}
          <div className="grid gap-8 lg:grid-cols-2">
            <UnitOccupancyChart />
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  )
}
