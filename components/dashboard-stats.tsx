import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, DollarSign, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export async function DashboardStats() {
  const supabase = await createClient()

  // Get total units
  const { count: totalUnits } = await supabase.from("storage_units").select("*", { count: "exact", head: true })

  // Get occupied units
  const { count: occupiedUnits } = await supabase
    .from("storage_units")
    .select("*", { count: "exact", head: true })
    .eq("status", "occupied")

  // Get total customers
  const { count: totalCustomers } = await supabase.from("customers").select("*", { count: "exact", head: true })

  // Get this month's revenue
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
  const { data: monthlyPayments } = await supabase
    .from("payments")
    .select("amount")
    .gte("payment_date", `${currentMonth}-01`)
    .lt("payment_date", `${currentMonth}-32`)

  const monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

  // Calculate occupancy rate
  const occupancyRate = totalUnits ? Math.round(((occupiedUnits || 0) / totalUnits) * 100) : 0

  const stats = [
    {
      title: "Total Units",
      value: totalUnits || 0,
      icon: Building,
      description: `${occupancyRate}% occupied`,
      trend: occupancyRate > 80 ? "high" : occupancyRate > 60 ? "medium" : "low",
    },
    {
      title: "Active Customers",
      value: totalCustomers || 0,
      icon: Users,
      description: "Total registered",
      trend: "medium",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(monthlyRevenue),
      icon: DollarSign,
      description: "Current month",
      trend: "high",
    },
    {
      title: "Available Units",
      value: (totalUnits || 0) - (occupiedUnits || 0),
      icon: AlertTriangle,
      description: "Ready to rent",
      trend: (totalUnits || 0) - (occupiedUnits || 0) > 5 ? "high" : "low",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <div
                className={`absolute bottom-0 left-0 h-1 w-full ${
                  stat.trend === "high" ? "bg-green-500" : stat.trend === "medium" ? "bg-yellow-500" : "bg-red-500"
                }`}
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
