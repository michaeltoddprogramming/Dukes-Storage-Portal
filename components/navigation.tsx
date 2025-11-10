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
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6 sm:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-10">
            {/* Logo - Prominent and easily clickable (Fitts's Law) */}
            <Link 
              href="/" 
              className="text-xl sm:text-2xl font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2 group"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline">Duke's Storage</span>
            </Link>
            
            {/* Desktop Navigation - Larger touch targets (minimum 44x44px) */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/units"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
              >
                <Building className="h-5 w-5" />
                <span>Units & Customers</span>
              </Link>
              <Link
                href="/payments"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
              >
                <CreditCard className="h-5 w-5" />
                <span>Payments</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Menu Button - Larger touch target */}
            <Button
              variant="ghost"
              size="lg"
              className="md:hidden h-11 w-11 p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* User Menu - Larger, more prominent */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-11 px-4 gap-2 font-medium hover:bg-muted transition-colors"
                >
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline truncate max-w-[120px]">
                    {userName || userEmail || "Admin"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  disabled={isLoading}
                  className="cursor-pointer py-3"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span className="font-medium">{isLoading ? "Signing out..." : "Sign Out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation Menu - Following Miller's Law: limited items */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border space-y-2 animate-in slide-in-from-top-2">
            <Link
              href="/units"
              className="flex items-center gap-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors py-4 px-4 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-lg">
                <Building className="h-5 w-5" />
              </div>
              <span>Units & Customers</span>
            </Link>
            <Link
              href="/payments"
              className="flex items-center gap-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors py-4 px-4 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-lg">
                <CreditCard className="h-5 w-5" />
              </div>
              <span>Payments</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
