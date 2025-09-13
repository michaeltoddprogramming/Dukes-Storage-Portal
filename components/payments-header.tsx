import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export function PaymentsHeader() {
  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payments</h1>
            <p className="text-muted-foreground">Track and manage all payments</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/payments/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
