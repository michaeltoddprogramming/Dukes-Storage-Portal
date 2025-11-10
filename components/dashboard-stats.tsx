"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Clock, CheckCircle, Percent } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface Stat {
  title: string
  value: string | number
  icon: any
  description: string
  trend: "high" | "medium" | "low"
  changePercent?: number
  changeLabel?: string
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()

        // Get current month dates
        const now = new Date()
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
        const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10)
        
        // Get last month dates for comparison
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10)
        const lastMonthEnd = currentMonthStart

        // Get total units
        const { count: totalUnits } = await supabase.from("storage_units").select("*", { count: "exact", head: true })

        // Get occupied units
        const { count: occupiedUnits } = await supabase
          .from("storage_units")
          .select("*", { count: "exact", head: true })
          .eq("status", "occupied")

        // Get total customers
        const { count: totalCustomers } = await supabase.from("customers").select("*", { count: "exact", head: true })

        // Get expected monthly revenue from occupied units
        const { data: occupiedUnitsData } = await supabase
          .from("storage_units")
          .select("monthly_rate")
          .eq("status", "occupied")

        const expectedMonthlyRevenue = occupiedUnitsData?.reduce((sum, unit) => sum + Number(unit.monthly_rate), 0) || 0

        // Get actual collected revenue this month
        const { data: currentMonthPayments } = await supabase
          .from("payments")
          .select("amount")
          .gte("payment_date", currentMonthStart)
          .lt("payment_date", nextMonthStart)

        const collectedThisMonth = currentMonthPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

        // Get last month's revenue for comparison
        const { data: lastMonthPayments } = await supabase
          .from("payments")
          .select("amount")
          .gte("payment_date", lastMonthStart)
          .lt("payment_date", lastMonthEnd)

        const collectedLastMonth = lastMonthPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

        // Calculate collection rate
        const collectionRate = expectedMonthlyRevenue > 0 
          ? Math.round((collectedThisMonth / expectedMonthlyRevenue) * 100) 
          : 0

        // Calculate revenue change
        const revenueChange = collectedLastMonth > 0
          ? Math.round(((collectedThisMonth - collectedLastMonth) / collectedLastMonth) * 100)
          : 0

        // Calculate occupancy rate
        const occupancyRate = totalUnits ? Math.round(((occupiedUnits || 0) / totalUnits) * 100) : 0

        // Get active rentals (rentals with active status)
        const { count: activeRentals } = await supabase
          .from("rentals")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")

        // Get overdue payments (payments expected but not received)
        const { data: allRentals } = await supabase
          .from("rentals")
          .select("next_payment_date")
          .eq("status", "active")

        const overdueCount = allRentals?.filter(rental => {
          const nextPaymentDate = new Date(rental.next_payment_date)
          return nextPaymentDate < now
        }).length || 0

        const statsData: Stat[] = [
          {
            title: "Occupancy Rate",
            value: `${occupancyRate}%`,
            icon: Building,
            description: `${occupiedUnits || 0} of ${totalUnits || 0} units occupied`,
            trend: (occupancyRate > 80 ? "high" : occupancyRate > 60 ? "medium" : "low") as "high" | "medium" | "low",
          },
          {
            title: "Expected Revenue",
            value: formatCurrency(expectedMonthlyRevenue),
            icon: DollarSign,
            description: `${formatCurrency(collectedThisMonth)} collected this month`,
            trend: collectionRate > 80 ? "high" : collectionRate > 50 ? "medium" : "low",
          },
          {
            title: "Collection Rate",
            value: `${collectionRate}%`,
            icon: CheckCircle,
            description: "Payment collection this month",
            trend: collectionRate > 80 ? "high" : collectionRate > 50 ? "medium" : "low",
            changePercent: revenueChange,
            changeLabel: revenueChange >= 0 ? "vs last month" : "vs last month",
          },
          {
            title: "Active Rentals",
            value: activeRentals || 0,
            icon: Users,
            description: overdueCount > 0 ? `${overdueCount} overdue payments` : "All payments current",
            trend: overdueCount === 0 ? "high" : overdueCount < 3 ? "medium" : "low",
          },
          {
            title: "Available Units",
            value: (totalUnits || 0) - (occupiedUnits || 0),
            icon: AlertTriangle,
            description: "Ready to rent out",
            trend: ((totalUnits || 0) - (occupiedUnits || 0) > 5 ? "medium" : "low") as "high" | "low",
          },
          {
            title: "Avg Unit Rate",
            value: occupiedUnits && occupiedUnits > 0 
              ? formatCurrency(expectedMonthlyRevenue / occupiedUnits) 
              : formatCurrency(0),
            icon: Percent,
            description: "Average monthly rate per unit",
            trend: "medium",
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
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
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
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
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
    <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const showChange = stat.changePercent !== undefined && stat.changePercent !== 0
        const isPositiveChange = stat.changePercent && stat.changePercent > 0
        
        // Color themes for each trend
        const trendColors = {
          high: "from-green-500/10 to-emerald-500/5 border-green-200/50",
          medium: "from-yellow-500/10 to-amber-500/5 border-yellow-200/50",
          low: "from-red-500/10 to-rose-500/5 border-red-200/50"
        }
        
        const iconColors = {
          high: "bg-green-500/10 text-green-600 border-green-200/30",
          medium: "bg-yellow-500/10 text-yellow-600 border-yellow-200/30",
          low: "bg-red-500/10 text-red-600 border-red-200/30"
        }
        
        return (
          <Card 
            key={index} 
            className={`relative overflow-hidden bg-gradient-to-br ${trendColors[stat.trend]} border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 sm:px-6 pt-5 sm:pt-6">
              <CardTitle className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl border ${iconColors[stat.trend]} group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="px-5 sm:px-6 pb-5 sm:pb-6">
              <div className="space-y-3">
                <div className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stat.description}
                </p>
                {showChange && (
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`p-1 rounded ${isPositiveChange ? 'bg-green-100' : 'bg-red-100'}`}>
                      {isPositiveChange ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span>
                      {isPositiveChange ? '+' : ''}{stat.changePercent}%
                    </span>
                    {stat.changeLabel && (
                      <span className="text-xs text-muted-foreground font-normal ml-1">
                        {stat.changeLabel}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {/* Decorative gradient bar - following Gestalt principles */}
              <div
                className={`absolute bottom-0 left-0 h-1.5 w-full transition-all duration-500 ${
                  stat.trend === "high" 
                    ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                    : stat.trend === "medium" 
                    ? "bg-gradient-to-r from-yellow-500 to-amber-400" 
                    : "bg-gradient-to-r from-red-500 to-rose-400"
                } group-hover:h-2`}
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
