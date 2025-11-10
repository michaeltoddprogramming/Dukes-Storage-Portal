"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, Clock, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface Rental {
  id: string
  start_date: string
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
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "missed">("all")
  const [dueDateFilter, setDueDateFilter] = useState<"all" | "overdue" | "due-soon" | "due-later">("all")

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
        toast({
          title: "Error",
          description: "Rental not found",
          variant: "destructive",
        })
        return
      }

      const supabase = createClient()
      
      // Calculate the first and last day of the month for proper date range filtering
      const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
      const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`

      console.log(`[v0] Processing ${status} payment for rental ${rentalId}, month: ${monthKey}`)

      // Check if payment already exists for this month using date range
      const { data: existingPayments, error: fetchError } = await supabase
        .from("payments")
        .select("*")
        .eq("rental_id", rentalId)
        .gte("payment_date", firstDayOfMonth.toISOString().split("T")[0])
        .lte("payment_date", lastDayOfMonth.toISOString().split("T")[0])
        .eq("payment_type", "rent")

      if (fetchError) {
        console.error("[v0] Error checking existing payment:", fetchError)
        throw new Error("Failed to check existing payment")
      }

      const existingPayment = existingPayments && existingPayments.length > 0 ? existingPayments[0] : null

      if (status === "paid") {
        const paymentDate = new Date().toISOString().split("T")[0]
        
        if (existingPayment) {
          // Update existing payment
          const { error: updateError } = await supabase
            .from("payments")
            .update({
              amount: rental.storage_units.monthly_rate,
              payment_date: paymentDate,
              payment_method: "cash",
              notes: `Payment for ${month.toLocaleDateString("en-US", { month: "long", year: "numeric" })} - marked as paid`,
            })
            .eq("id", existingPayment.id)

          if (updateError) {
            console.error("[v0] Error updating payment:", updateError)
            throw new Error("Failed to update payment")
          }
        } else {
          // Create new payment
          const { error: insertError } = await supabase
            .from("payments")
            .insert({
              rental_id: rentalId,
              amount: rental.storage_units.monthly_rate,
              payment_date: paymentDate,
              payment_type: "rent",
              payment_method: "cash",
              notes: `Payment for ${month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
            })

          if (insertError) {
            console.error("[v0] Error creating payment:", insertError)
            throw new Error("Failed to record payment")
          }
        }

        toast({
          title: "Payment Recorded",
          description: `Payment marked as paid for ${month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
        })
      } else {
        // Mark as missed - delete payment if it exists
        if (existingPayment) {
          const { error: deleteError } = await supabase
            .from("payments")
            .delete()
            .eq("id", existingPayment.id)

          if (deleteError) {
            console.error("[v0] Error deleting payment:", deleteError)
            throw new Error("Failed to mark payment as missed")
          }
        }

        toast({
          title: "Payment Marked as Missed",
          description: `Payment removed for ${month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
        })
      }

      console.log(`[v0] Payment ${status} completed successfully`)

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("[v0] Error updating payment:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update payment",
        variant: "destructive",
      })
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

  // Filter rentals based on search, status, and due date
  const filteredRentals = useMemo(() => {
    return rentals.filter((rental) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === "" ||
        rental.customers.first_name.toLowerCase().includes(searchLower) ||
        rental.customers.last_name.toLowerCase().includes(searchLower) ||
        rental.storage_units.unit_number.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false

      // Status filter for the current month (rightmost month)
      if (statusFilter !== "all") {
        const currentMonth = months[2]
        const status = getPaymentStatus(rental.id, currentMonth)
        if (status !== statusFilter) return false
      }

      // Due date filter for current month
      if (dueDateFilter !== "all") {
        const startDate = new Date(rental.start_date)
        const dueDay = startDate.getDate()
        const today = new Date()
        const currentDay = today.getDate()
        const currentMonth = months[2]
        
        // Check payment status
        const status = getPaymentStatus(rental.id, currentMonth)
        
        // Skip if already paid (not relevant for due date filtering)
        if (status === "paid") return false

        if (dueDateFilter === "overdue") {
          // Due date has passed and not paid
          return currentDay > dueDay
        } else if (dueDateFilter === "due-soon") {
          // Due within next 7 days
          return dueDay >= currentDay && dueDay <= currentDay + 7
        } else if (dueDateFilter === "due-later") {
          // Due more than 7 days from now
          return dueDay > currentDay + 7
        }
      }

      return true
    })
  }, [rentals, searchTerm, statusFilter, dueDateFilter, months])

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

      {/* Search and Filter Section */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or unit number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px] h-11">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Payment Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">✓ Paid</SelectItem>
                  <SelectItem value="pending">⏳ Pending</SelectItem>
                  <SelectItem value="missed">✗ Missed</SelectItem>
                </SelectContent>
              </Select>

              {/* Due Date Filter */}
              <Select value={dueDateFilter} onValueChange={(value: any) => setDueDateFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px] h-11">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <SelectValue placeholder="Due Date" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Due Dates</SelectItem>
                  <SelectItem value="overdue">🔴 Overdue (unpaid)</SelectItem>
                  <SelectItem value="due-soon">🟡 Due Soon (next 7 days)</SelectItem>
                  <SelectItem value="due-later">🟢 Due Later (&gt;7 days)</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              {(statusFilter !== "all" || dueDateFilter !== "all" || searchTerm !== "") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("all")
                    setDueDateFilter("all")
                    setSearchTerm("")
                  }}
                  className="h-11 px-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-muted-foreground">
            Showing {filteredRentals.length} of {rentals.length} rental{rentals.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

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
          {filteredRentals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No rentals match your search criteria</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search term</p>
            </div>
          ) : (
            filteredRentals.map((rental) => (
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
                  <span className="font-semibold text-primary">R{rental.storage_units.monthly_rate}/mo</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Due: {(() => {
                      const startDate = new Date(rental.start_date)
                      const currentMonth = months[2] // Current month from the displayed months
                      const dueDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), startDate.getDate())
                      return dueDate.toLocaleDateString("en-US", { 
                        month: "short", 
                        day: "numeric" 
                      })
                    })()} monthly
                  </span>
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
            ))
          )}
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
