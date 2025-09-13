import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export async function PaymentsSummary() {
  const supabase = await createClient()

  // Get current month payments
  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: currentMonthPayments } = await supabase
    .from("payments")
    .select("amount, payment_type")
    .gte("payment_date", `${currentMonth}-01`)
    .lt("payment_date", `${currentMonth}-32`)

  // Get last month payments for comparison
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const lastMonthStr = lastMonth.toISOString().slice(0, 7)
  const { data: lastMonthPayments } = await supabase
    .from("payments")
    .select("amount")
    .gte("payment_date", `${lastMonthStr}-01`)
    .lt("payment_date", `${lastMonthStr}-32`)

  // Get today's payments
  const today = new Date().toISOString().slice(0, 10)
  const { data: todayPayments } = await supabase.from("payments").select("amount").eq("payment_date", today)

  // Calculate totals
  const currentMonthTotal = currentMonthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const lastMonthTotal = lastMonthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
  const todayTotal = todayPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // Calculate rent vs other payments
  const rentPayments = currentMonthPayments?.filter((p) => p.payment_type === "rent") || []
  const rentTotal = rentPayments.reduce((sum, p) => sum + Number(p.amount), 0)

  // Calculate growth
  const growth = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0

  const stats = [
    {
      title: "This Month",
      value: formatCurrency(currentMonthTotal),
      icon: DollarSign,
      description: `${currentMonthPayments?.length || 0} payments`,
      trend: growth > 0 ? "up" : growth < 0 ? "down" : "neutral",
    },
    {
      title: "Monthly Growth",
      value: `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`,
      icon: TrendingUp,
      description: "vs last month",
      trend: growth > 0 ? "up" : growth < 0 ? "down" : "neutral",
    },
    {
      title: "Today",
      value: formatCurrency(todayTotal),
      icon: Calendar,
      description: `${todayPayments?.length || 0} payments`,
      trend: "neutral",
    },
    {
      title: "Rent Payments",
      value: formatCurrency(rentTotal),
      icon: CreditCard,
      description: `${rentPayments.length} rent payments`,
      trend: "neutral",
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <div
                className={`absolute bottom-0 left-0 h-1 w-full ${
                  stat.trend === "up" ? "bg-green-500" : stat.trend === "down" ? "bg-red-500" : "bg-gray-300"
                }`}
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
