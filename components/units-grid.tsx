"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { deleteUnit, terminateRental } from "@/app/actions/rental-actions"
import { Edit, Trash2, Zap, User, UserPlus, X, Plus, Search, Filter, SlidersHorizontal, Grid3x3, LayoutList, DoorClosed, Maximize2, DollarSign, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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
  const [allCustomers, setAllCustomers] = useState([]) // Store all customers
  const [isSearching, setIsSearching] = useState(false)
  
  // New filter and view states - Following Miller's Law: chunked, digestible controls
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sizeFilter, setSizeFilter] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [facilityFilter, setFacilityFilter] = useState("all")
  const [hasElectricity, setHasElectricity] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("unit_number")
  
  useEffect(() => {
    fetchUnits()
  }, [])

  // Load all customers when dialog opens
  useEffect(() => {
    if (unitToAssign) {
      loadAllCustomers()
    }
  }, [unitToAssign])

  // Filter customers based on search term
  useEffect(() => {
    if (allCustomers.length > 0) {
      if (customerSearchTerm.trim()) {
        const filtered = allCustomers.filter(customer => 
          customer.first_name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
          customer.last_name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
        )
        setSearchResults(filtered)
      } else {
        setSearchResults(allCustomers)
      }
    }
  }, [customerSearchTerm, allCustomers])

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

  const loadAllCustomers = async () => {
    setIsSearching(true)
    
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from("customers")
        .select("id, first_name, last_name, email, phone")
        .order("last_name")
      
      if (error) throw error
      
      setAllCustomers(data || [])
      setSearchResults(data || [])
      
      toast({
        title: "Customers Loaded",
        description: `Found ${data?.length || 0} customers available for assignment`,
      })
    } catch (error) {
      console.error("Error loading customers:", error)
      toast({
        title: "Loading Failed",
        description: `Could not load customers: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setIsSearching(false)
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
      setAllCustomers([])
      loadingToast.dismiss()
    }
  }

  const handleCloseAssignDialog = () => {
    setUnitToAssign(null)
    setSearchResults([])
    setAllCustomers([])
    setCustomerSearchTerm("")
  }

  // Get unique facilities for filter
  const facilities = useMemo(() => {
    const uniqueFacilities = [...new Set(units.map(u => u.facilities?.name).filter(Boolean))]
    return uniqueFacilities
  }, [units])

  // Filter and sort units - Following Fitts's Law with efficient filtering
  const filteredAndSortedUnits = useMemo(() => {
    let filtered = [...units]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(unit => 
        unit.unit_number.toLowerCase().includes(query) ||
        unit.size_category?.toLowerCase().includes(query) ||
        unit.facilities?.name?.toLowerCase().includes(query) ||
        unit.rentals?.some(r => 
          r.customers?.first_name?.toLowerCase().includes(query) ||
          r.customers?.last_name?.toLowerCase().includes(query) ||
          r.customers?.email?.toLowerCase().includes(query)
        )
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(unit => unit.status === statusFilter)
    }

    // Size filter
    if (sizeFilter !== "all") {
      filtered = filtered.filter(unit => unit.size_category === sizeFilter)
    }

    // Price range filter
    if (priceRange !== "all") {
      const ranges = {
        "0-500": [0, 500],
        "500-1000": [500, 1000],
        "1000-1500": [1000, 1500],
        "1500+": [1500, Infinity]
      }
      const [min, max] = ranges[priceRange] || [0, Infinity]
      filtered = filtered.filter(unit => {
        const rate = Number(unit.monthly_rate)
        return rate >= min && rate < max
      })
    }

    // Facility filter
    if (facilityFilter !== "all") {
      filtered = filtered.filter(unit => unit.facilities?.name === facilityFilter)
    }

    // Electricity filter
    if (hasElectricity !== "all") {
      const hasElec = hasElectricity === "yes"
      filtered = filtered.filter(unit => unit.has_electricity === hasElec)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "unit_number":
          const aNum = Number.parseInt(a.unit_number.replace(/\D/g, "")) || 999
          const bNum = Number.parseInt(b.unit_number.replace(/\D/g, "")) || 999
          return aNum - bNum
        case "price_low":
          return Number(a.monthly_rate) - Number(b.monthly_rate)
        case "price_high":
          return Number(b.monthly_rate) - Number(a.monthly_rate)
        case "size":
          return (a.dimensions || "").localeCompare(b.dimensions || "")
        case "status":
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return filtered
  }, [units, searchQuery, statusFilter, sizeFilter, priceRange, facilityFilter, hasElectricity, sortBy])

  // Get unique sizes for filter
  const uniqueSizes = useMemo(() => {
    return [...new Set(units.map(u => u.size_category).filter(Boolean))]
  }, [units])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading units...</p>
        </div>
      </div>
    )
  }

  if (!units.length) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
          <Grid3x3 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">No Storage Units</h3>
        <p className="text-muted-foreground mb-6">Get started by adding your first storage unit</p>
        <Link href="/units/new">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Unit
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Filters Section - Following Gestalt Principles: grouped related controls */}
      <div className="space-y-6 mb-8">
        {/* Search Bar - Fitts's Law: prominent, easy to access */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by unit number, size, facility, or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-base shadow-sm border-2"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Controls - Miller's Law: 5-7 grouped options */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Filters</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filteredAndSortedUnits.length} of {units.length} units
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all")
                    setSizeFilter("all")
                    setPriceRange("all")
                    setFacilityFilter("all")
                    setHasElectricity("all")
                    setSearchQuery("")
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Size Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Door Type
                </Label>
                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    {uniqueSizes.map(size => (
                      <SelectItem key={size} value={size} className="capitalize">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Price Range
                </Label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-500">R0 - R500</SelectItem>
                    <SelectItem value="500-1000">R500 - R1,000</SelectItem>
                    <SelectItem value="1000-1500">R1,000 - R1,500</SelectItem>
                    <SelectItem value="1500+">R1,500+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Facility Filter */}
              {facilities.length > 1 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Facility
                  </Label>
                  <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Facilities</SelectItem>
                      {facilities.map(facility => (
                        <SelectItem key={facility} value={facility}>
                          {facility}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Electricity Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Electricity
                </Label>
                <Select value={hasElectricity} onValueChange={setHasElectricity}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    <SelectItem value="yes">With Electricity</SelectItem>
                    <SelectItem value="no">Without</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sort By
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit_number">Unit Number</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Toggle & Results Summary */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Storage Units
              {filteredAndSortedUnits.length !== units.length && (
                <span className="text-muted-foreground ml-2">
                  ({filteredAndSortedUnits.length} filtered)
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedUnits.filter(u => u.status === "available").length} available • 
              {filteredAndSortedUnits.filter(u => u.status === "occupied").length} occupied
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-10 px-3"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-10 px-3"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Units Display */}
      {filteredAndSortedUnits.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Filter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No units match your filters</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
          <Button
            variant="outline"
            onClick={() => {
              setStatusFilter("all")
              setSizeFilter("all")
              setPriceRange("all")
              setFacilityFilter("all")
              setHasElectricity("all")
              setSearchQuery("")
            }}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className={cn(
          viewMode === "grid" 
            ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" 
            : "space-y-4"
        )}>
          {filteredAndSortedUnits.map((unit) => {
          const activeRental = unit.rentals?.find((r) => r.status === "active")
          const customer = activeRental?.customers

          return (
            <Card 
              key={unit.id} 
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2",
                unit.status === "available" && "border-green-200/50 bg-gradient-to-br from-green-50/50 to-background",
                unit.status === "occupied" && "border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-background",
                unit.status === "maintenance" && "border-red-200/50 bg-gradient-to-br from-red-50/50 to-background",
                viewMode === "list" && "hover:scale-100"
              )}
            >
              {/* Header */}
              <CardHeader className={cn("pb-3", viewMode === "grid" ? "px-5 pt-5" : "px-6 pt-6")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold mb-1 flex items-center gap-2">
                      {unit.unit_number}
                      {unit.has_electricity && (
                        <div className="p-1 bg-yellow-100 rounded">
                          <Zap className="h-3.5 w-3.5 text-yellow-600" />
                        </div>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{unit.facilities?.name || "Facility"}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      unit.status === "available" ? "default" : unit.status === "occupied" ? "secondary" : "destructive"
                    }
                    className="text-xs px-3 py-1 font-semibold"
                  >
                    {unit.status === "available" ? "Available" : unit.status === "occupied" ? "Occupied" : "Maintenance"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className={cn("space-y-4", viewMode === "grid" ? "px-5 pb-5" : "px-6 pb-6")}>
                {/* Unit Details - Gestalt: Grouped related information */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <DoorClosed className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Door Type</p>
                      <p className="text-sm font-semibold capitalize">{unit.size_category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Maximize2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Dimensions</p>
                      <p className="text-sm font-semibold">{unit.dimensions}</p>
                    </div>
                  </div>
                </div>

                {/* Price - Prominent display (Fitts's Law) */}
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-700 font-medium">Monthly Rate</p>
                    <p className="text-xl font-bold text-green-900">{formatCurrency(unit.monthly_rate)}</p>
                  </div>
                </div>

                {/* Customer/Rental Section */}
                {customer ? (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-semibold text-blue-600">Current Tenant</p>
                          <p className="text-sm font-bold text-blue-900">
                            {customer.first_name} {customer.last_name}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRentalToUnlink({ 
                          id: activeRental.id, 
                          unitId: unit.id, 
                          unitNumber: unit.unit_number, 
                          customerName: `${customer.first_name} ${customer.last_name}` 
                        })}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                        title="Terminate rental"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-1 text-sm text-blue-800">
                      <p className="truncate flex items-center gap-2">
                        <span className="text-xs text-blue-600">📧</span>
                        {customer.email}
                      </p>
                      {customer.phone && (
                        <p className="truncate flex items-center gap-2">
                          <span className="text-xs text-blue-600">📞</span>
                          {customer.phone}
                        </p>
                      )}
                    </div>
                    
                    <Link href={`/customers/${customer.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full h-10 font-medium border-blue-300 hover:bg-blue-50">
                        <User className="h-4 w-4 mr-2" />
                        View Customer Details
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 justify-center text-green-700 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold uppercase tracking-wide">Ready to Rent</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-10 font-medium bg-white border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => setUnitToAssign(unit)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign Existing Customer
                      </Button>
                      <Link href={`/customers/new?unit=${unit.id}`} className="block">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-10 font-medium bg-white border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Customer
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Actions - Larger touch targets (Fitts's Law) */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/units/${unit.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-10 font-medium">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Unit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 px-4"
                    onClick={() => setUnitToDelete(unit)}
                  >
                    <Trash2 className="h-4 w-4" />
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
      )}

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
      <Dialog open={!!unitToAssign} onOpenChange={handleCloseAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Customer to Unit {unitToAssign?.unit_number}</DialogTitle>
            <DialogDescription>
              Choose an existing customer to assign to this unit
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers by name or email..." 
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {isSearching ? (
              <div className="text-center p-4">
                <p className="text-muted-foreground">Loading customers...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-60 overflow-y-auto space-y-2">
                <p className="text-sm text-muted-foreground">
                  {customerSearchTerm 
                    ? `${searchResults.length} customer${searchResults.length === 1 ? '' : 's'} found:` 
                    : `${searchResults.length} total customer${searchResults.length === 1 ? '' : 's'}:`
                  }
                </p>
                {searchResults.map(customer => (
                  <Card key={customer.id} className="p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                        {customer.phone && (
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        )}
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
                  {allCustomers.length === 0 
                    ? "No customers found in the system" 
                    : "No customers match your search"
                  }
                </p>
              </div>
            )}
            
            <div className="flex justify-center pt-4 border-t">
              <Link href={`/customers/new?unit=${unitToAssign?.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Customer
                </Button>
              </Link>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAssignDialog}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
