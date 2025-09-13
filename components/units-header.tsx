import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export function UnitsHeader() {
  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Storage Units</h1>
            <p className="text-muted-foreground">Manage your storage facility units</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/units/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Unit
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
