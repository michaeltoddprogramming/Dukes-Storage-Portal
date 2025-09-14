"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface ChartData {
  name: string
  value: number
  color: string
}

export function UnitOccupancyChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        const { data: units } = await supabase.from("storage_units").select("status")

        const stats =
          units?.reduce((acc: Record<string, number>, unit) => {
            acc[unit.status] = (acc[unit.status] || 0) + 1
            return acc
          }, {}) || {}

        const data = [
          { name: "Available", value: stats.available || 0, color: "#22c55e" },
          { name: "Occupied", value: stats.occupied || 0, color: "#3b82f6" },
          { name: "Maintenance", value: stats.maintenance || 0, color: "#f59e0b" },
        ]

        setChartData(data)
      } catch (error) {
        console.error("Error fetching unit data:", error)
        setChartData([
          { name: "Available", value: 0, color: "#22c55e" },
          { name: "Occupied", value: 0, color: "#3b82f6" },
          { name: "Maintenance", value: 0, color: "#f59e0b" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unit Occupancy</CardTitle>
          <CardDescription>Current status of all storage units</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Occupancy</CardTitle>
        <CardDescription>Current status of all storage units</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
