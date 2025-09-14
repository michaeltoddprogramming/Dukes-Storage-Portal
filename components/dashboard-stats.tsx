"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, DollarSign, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface Stat {
  title: string
  value: string | number
  icon: any
  description: string
  trend: "high" | "medium" | "low"
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()

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

        const statsData: Stat[] = [
          {
            title: "Total Units",
            value: totalUnits || 0,
            icon: Building,
            description: `${occupancyRate}% occupied`,
            trend: (occupancyRate > 80 ? "high" : occupancyRate > 60 ? "medium" : "low") as "high" | "medium" | "low",
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
            trend: ((totalUnits || 0) - (occupiedUnits || 0) > 5 ? "high" : "low") as "high" | "low",
          },
        ]

        setStats(statsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard stats")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-sm text-muted-foreground">Failed to load stats</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
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
