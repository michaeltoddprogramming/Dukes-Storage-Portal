import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, MapPin, Zap, Thermometer } from "lucide-react"
import Link from "next/link"

export async function UnitsGrid() {
  const supabase = await createClient()

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

  if (!units || units.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No storage units found</p>
        <Link href="/units/new">
          <Button>Add Your First Unit</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {units.map((unit) => {
        const activeRental = unit.rentals?.find((r) => r.status === "active")

        return (
          <Card key={unit.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Unit {unit.unit_number}</CardTitle>
                <Badge
                  variant={
                    unit.status === "available" ? "default" : unit.status === "occupied" ? "secondary" : "destructive"
                  }
                >
                  {unit.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{unit.facilities.name}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <p className="font-medium">{unit.dimensions}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Rate:</span>
                  <p className="font-medium">${unit.monthly_rate}/mo</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Floor {unit.floor_level}</span>
                {unit.has_climate_control && <Thermometer className="h-4 w-4 text-blue-500" title="Climate Control" />}
                {unit.has_electricity && <Zap className="h-4 w-4 text-yellow-500" title="Electricity" />}
              </div>

              {activeRental && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Rented by: {activeRental.customers.first_name} {activeRental.customers.last_name}
                  </p>
                </div>
              )}

              {unit.description && <p className="text-sm text-muted-foreground line-clamp-2">{unit.description}</p>}

              <div className="flex gap-2 pt-2">
                <Link href={`/units/${unit.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
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
  )
}
