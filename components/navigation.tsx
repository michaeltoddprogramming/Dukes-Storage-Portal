"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Building, Users, CreditCard, LogOut, User, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface NavigationProps {
  userEmail?: string
  userName?: string
}

export function Navigation({ userEmail, userName }: NavigationProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    setIsLoading(false)
  }

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="text-lg sm:text-xl font-bold text-foreground truncate">
              Duke's Storage Portal
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/units"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Building className="h-4 w-4" />
                Units & Customers
              </Link>
              <Link
                href="/payments"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                Payments
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="max-w-[120px] sm:max-w-none">
                  <User className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="truncate">{userName || userEmail || "Admin"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoading ? "Signing out..." : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border space-y-1">
            <Link
              href="/units"
              className="flex items-center gap-3 text-base text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-md hover:bg-muted"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Building className="h-5 w-5" />
              Units
            </Link>
            <Link
              href="/payments"
              className="flex items-center gap-3 text-base text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-md hover:bg-muted"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CreditCard className="h-5 w-5" />
              Payments
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
