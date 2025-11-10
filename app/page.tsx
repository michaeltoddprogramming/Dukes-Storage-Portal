"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentActivity } from "@/components/recent-activity"
import { UnitOccupancyChart } from "@/components/unit-occupancy-chart"
import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
// import { Skeleton } from "@/components/ui/skeleton"
import { Skeleton } from "../components/ui/skeleton"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push("/auth/login")
          return
        }

        // Check if user is an admin
        const { data: adminUser, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", user.id)
          .single()

        if (adminError || !adminUser) {
          router.push("/auth/login")
          return
        }

        setUser(user)
        setAdminUser(adminUser)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-4">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <div className="grid gap-8">
            {/* Loading skeleton for dashboard stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading skeleton for charts */}
            <div className="grid gap-8 lg:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user || !adminUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation userEmail={user.email} userName={adminUser.full_name} />

      {/* Header Section - Following Fitts's Law with prominent, easy-to-target area */}
      <div className="border-b bg-gradient-to-r from-card to-card/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Dashboard
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Welcome back, <span className="font-semibold text-foreground">{adminUser.full_name}</span>
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg border">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Following Miller's Law: chunking information into digestible groups */}
      <div className="container mx-auto px-6 sm:px-8 py-8 sm:py-12">
        <div className="space-y-10 sm:space-y-12">
          {/* Stats Section - Gestalt Principle: Grouped related items */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                Key Metrics
              </h2>
              <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                Live Data
              </div>
            </div>
            <DashboardStats />
          </section>

          {/* Charts and Activity Section - Visual Hierarchy */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              Insights & Activity
            </h2>
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
              <UnitOccupancyChart />
              <RecentActivity />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
