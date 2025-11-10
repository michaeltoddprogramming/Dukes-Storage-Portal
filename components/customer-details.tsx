"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { deleteCustomer } from "@/app/actions/rental-actions"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, Edit, Phone, Mail, Trash2, X, Plus, Calendar } from "lucide-react"

// Accept customerId as a prop
export function CustomerDetails({ customerId }: { customerId: string }) {
  const router = useRouter()
  const [customer, setCustomer] = useState(null)
  const [rentals, setRentals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [rentalToUnlink, setRentalToUnlink] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function fetchCustomerDetails() {
      try {
        const supabase = createClient()
        // Get customer details
        const { data: customerData } = await supabase
          .from("customers")
          .select("*")
          .eq("id", customerId)
          .single()
        if (customerData) setCustomer(customerData)
        // Get customer rentals with unit info
        const { data: rentalsData } = await supabase
          .from("rentals")
          .select(`*,storage_units(*)`)
          .eq("customer_id", customerId)
          .order("start_date", { ascending: false })
        if (rentalsData) setRentals(rentalsData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load customer information",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    if (customerId) fetchCustomerDetails()
  }, [customerId])

  const handleDeleteCustomer = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteCustomer(customerId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Customer deleted successfully"
        })
        router.push("/units")
      } else {
        throw new Error("Failed to delete customer")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleUnlinkRental = async (rentalId) => {
    setIsUnlinking(true)
    try {
      const supabase = createClient()
      
      // Get rental details first
      const { data: rental, error: rentalFetchError } = await supabase
        .from("rentals")
        .select("unit_id, customer_id")
        .eq("id", rentalId)
        .single()
      
      if (rentalFetchError) throw new Error(`Failed to fetch rental: ${rentalFetchError.message}`)
      if (!rental) throw new Error("Rental not found")
      
      // Update rental status to terminated
      const { error: updateError } = await supabase
        .from("rentals")
        .update({
          status: "terminated",
          end_date: new Date().toISOString().split("T")[0]
        })
        .eq("id", rentalId)
        
      if (updateError) throw new Error(`Failed to terminate rental: ${updateError.message}`)
      
      // Check if there are other active rentals for this unit
      const { data: otherRentals, error: otherRentalsError } = await supabase
        .from("rentals")
        .select("id")
        .eq("unit_id", rental.unit_id)
        .eq("status", "active")
        .neq("id", rentalId)
      
      if (otherRentalsError) {
        console.warn("Warning: Could not check for other rentals:", otherRentalsError.message)
      }
      
      // Only update unit status if no other active rentals exist
      if (!otherRentals?.length) {
        const { error: unitUpdateError } = await supabase
          .from("storage_units")
          .update({ status: "available" })
          .eq("id", rental.unit_id)
        
        if (unitUpdateError) throw new Error(`Failed to update unit status: ${unitUpdateError.message}`)
      }
      
      toast({
        title: "Success",
        description: "Unit unlinked from customer"
      })
      
      // Update local state - mark rental as terminated
      setRentals(rentals.map(rental => 
        rental.id === rentalId 
          ? { ...rental, status: "terminated", end_date: new Date().toISOString().split("T")[0] } 
          : rental
      ))
    } catch (error) {
      console.error("Error unlinking rental:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to unlink unit",
        variant: "destructive"
      })
    } finally {
      setIsUnlinking(false)
      setRentalToUnlink(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Loading customer details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Customer not found</p>
            <Button 
              onClick={() => router.push("/units")}
              className="mx-auto mt-4 block"
            >
              Return to Units
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeRentals = rentals.filter(r => r.status === "active")
  const inactiveRentals = rentals.filter(r => r.status !== "active")
  
  const totalMonthlyRent = activeRentals.reduce(
    (sum, rental) => sum + Number(rental.storage_units?.monthly_rate || 0),
    0
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push("/units")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Units
        </Button>
      </div>

      {/* Customer information card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{customer.first_name} {customer.last_name}</CardTitle>
            <div className="flex gap-2">
              <Link href={`/customers/${customer.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Active rentals summary */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Rental Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Active Units</p>
                  <p className="text-lg font-semibold">{activeRentals.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(totalMonthlyRent)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active rentals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Active Rentals</h3>
              {activeRentals.length > 0 && (
                <Link href={`/customers/${customer.id}/assign-unit`}>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Another Unit
                  </Button>
                </Link>
              )}
            </div>

            {activeRentals.length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">No active rentals</p>
                <Link href={`/customers/${customer.id}/assign-unit`}>
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Unit
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {activeRentals.map((rental) => (
                  <Card key={rental.id} className="overflow-hidden">
                    <CardHeader className="bg-blue-50 pb-2 border-b border-blue-100 relative">
                      <div className="absolute right-2 top-2">
                        <button
                          onClick={() => setRentalToUnlink(rental)}
                          className="text-red-500 hover:text-red-700 focus:outline-none bg-white rounded-full p-1"
                          title="Unlink unit"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <CardTitle className="text-lg">{rental.storage_units.unit_number}</CardTitle>
                      <p className="text-sm text-muted-foreground">{rental.storage_units.dimensions}</p>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Monthly Rate</span>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {formatCurrency(rental.storage_units.monthly_rate)}/month
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Start Date</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">{new Date(rental.start_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Rental history */}
          {inactiveRentals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Rental History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">End Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {inactiveRentals.map((rental) => (
                      <tr key={rental.id}>
                        <td className="px-4 py-2 whitespace-nowrap">{rental.storage_units.unit_number}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <Badge variant="secondary">{rental.status}</Badge>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">{new Date(rental.start_date).toLocaleDateString()}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {rental.end_date ? new Date(rental.end_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(rental.monthly_rate)}/month</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {customer.first_name} {customer.last_name}? This will also terminate all active rentals.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteCustomer}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink rental dialog */}
      <Dialog open={!!rentalToUnlink} onOpenChange={() => setRentalToUnlink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlink Unit</DialogTitle>
            <DialogDescription>
              {rentalToUnlink && (
                `Are you sure you want to unlink unit ${rentalToUnlink.storage_units.unit_number}? 
                This will make the unit available for other customers.`
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRentalToUnlink(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleUnlinkRental(rentalToUnlink.id)}
              disabled={isUnlinking}
            >
              {isUnlinking ? "Unlinking..." : "Unlink Unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}