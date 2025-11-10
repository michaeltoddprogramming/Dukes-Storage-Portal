import { Button } from "@/components/ui/button"
import { Plus, LayoutDashboard, CreditCard } from "lucide-react"
import Link from "next/link"

export function PaymentsHeader() {
  return (
    <div className="border-b bg-gradient-to-r from-card via-card/95 to-card shadow-sm sticky top-16 z-40 backdrop-blur-md">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Title Section - Following Gestalt Proximity */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Payments</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Track and manage rental payments</p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Following Fitts's Law with larger targets */}
          <div className="flex items-center gap-3">
            <Link href="/payments/new">
              <Button className="h-11 font-semibold shadow-md hover:shadow-lg transition-all">
                <Plus className="h-5 w-5 mr-2" />
                Record Payment
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="h-11 font-medium">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
