"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { markPaymentPaid, markPaymentMissed } from "@/app/actions/payment-actions"

interface Rental {
  id: string
  customers: {
    first_name: string
    last_name: string
  }
  storage_units: {
    unit_number: string
    monthly_rate: number
  }
}

interface Payment {
  id: string
  rental_id: string
  payment_date: string
  amount: number
  status: string
}

interface CalendarPaymentTrackerProps {
  rentals: Rental[]
  payments: Payment[]
}

export function CalendarPaymentTracker({ rentals, payments }: CalendarPaymentTrackerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [processingPayments, setProcessingPayments] = useState<Set<string>>(new Set())

  // Get current month and previous 2 months
  const getMonthsToShow = () => {
    const months = []
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      months.push(date)
    }
    return months
  }

  const months = getMonthsToShow()

  // Get payment status for a rental in a specific month
  const getPaymentStatus = (rentalId: string, month: Date) => {
    const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`
    const payment = payments.find((p) => p.rental_id === rentalId && p.payment_date.startsWith(monthKey))

    if (payment) {
      return payment.status === "completed" ? "paid" : payment.status === "missed" ? "missed" : "pending"
    }

    // If no payment record and month is past, it's missed
    const now = new Date()
    if (month < new Date(now.getFullYear(), now.getMonth(), 1)) {
      return "missed"
    }

    return "pending"
  }

  const handleMarkPayment = async (rentalId: string, month: Date, status: "paid" | "missed") => {
    const key = `${rentalId}-${month.getTime()}`
    setProcessingPayments((prev) => new Set(prev).add(key))

    try {
      const rental = rentals.find((r) => r.id === rentalId)
      if (!rental) return

      if (status === "paid") {
        await markPaymentPaid(rentalId, month, rental.storage_units.monthly_rate)
      } else {
        await markPaymentMissed(rentalId, month)
      }

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error updating payment:", error)
    } finally {
      setProcessingPayments((prev) => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Calendar</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-4">
            {months[2].toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Paid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <span>Future</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <div className="grid grid-cols-4 gap-4">
            <div className="font-semibold">Customer / Unit</div>
            {months.map((month, index) => (
              <div key={index} className="font-semibold text-center">
                {month.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {rentals.map((rental) => (
            <div
              key={rental.id}
              className="grid grid-cols-4 gap-4 items-center py-3 border-b border-border/50 last:border-0"
            >
              {/* Customer Info */}
              <div className="space-y-1">
                <div className="font-medium">
                  {rental.customers.first_name} {rental.customers.last_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  Unit {rental.storage_units.unit_number} • ${rental.storage_units.monthly_rate}/mo
                </div>
              </div>

              {/* Payment Status for Each Month */}
              {months.map((month, monthIndex) => {
                const status = getPaymentStatus(rental.id, month)
                const key = `${rental.id}-${month.getTime()}`
                const isProcessing = processingPayments.has(key)
                const isFuture = month > new Date(new Date().getFullYear(), new Date().getMonth(), 1)

                return (
                  <div key={monthIndex} className="flex items-center justify-center">
                    {isFuture ? (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {status === "paid" ? (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        ) : status === "missed" ? (
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <X className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0 hover:bg-green-50 hover:border-green-300 bg-transparent"
                              onClick={() => handleMarkPayment(rental.id, month, "paid")}
                              disabled={isProcessing}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0 hover:bg-red-50 hover:border-red-300 bg-transparent"
                              onClick={() => handleMarkPayment(rental.id, month, "missed")}
                              disabled={isProcessing}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {months.map((month, index) => {
          const monthPayments = rentals.map((r) => getPaymentStatus(r.id, month))
          const paid = monthPayments.filter((s) => s === "paid").length
          const missed = monthPayments.filter((s) => s === "missed").length
          const pending = monthPayments.filter((s) => s === "pending").length
          const total = rentals.length

          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Paid:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {paid}/{total}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Missed:</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {missed}/{total}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending:</span>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {pending}/{total}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
