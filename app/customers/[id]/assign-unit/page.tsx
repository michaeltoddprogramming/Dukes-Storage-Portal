"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export default function AssignUnitPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<any>(null)
  const [availableUnits, setAvailableUnits] = useState<any[]>([])
  const [selectedUnitId, setSelectedUnitId] = useState("")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [leaseStatus, setLeaseStatus] = useState("")
  const [firstMonthPayment, setFirstMonthPayment] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Fetch customer details
      const { data: customerData } = await supabase.from("customers").select("*").eq("id", customerId).single()

      if (customerData) {
        setCustomer(customerData)
      }

      // Fetch available units
      const { data: unitsData } = await supabase
        .from("storage_units")
        .select(`
          *,
          facilities!inner(name)
        `)
        .eq("status", "available")
        .order("unit_number")

      if (unitsData) {
        setAvailableUnits(unitsData)
      }
    }

    fetchData()
  }, [customerId])

  const handleAssignUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUnitId || !leaseStatus) return

    setIsLoading(true)

    try {
      const supabase = createClient()
      const selectedUnit = availableUnits.find((unit) => unit.id === selectedUnitId)

      // Create rental record
      const { error: rentalError } = await supabase.from("rentals").insert([
        {
          customer_id: customerId,
          unit_id: selectedUnitId,
          start_date: paymentDate,
          monthly_rate: selectedUnit.monthly_rate,
          status: "active",
        },
      ])

      if (rentalError) throw rentalError

      // Update unit status to occupied
      const { error: unitError } = await supabase
        .from("storage_units")
        .update({ status: "occupied" })
        .eq("id", selectedUnitId)

      if (unitError) throw unitError

      toast({
        title: "Success",
        description: "Unit assigned successfully",
      })

      router.push("/customers")
    } catch (error) {
      console.error("Error assigning unit:", error)
      toast({
        title: "Error",
        description: "Failed to assign unit",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!customer) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Assign Unit to {customer.first_name} {customer.last_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssignUnit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="unit">Select Available Unit</Label>
              <Select value={selectedUnitId} onValueChange={setSelectedUnitId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a unit" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {unit.unit_number} - {unit.dimensions}
                        </span>
                        <Badge variant="outline" className="ml-2">
                          R{unit.monthly_rate}/mo
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lease_status">Lease Status</Label>
                <Select value={leaseStatus} onValueChange={setLeaseStatus} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lease status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="signed">Signed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="first_month_payment" checked={firstMonthPayment} onCheckedChange={(checked) => setFirstMonthPayment(checked === true)} />
              <Label htmlFor="first_month_payment">1st Month Payment</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading || !selectedUnitId || !leaseStatus}>
                {isLoading ? "Assigning..." : "Assign Unit"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/customers")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
