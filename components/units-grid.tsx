"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { deleteUnit } from "@/app/actions/rental-actions"
import { Edit, Trash2, Zap, User } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function UnitsGrid() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState(null)
  
  const handleDeleteUnit = async (unitId) => {
    setIsDeleting(true)
    try {
      const result = await deleteUnit(unitId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Unit deleted successfully"
        })
        router.refresh()
      } else {
        throw new Error("Failed to delete unit")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete unit",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setUnitToDelete(null)
    }
  }
  
  const supabase = createClient()

  const fetchUnits = async () => {
    const { data: units } = await supabase
      .from("storage_units")
      .select(`
        *,
        facilities!inner(name),
        rentals(
          id,
          status,
          customers!inner(first_name, last_name)
        )
      `)
      .order("unit_number")
    
    return units || []
  }
  
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Fetch units on mount
  useState(() => {
    fetchUnits().then(data => {
      setUnits(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div>Loading...</div>
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

                {activeRental ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
                    <div className="flex items-center gap-1 mb-1">
                      <User className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">RENTED TO:</span>
                    </div>
                    <p className="text-xs font-semibold text-blue-900 truncate">
                      {activeRental.customers.first_name} {activeRental.customers.last_name}
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-2 mt-2">
                    <div className="flex items-center justify-center">
                      <span className="text-xs font-medium text-green-800">AVAILABLE</span>
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
    </>
  )
}
