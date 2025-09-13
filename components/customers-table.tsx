import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Phone, Mail, MapPin } from "lucide-react"
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
    <div className="grid gap-6">
      {customers.map((customer) => {
        const activeRentals = customer.rentals?.filter((r) => r.status === "active") || []
        const totalMonthlyRent = activeRentals.reduce(
          (sum, rental) => sum + Number(rental.storage_units.monthly_rate),
          0,
        )

        return (
          <Card key={customer.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {customer.first_name} {customer.last_name}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={activeRentals.length > 0 ? "default" : "secondary"}>
                    {activeRentals.length} Active Rental{activeRentals.length !== 1 ? "s" : ""}
                  </Badge>
                  <Link href={`/customers/${customer.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Contact Information */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
                  {customer.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p>{customer.address}</p>
                        {customer.city && customer.state && (
                          <p>
                            {customer.city}, {customer.state} {customer.zip_code}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                {customer.emergency_contact_name && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Emergency Contact</h4>
                    <div className="text-sm">
                      <p className="font-medium">{customer.emergency_contact_name}</p>
                      {customer.emergency_contact_phone && (
                        <p className="text-muted-foreground">{customer.emergency_contact_phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Rental Summary */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Rental Summary</h4>
                  {activeRentals.length > 0 ? (
                    <div className="space-y-1">
                      {activeRentals.map((rental) => (
                        <div key={rental.id} className="flex justify-between text-sm">
                          <span>Unit {rental.storage_units.unit_number}</span>
                          <span className="font-medium">${rental.storage_units.monthly_rate}/mo</span>
                        </div>
                      ))}
                      <div className="border-t pt-1 mt-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Total Monthly</span>
                          <span>${totalMonthlyRent.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No active rentals</p>
                  )}
                </div>
              </div>

              {/* Customer since */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Customer since {new Date(customer.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
