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

    console.log(`[v0] Checking payment status for rental ${rentalId}, month ${monthKey}:`, payment)

    if (payment) {
      return "paid"
    }

    // If no payment record and month is past, it's missed
    const now = new Date()
    if (month < new Date(now.getFullYear(), now.getMonth(), 1)) {
      return "missed"
    }

    return "pending"
  }

  const handleMarkPayment = async (rentalId: string, month: Date, status: "paid" | "missed") => {
    console.log(`[v0] Button clicked - marking payment as ${status} for rental ${rentalId}, month:`, month)

    const key = `${rentalId}-${month.getTime()}`
    setProcessingPayments((prev) => new Set(prev).add(key))

    try {
      const rental = rentals.find((r) => r.id === rentalId)
      if (!rental) {
        console.log("[v0] Rental not found:", rentalId)
        return
      }

      console.log(`[v0] Calling server action for ${status}`)

      if (status === "paid") {
        await markPaymentPaid(rentalId, month, rental.storage_units.monthly_rate)
      } else {
        await markPaymentMissed(rentalId, month)
      }

      console.log(`[v0] Server action completed successfully`)

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("[v0] Error updating payment:", error)
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
    <div className="space-y-8">
      {/* Calendar Header - Enhanced with better visual hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border-2 border-border/50 rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold tracking-tight">Payment Calendar</h2>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigateMonth("prev")}
            className="h-11 w-11 p-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-[200px] text-center">
            <span className="text-lg font-semibold">
              {months[2].toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigateMonth("next")}
            className="h-11 w-11 p-0"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Legend - Enhanced with card design */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <span className="font-semibold text-muted-foreground">Status Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
              <span className="font-medium">Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
              <span className="font-medium">Missed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></div>
              <span className="font-medium">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded-full shadow-sm"></div>
              <span className="font-medium">Future</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid - Enhanced with better styling */}
      <Card className="border-2 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/10 border-b-2">
          <div className="grid grid-cols-4 gap-4">
            <div className="font-bold text-base">Customer / Unit</div>
            {months.map((month, index) => (
              <div key={index} className="font-bold text-base text-center">
                {month.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-1 p-6">
          {rentals.map((rental) => (
            <div
              key={rental.id}
              className="grid grid-cols-4 gap-4 items-center py-4 px-2 border-b border-border/50 last:border-0 hover:bg-muted/30 rounded-lg transition-colors"
            >
              {/* Customer Info - Enhanced with better hierarchy */}
              <div className="space-y-1.5">
                <div className="font-semibold text-base">
                  {rental.customers.first_name} {rental.customers.last_name}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Unit {rental.storage_units.unit_number}</span>
                  <span>•</span>
                  <span className="font-semibold text-primary">${rental.storage_units.monthly_rate}/mo</span>
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
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shadow-sm">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {status === "paid" ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        ) : status === "missed" ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-md">
                            <X className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {/* Fitts's Law: Larger touch targets (h-10 = 40px, close to 44px minimum) */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-10 h-10 p-0 hover:bg-green-50 hover:border-green-400 hover:shadow-md bg-transparent border-2 transition-all"
                              onClick={() => handleMarkPayment(rental.id, month, "paid")}
                              disabled={isProcessing}
                              title="Mark as Paid"
                            >
                              <Check className="h-5 w-5 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-10 h-10 p-0 hover:bg-red-50 hover:border-red-400 hover:shadow-md bg-transparent border-2 transition-all"
                              onClick={() => handleMarkPayment(rental.id, month, "missed")}
                              disabled={isProcessing}
                              title="Mark as Missed"
                            >
                              <X className="h-5 w-5 text-red-600" />
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

      {/* Summary Stats - Enhanced with better visual design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {months.map((month, index) => {
          const monthPayments = rentals.map((r) => getPaymentStatus(r.id, month))
          const paid = monthPayments.filter((s) => s === "paid").length
          const missed = monthPayments.filter((s) => s === "missed").length
          const pending = monthPayments.filter((s) => s === "pending").length
          const total = rentals.length
          const paidPercent = total > 0 ? Math.round((paid / total) * 100) : 0

          return (
            <Card key={index} className="border-2 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4 bg-gradient-to-br from-muted/30 to-muted/10">
                <CardTitle className="text-lg font-bold">
                  {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">Payment Summary</p>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Paid:</span>
                  <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200 px-3 py-1 text-sm font-semibold">
                    {paid}/{total}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Missed:</span>
                  <Badge variant="secondary" className="bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200 px-3 py-1 text-sm font-semibold">
                    {missed}/{total}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending:</span>
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200 px-3 py-1 text-sm font-semibold">
                    {pending}/{total}
                  </Badge>
                </div>
                {/* Progress bar */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Completion Rate</span>
                    <span className="text-primary">{paidPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${paidPercent}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
