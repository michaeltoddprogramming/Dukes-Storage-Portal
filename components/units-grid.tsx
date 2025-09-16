"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { deleteUnit, terminateRental } from "@/app/actions/rental-actions"
import { Edit, Trash2, Zap, User, UserPlus, X, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Add formatCurrency function directly or ensure proper import
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount)
}

export function UnitsGrid() {
  const router = useRouter()
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState(null)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [rentalToUnlink, setRentalToUnlink] = useState(null)
  const [unitToAssign, setUnitToAssign] = useState(null)
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  
  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("storage_units")
        .select(`
          *,
          facilities!inner(name),
          rentals(
            id,
            status,
            start_date,
            customers!inner(id, first_name, last_name, email, phone)
          )
        `)
        .order("unit_number")
      
      if (error) throw error
      
      setUnits(data || [])
      
      // Success toast for initial load
      if (data && data.length > 0) {
        toast({
          title: "Units Loaded",
          description: `Successfully loaded ${data.length} storage units`,
        })
      }
    } catch (error) {
      console.error("Error fetching units:", error)
      toast({
        title: "Loading Failed",
        description: "Failed to load storage units. Please refresh the page.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteUnit = async (unitId) => {
    setIsDeleting(true)
    
    const loadingToast = toast({
      title: "Deleting Unit...",
      description: "Please wait while we delete the unit",
    })
    
    try {
      const result = await deleteUnit(unitId)
      
      if (result.success) {
        toast({
          title: "Unit Deleted Successfully",
          description: `Unit ${unitToDelete?.unit_number} has been permanently deleted`,
        })
        setUnits(units.filter(unit => unit.id !== unitId))
      } else {
        throw new Error(result.error?.message || "Failed to delete unit")
      }
    } catch (error) {
      console.error("Error deleting unit:", error)
      toast({
        title: "Deletion Failed",
        description: error.message || "Could not delete the unit. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setUnitToDelete(null)
      loadingToast.dismiss()
    }
  }

  const handleUnlinkRental = async (rentalId, unitId) => {
    setIsUnlinking(true)
    
    const loadingToast = toast({
      title: "Unlinking Customer...",
      description: "Terminating rental and updating unit status",
    })
    
    try {
      const result = await terminateRental(rentalId)
      
      if (result.success) {
        toast({
          title: "Customer Unlinked Successfully",
          description: `Customer has been removed from ${rentalToUnlink?.unitNumber}. Unit is now available.`,
        })
        
        // Update local state
        setUnits(units.map(unit => {
          if (unit.id === unitId) {
            return {
              ...unit,
              status: "available",
              rentals: unit.rentals.map(rental => 
                rental.id === rentalId 
                  ? { ...rental, status: "terminated" } 
                  : rental
              )
            }
          }
          return unit
        }))
      } else {
        throw new Error(result.error?.message || "Failed to unlink customer")
      }
    } catch (error) {
      console.error("Error unlinking rental:", error)
      toast({
        title: "Unlinking Failed",
        description: error.message || "Could not unlink customer from unit. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUnlinking(false)
      setRentalToUnlink(null)
      loadingToast.dismiss()
    }
  }
  
  const handleSearchCustomers = async () => {
    if (!customerSearchTerm.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a customer name or email to search",
        variant: "destructive"
      })
      return
    }
    
    setIsSearching(true)
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .or(`first_name.ilike.%${customerSearchTerm}%,last_name.ilike.%${customerSearchTerm}%,email.ilike.%${customerSearchTerm}%`)
        .order("last_name")
      
      if (error) throw error
      
      setSearchResults(data || [])
      
      if (data && data.length > 0) {
        toast({
          title: "Search Complete",
          description: `Found ${data.length} matching customer${data.length === 1 ? '' : 's'}`,
        })
      } else {
        toast({
          title: "No Results",
          description: "No customers found matching your search criteria",
        })
      }
    } catch (error) {
      console.error("Error searching customers:", error)
      toast({
        title: "Search Failed",
        description: "Could not search customers. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
    }
  }
  
  const handleAssignCustomerToUnit = async (customerId, unitId) => {
    const loadingToast = toast({
      title: "Assigning Customer...",
      description: "Creating rental and updating unit status",
    })
    
    try {
      const supabase = createClient()
      
      // Create rental record
      const { error: rentalError } = await supabase.from("rentals").insert([{
        customer_id: customerId,
        unit_id: unitId,
        start_date: new Date().toISOString().split("T")[0],
        monthly_rate: unitToAssign.monthly_rate,
        status: "active"
      }])
      
      if (rentalError) throw rentalError
      
      // Update unit status
      const { error: unitError } = await supabase
        .from("storage_units")
        .update({ status: "occupied" })
        .eq("id", unitId)
        
      if (unitError) throw unitError
      
      const assignedCustomer = searchResults.find(c => c.id === customerId)
      
      toast({
        title: "Assignment Successful",
        description: `${assignedCustomer?.first_name} ${assignedCustomer?.last_name} has been assigned to unit ${unitToAssign.unit_number}`,
      })
      
      // Refresh units
      await fetchUnits()
      
    } catch (error) {
      console.error("Error assigning customer:", error)
      toast({
        title: "Assignment Failed",
        description: error.message || "Could not assign customer to unit. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUnitToAssign(null)
      setCustomerSearchTerm("")
      setSearchResults([])
      loadingToast.dismiss()
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading units...</p>
      </div>
    )
  }

  if (!units.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No storage units found</p>
        <Link href="/units/new">
          <Button>Add Your First Unit</Button>
        </Link>
      </div>
    )
  }

  const sortedUnits = [...units].sort((a, b) => {
    const aNum = Number.parseInt(a.unit_number.replace(/\D/g, "")) || 999
    const bNum = Number.parseInt(b.unit_number.replace(/\D/g, "")) || 999
    return aNum - bNum
  })

  return (
    <>
      <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
        {sortedUnits.map((unit) => {
          const activeRental = unit.rentals?.find((r) => r.status === "active")
          const customer = activeRental?.customers

          return (
            <Card key={unit.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-1 px-3 pt-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">{unit.unit_number}</CardTitle>
                  <Badge
                    variant={
                      unit.status === "available" ? "default" : unit.status === "occupied" ? "secondary" : "destructive"
                    }
                    className="text-xs px-1 py-0"
                  >
                    {unit.status === "available" ? "Free" : unit.status === "occupied" ? "Rented" : "Maint"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-1 pt-0 px-3 pb-3">
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Door:</span>
                    <span className="font-medium capitalize">{unit.size_category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{unit.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(unit.monthly_rate)}/mo</span>
                  </div>
                </div>

                {unit.has_electricity && (
                  <div className="flex items-center gap-1 text-xs">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span className="text-muted-foreground">Electricity</span>
                  </div>
                )}

                {customer ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">RENTED TO:</span>
                      </div>
                      <button
                        onClick={() => setRentalToUnlink({ 
                          id: activeRental.id, 
                          unitId: unit.id, 
                          unitNumber: unit.unit_number, 
                          customerName: `${customer.first_name} ${customer.last_name}` 
                        })}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                        title="Unlink customer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <p className="text-xs font-semibold text-blue-900 truncate">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <p className="text-xs text-blue-700 truncate">{customer.email}</p>
                    {customer.phone && (
                      <p className="text-xs text-blue-700 truncate">{customer.phone}</p>
                    )}
                    
                    <div className="mt-2 text-xs">
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="outline" size="sm" className="w-full h-6 text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-2 mt-2">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-xs font-medium text-green-800">AVAILABLE</span>
                    </div>
                    
                    <div className="space-y-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-6 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        onClick={() => setUnitToAssign(unit)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Assign Customer
                      </Button>
                      <Link href={`/customers/new?unit=${unit.id}`} className="block">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-6 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          New Customer
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                <div className="flex gap-1 pt-1">
                  <Link href={`/units/${unit.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-6 text-xs bg-transparent px-1">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive h-6 px-1 bg-transparent"
                    onClick={() => setUnitToDelete(unit)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>

              <div
                className={`absolute bottom-0 left-0 h-1 w-full ${
                  unit.status === "available" ? "bg-green-500" : unit.status === "occupied" ? "bg-blue-500" : "bg-red-500"
                }`}
              />
            </Card>
          )
        })}
      </div>

      {/* Delete Unit Dialog */}
      <Dialog open={!!unitToDelete} onOpenChange={() => setUnitToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Unit</DialogTitle>
            <DialogDescription>
              {unitToDelete && 
                `Are you sure you want to delete unit ${unitToDelete.unit_number}? 
                ${unitToDelete.status === "occupied" ? "This will also terminate any active rentals." : ""}`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleDeleteUnit(unitToDelete.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink Customer Dialog */}
      <Dialog open={!!rentalToUnlink} onOpenChange={() => setRentalToUnlink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlink Customer</DialogTitle>
            <DialogDescription>
              {rentalToUnlink && 
                `Are you sure you want to unlink ${rentalToUnlink.customerName} from unit ${rentalToUnlink.unitNumber}? 
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
              onClick={() => handleUnlinkRental(rentalToUnlink.id, rentalToUnlink.unitId)}
              disabled={isUnlinking}
            >
              {isUnlinking ? "Unlinking..." : "Unlink Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Customer Dialog */}
      <Dialog open={!!unitToAssign} onOpenChange={() => setUnitToAssign(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Customer to Unit {unitToAssign?.unit_number}</DialogTitle>
            <DialogDescription>
              Search for an existing customer to assign to this unit
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input 
                  placeholder="Search by name or email" 
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleSearchCustomers} disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchResults.map(customer => (
                  <Card key={customer.id} className="p-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAssignCustomerToUnit(customer.id, unitToAssign.id)}
                      >
                        Assign
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-muted-foreground mb-4">
                  {customerSearchTerm ? "No matching customers found" : "Search for customers to assign"}
                </p>
              </div>
            )}
            
            <div className="flex justify-center pt-4">
              <Link href={`/customers/new?unit=${unitToAssign?.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Customer
                </Button>
              </Link>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitToAssign(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
