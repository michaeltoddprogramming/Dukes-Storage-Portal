"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { deleteCustomer, terminateRental } from "@/app/actions/rental-actions"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { Plus, Mail, Edit, X, Trash2 } from "lucide-react"

export function CustomersTable() {
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [rentalToUnlink, setRentalToUnlink] = useState(null)

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("customers")
          .select(`
            *,
            rentals(
              id,
              status,
              start_date,
              storage_units!inner(id, unit_number, monthly_rate)
            )
          `)
          .order("last_name")
        
        setCustomers(data || [])
      } catch (error) {
        console.error("Error fetching customers:", error)
        toast({
          title: "Error",
          description: "Failed to load customers data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCustomers()
  }, [])

  const handleDeleteCustomer = async (customerId) => {
    setIsDeleting(true)
    try {
      const result = await deleteCustomer(customerId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Customer deleted successfully"
        })
        // Remove customer from local state
        setCustomers(customers.filter(c => c.id !== customerId))
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
      setCustomerToDelete(null)
    }
  }

  const handleUnlinkRental = async (rentalId) => {
    setIsUnlinking(true)
    try {
      const result = await terminateRental(rentalId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Unit unlinked from customer"
        })
        
        // Update local state
        setCustomers(customers.map(customer => ({
          ...customer,
          rentals: customer.rentals?.map(rental => 
            rental.id === rentalId 
              ? { ...rental, status: "terminated" } 
              : rental
          )
        })))
        
        router.refresh()
      } else {
        throw new Error("Failed to unlink unit")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unlink unit",
        variant: "destructive"
      })
    } finally {
      setIsUnlinking(false)
      setRentalToUnlink(null)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading customers...</p>
      </div>
    )
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No customers found</p>
        <Link href="/customers/new">
          <Button>Add Your First Customer</Button>
        </Link>
      </div>
    )
  }

  const sortedCustomers = [...customers].sort((a, b) => {
    const aActiveRentals = a.rentals?.filter((r) => r.status === "active") || []
    const bActiveRentals = b.rentals?.filter((r) => r.status === "active") || []

    if (aActiveRentals.length === 0 && bActiveRentals.length === 0) {
      return a.last_name.localeCompare(b.last_name)
    }
    if (aActiveRentals.length === 0) return 1
    if (bActiveRentals.length === 0) return -1

    const aLowestUnit = Math.min(
      ...aActiveRentals.map((r) => {
        const unitNum = r.storage_units.unit_number.replace(/\D/g, "")
        return Number.parseInt(unitNum) || 999
      }),
    )
    const bLowestUnit = Math.min(
      ...bActiveRentals.map((r) => {
        const unitNum = r.storage_units.unit_number.replace(/\D/g, "")
        return Number.parseInt(unitNum) || 999
      }),
    )

    return aLowestUnit - bLowestUnit
  })

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sortedCustomers.map((customer) => {
          const activeRentals = customer.rentals?.filter((r) => r.status === "active") || []
          const totalMonthlyRent = activeRentals.reduce(
            (sum, rental) => sum + Number(rental.storage_units.monthly_rate),
            0,
          )

          const sortedActiveRentals = activeRentals.sort((a, b) => {
            const aNum = Number.parseInt(a.storage_units.unit_number.replace(/\D/g, "")) || 999
            const bNum = Number.parseInt(b.storage_units.unit_number.replace(/\D/g, "")) || 999
            return aNum - bNum
          })

          return (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 px-3 sm:px-6">
                {activeRentals.length > 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-wrap gap-1">
                          {sortedActiveRentals.map((rental) => (
                            <div key={rental.id} className="flex items-center gap-1">
                              <span className="text-sm font-bold text-blue-800">
                                {rental.storage_units.unit_number}
                              </span>
                              <button
                                onClick={() => setRentalToUnlink(rental)}
                                className="text-red-500 hover:text-red-700 focus:outline-none"
                                title="Unlink unit"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-700">{formatCurrency(totalMonthlyRent)}/mo</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="font-bold">
                        NO UNIT ASSIGNED
                      </Badge>
                      <Link href={`/customers/${customer.id}/assign-unit`}>
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs bg-transparent">
                          <Plus className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg leading-tight">
                      {customer.first_name} {customer.last_name}
                    </CardTitle>
                    <div className="space-y-1 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">{customer.phone}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <Link href={`/customers/${customer.id}/edit`}>
                      <Button variant="outline" size="sm" className="h-7 px-2 bg-transparent">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 bg-transparent text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setCustomerToDelete(customer)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Delete Customer Dialog */}
      <Dialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              {customerToDelete && 
                `Are you sure you want to delete ${customerToDelete.first_name} ${customerToDelete.last_name}? 
                This will also terminate all active rentals.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteCustomer(customerToDelete.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink Rental Dialog */}
      <Dialog open={!!rentalToUnlink} onOpenChange={() => setRentalToUnlink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlink Unit</DialogTitle>
            <DialogDescription>
              {rentalToUnlink && 
                `Are you sure you want to unlink unit ${rentalToUnlink.storage_units.unit_number}? 
                This will make the unit available for other customers.`
              }
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
    </>
  )
}
