import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export async function PaymentsTable() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      rentals!inner(
        customers!inner(first_name, last_name),
        storage_units!inner(unit_number)
      )
    `)
    .order("payment_date", { ascending: false })
    .limit(50)

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No payments found</p>
        </CardContent>
      </Card>
    )
  }

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "rent":
        return "default"
      case "deposit":
        return "secondary"
      case "late_fee":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "credit_card":
        return "default"
      case "cash":
        return "secondary"
      case "check":
        return "outline"
      case "bank_transfer":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-foreground">
                    {payment.rentals.customers.first_name} {payment.rentals.customers.last_name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    Unit {payment.rentals.storage_units.unit_number}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}</span>
                  {payment.reference_number && (
                    <>
                      <span>•</span>
                      <span>Ref: {payment.reference_number}</span>
                    </>
                  )}
                </div>

                {payment.notes && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{payment.notes}</p>}
              </div>

              <div className="text-right space-y-2">
                <div className="text-lg font-semibold text-foreground">${Number(payment.amount).toLocaleString()}</div>
                <div className="flex gap-2">
                  <Badge variant={getPaymentTypeColor(payment.payment_type)} className="text-xs">
                    {payment.payment_type.replace("_", " ")}
                  </Badge>
                  <Badge variant={getPaymentMethodColor(payment.payment_method)} className="text-xs">
                    {payment.payment_method.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
