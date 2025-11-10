"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Building, CreditCard, LogOut, User, Menu, X, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface NavigationProps {
  userEmail?: string
  userName?: string
}

export function Navigation({ userEmail, userName }: NavigationProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setShowLogoutDialog(false)
    setIsSigningOut(true)
    
    try {
      console.log("[Navigation] Starting client-side sign out...")
      const supabase = createClient()
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("[Navigation] Sign out error:", error)
        toast({
          title: "Logout Failed",
          description: error.message || "Failed to sign out. Please try again.",
          variant: "destructive",
        })
        setIsSigningOut(false)
      } else {
        console.log("[Navigation] Sign out successful, redirecting...")
        // Successfully signed out, redirect to login with a full page reload
        window.location.href = "/auth/login"
      }
    } catch (error) {
      console.error("[Navigation] Logout error:", error)
      toast({
        title: "Logout Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setIsSigningOut(false)
    }
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

            {/* User Menu - Manual dropdown implementation for reliability */}
            <div className="relative">
              <Button 
                variant="outline" 
                className="h-11 px-4 gap-2 font-medium hover:bg-muted transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {userName || userEmail || "Admin"}
                </span>
              </Button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  
                  {/* Menu Content */}
                  <div className="absolute right-0 mt-2 w-56 bg-popover text-popover-foreground rounded-md border shadow-lg z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="px-3 py-3 border-b">
                      <p className="text-sm font-semibold">{userName || "Admin"}</p>
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          setShowLogoutDialog(true)
                        }}
                        disabled={isSigningOut}
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-sm transition-colors disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="font-medium">{isSigningOut ? "Signing out..." : "Sign Out"}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
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

      {/* Secure Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-destructive/10 rounded-xl">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-2xl">Confirm Logout</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Are you sure you want to sign out? This will end your current session securely.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel 
              className="h-11 font-medium"
              disabled={isSigningOut}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleSignOut()
              }}
              disabled={isSigningOut}
              className="h-11 font-semibold bg-destructive hover:bg-destructive/90"
            >
              {isSigningOut ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing Out...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  )
}
