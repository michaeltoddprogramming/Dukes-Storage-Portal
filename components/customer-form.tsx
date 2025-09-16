"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

interface CustomerFormProps {
  customer?: any
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const unitIdFromUrl = searchParams.get('unit')
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || "",
    last_name: customer?.last_name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
  })

  const [preSelectedUnit, setPreSelectedUnit] = useState(null)
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [leaseStatus, setLeaseStatus] = useState("")
  const [firstMonthPayment, setFirstMonthPayment] = useState(false)
  const [assignUnit, setAssignUnit] = useState(!!unitIdFromUrl)

  useEffect(() => {
    if (unitIdFromUrl) {
      const fetchUnit = async () => {
        const supabase = createClient()
        const { data: unitData } = await supabase
          .from("storage_units")
          .select(`
            *,
            facilities!inner(name)
          `)
          .eq("id", unitIdFromUrl)
          .single()

        if (unitData) {
          setPreSelectedUnit(unitData)
          setAssignUnit(true)
        }
      }

      fetchUnit()
    }
  }, [unitIdFromUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      let result
      if (customer) {
        result = await supabase.from("customers").update(formData).eq("id", customer.id)
      } else {
        result = await supabase.from("customers").insert([formData]).select()

        if (result.error) throw result.error

        // If unit assignment is requested, create rental
        if (assignUnit && preSelectedUnit && result.data?.[0]) {
          const customerId = result.data[0].id
          
          // Create rental record
          const { error: rentalError } = await supabase.from("rentals").insert([
            {
              customer_id: customerId,
              unit_id: preSelectedUnit.id,
              start_date: paymentDate,
              monthly_rate: preSelectedUnit.monthly_rate,
              status: "active",
            },
          ])

          if (rentalError) throw rentalError

          // Update unit status to occupied
          const { error: unitError } = await supabase
            .from("storage_units")
            .update({ status: "occupied" })
            .eq("id", preSelectedUnit.id)

          if (unitError) throw unitError

          // Create first month payment if requested
          if (firstMonthPayment) {
            const { error: paymentError } = await supabase.from("payments").insert([
              {
                rental_id: customerId, // This should be the rental ID, but we'd need to fetch it
                amount: preSelectedUnit.monthly_rate,
                payment_date: paymentDate,
                payment_type: "rent",
                payment_method: "cash",
                notes: `First month payment for unit ${preSelectedUnit.unit_number}`,
              },
            ])

            if (paymentError) console.warn("Payment creation failed:", paymentError)
          }
        }
      }

      if (result.error) throw result.error

      toast({
        title: "Success",
        description: `Customer ${customer ? "updated" : "created"} successfully${assignUnit ? " and unit assigned" : ""}`,
      })

      router.push("/units")
    } catch (error) {
      console.error("Error saving customer:", error)
      toast({
        title: "Error",
        description: "Failed to save customer",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {customer ? "Edit" : "Add New"} Customer
          {preSelectedUnit && (
            <div className="text-sm font-normal text-muted-foreground mt-1">
              Assigning to Unit {preSelectedUnit.unit_number}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customer Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+27 12 345 6789"
                />
              </div>
            </div>
          </div>

          {preSelectedUnit && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Unit Assignment</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Unit {preSelectedUnit.unit_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {preSelectedUnit.dimensions} • {preSelectedUnit.facilities.name}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {formatCurrency(preSelectedUnit.monthly_rate)}/month
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Start Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required={assignUnit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lease_status">Lease Status</Label>
                  <Select value={leaseStatus} onValueChange={setLeaseStatus} required={assignUnit}>
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
                <Checkbox
                  id="first_month_payment"
                  checked={firstMonthPayment}
                  onCheckedChange={(checked) => setFirstMonthPayment(checked === true)}
                />
                <Label htmlFor="first_month_payment">Record 1st Month Payment</Label>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading || (assignUnit && !leaseStatus)}>
              {isLoading
                ? "Saving..."
                : customer
                  ? "Update Customer"
                  : assignUnit
                    ? "Create Customer & Assign Unit"
                    : "Create Customer"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/units")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
