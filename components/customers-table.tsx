import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Phone, Mail, Plus } from "lucide-react"
import Link from "next/link"

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

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => {
        const activeRentals = customer.rentals?.filter((r) => r.status === "active") || []
        const totalMonthlyRent = activeRentals.reduce(
          (sum, rental) => sum + Number(rental.storage_units.monthly_rate),
          0,
        )

        return (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
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
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  <Badge variant={activeRentals.length > 0 ? "default" : "secondary"} className="text-xs">
                    {activeRentals.length} Unit{activeRentals.length !== 1 ? "s" : ""}
                  </Badge>
                  <Link href={`/customers/${customer.id}/edit`}>
                    <Button variant="outline" size="sm" className="h-7 px-2 bg-transparent">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2">
                {customer.city && <p className="text-xs text-muted-foreground">{customer.city}</p>}

                {activeRentals.length > 0 ? (
                  <div className="space-y-1">
                    {activeRentals.map((rental) => (
                      <div key={rental.id} className="flex justify-between text-xs">
                        <span>Unit {rental.storage_units.unit_number}</span>
                        <span className="font-medium">R{rental.storage_units.monthly_rate}/mo</span>
                      </div>
                    ))}
                    {activeRentals.length > 1 && (
                      <div className="border-t pt-1 mt-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Total Monthly</span>
                          <span>R{totalMonthlyRent.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">No active rentals</p>
                    <Link href={`/customers/${customer.id}/assign-unit`}>
                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs bg-transparent">
                        <Plus className="h-3 w-3 mr-1" />
                        Assign Unit
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Since {new Date(customer.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
