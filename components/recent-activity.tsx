import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { formatCurrency } from "@/lib/utils"

export async function RecentActivity() {
  const supabase = await createClient()

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

  const activities = [
    ...(recentPayments?.map((payment) => ({
      type: "payment" as const,
      description: `Payment received from ${payment.rentals.customers.first_name} ${payment.rentals.customers.last_name}`,
      amount: payment.amount,
      unit: payment.rentals.storage_units.unit_number,
      date: payment.created_at,
      paymentType: payment.payment_type,
    })) || []),
    ...(recentRentals?.map((rental) => ({
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
