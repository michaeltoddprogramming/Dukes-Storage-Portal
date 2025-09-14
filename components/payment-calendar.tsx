import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle, XCircle, Clock } from "lucide-react"

export async function PaymentCalendar() {
  const supabase = await createClient()

  // Get current date and calculate the three months to display
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const monthBeforeThat = new Date(now.getFullYear(), now.getMonth() - 2, 1)

  const months = [
    { date: monthBeforeThat, label: monthBeforeThat.toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
    { date: previousMonth, label: previousMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
    { date: currentMonth, label: currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
  ]

  // Get all active rentals with customer and unit info
  const { data: rentals } = await supabase
    .from("rentals")
    .select(`
      *,
      customers!inner(first_name, last_name),
      storage_units!inner(unit_number, monthly_rate)
    `)
    .eq("status", "active")
    .order("storage_units(unit_number)")

  if (!rentals || rentals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No active rentals found</p>
        </CardContent>
      </Card>
    )
  }

  // Get payments for the three months
  const startDate = new Date(monthBeforeThat.getFullYear(), monthBeforeThat.getMonth(), 1)
  const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      rentals!inner(id)
    `)
    .gte("payment_date", startDate.toISOString())
    .lte("payment_date", endDate.toISOString())
    .eq("payment_type", "rent")

  // Create payment lookup by rental_id and month
  const paymentLookup = new Map()
  payments?.forEach((payment) => {
    const paymentDate = new Date(payment.payment_date)
    const monthKey = `${payment.rental_id}-${paymentDate.getFullYear()}-${paymentDate.getMonth()}`
    paymentLookup.set(monthKey, payment)
  })

  const getPaymentStatus = (rentalId: string, monthDate: Date) => {
    const monthKey = `${rentalId}-${monthDate.getFullYear()}-${monthDate.getMonth()}`
    const payment = paymentLookup.get(monthKey)

    if (payment) {
      return { status: "paid", payment }
    }

    // Check if it's a future month
    const today = new Date()
    if (monthDate > today) {
      return { status: "future" }
    }

    // Check if it's overdue (past the 5th of the month)
    const dueDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 5)
    if (today > dueDate) {
      return { status: "overdue" }
    }

    return { status: "pending" }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "overdue":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-50 border-green-200"
      case "overdue":
        return "bg-red-50 border-red-200"
      case "pending":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Calendar</CardTitle>
        <p className="text-sm text-muted-foreground">Track monthly payments across the last 3 months</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Month Headers */}
          <div className="grid grid-cols-4 gap-4">
            <div className="font-medium text-sm text-muted-foreground">Customer / Unit</div>
            {months.map((month, index) => (
              <div key={index} className="text-center">
                <div className="font-medium text-sm">{month.label}</div>
              </div>
            ))}
          </div>

          {/* Customer Rows */}
          <div className="space-y-2">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className="grid grid-cols-4 gap-4 items-center py-3 px-4 rounded-lg border bg-card/30"
              >
                {/* Customer Info */}
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium text-sm">
                      {rental.customers.first_name} {rental.customers.last_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {rental.storage_units.unit_number}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(Number(rental.storage_units.monthly_rate))}/mo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Status for Each Month */}
                {months.map((month, index) => {
                  const { status, payment } = getPaymentStatus(rental.id, month.date)
                  return (
                    <div key={index} className="flex justify-center">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="text-xs font-medium">
                          {status === "paid"
                            ? "Paid"
                            : status === "overdue"
                              ? "Overdue"
                              : status === "pending"
                                ? "Pending"
                                : "Future"}
                        </span>
                        {payment && (
                          <span className="text-xs text-muted-foreground ml-1">
                            {new Date(payment.payment_date).getDate()}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-muted-foreground">Overdue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gray-300" />
              <span className="text-xs text-muted-foreground">Future</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
