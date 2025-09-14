"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface Activity {
  type: "payment" | "rental"
  description: string
  amount: number
  unit: string
  date: string
  paymentType?: string
  status?: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const supabase = createClient()

        // Get recent payments
        const { data: recentPayments } = await supabase
          .from("payments")
          .select(`
            *,
            rentals!inner(
              customers!inner(first_name, last_name),
              storage_units!inner(unit_number)
            )
          `)
          .order("created_at", { ascending: false })
          .limit(10)

        // Get recent rentals
        const { data: recentRentals } = await supabase
          .from("rentals")
          .select(`
            *,
            customers!inner(first_name, last_name),
            storage_units!inner(unit_number)
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        const activitiesData = [
          ...(recentPayments?.map((payment: any) => ({
            type: "payment" as const,
            description: `Payment received from ${payment.rentals.customers.first_name} ${payment.rentals.customers.last_name}`,
            amount: payment.amount,
            unit: payment.rentals.storage_units.unit_number,
            date: payment.created_at,
            paymentType: payment.payment_type,
          })) || []),
          ...(recentRentals?.map((rental: any) => ({
            type: "rental" as const,
            description: `New rental for ${rental.customers.first_name} ${rental.customers.last_name}`,
            amount: rental.monthly_rate,
            unit: rental.storage_units.unit_number,
            date: rental.created_at,
            status: rental.status,
          })) || []),
        ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 8)

        setActivities(activitiesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recent activity")
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest payments and rentals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-14" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest payments and rentals</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Failed to load recent activity</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest payments and rentals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Unit {activity.unit}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(Number(activity.amount))}</p>
                  <Badge variant={activity.type === "payment" ? "default" : "secondary"} className="text-xs">
                    {activity.type === "payment" ? activity.paymentType : activity.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
