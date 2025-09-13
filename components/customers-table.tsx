import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Plus, Mail } from "lucide-react" // Import Plus and Mail icons

export async function CustomersTable() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from("customers")
    .select(`
      *,
      rentals(
        id,
        status,
        storage_units!inner(unit_number, monthly_rate)
      )
    `)
    .order("last_name")

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

  const sortedCustomers = customers.sort((a, b) => {
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
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
            <CardHeader className="pb-2">
              {activeRentals.length > 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1">
                        {sortedActiveRentals.map((rental) => (
                          <span key={rental.id} className="text-sm font-bold text-blue-800">
                            {rental.storage_units.unit_number}
                          </span>
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
                      {/* Edit icon */}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
