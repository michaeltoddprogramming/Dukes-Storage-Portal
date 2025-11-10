"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Securely signs out the current user
 * - Clears server-side session
 * - Invalidates all auth tokens
 * - Clears cookies
 * - Revalidates all cached paths
 * 
 * Returns success status so client can handle redirect
 */
export async function signOut() {
  console.log("[Auth Action] signOut called")
  
  try {
    const supabase = await createClient()
    console.log("[Auth Action] Supabase client created")
    
    // Sign out from Supabase - this invalidates the session
    const { error } = await supabase.auth.signOut()
    console.log("[Auth Action] Supabase signOut result:", { error })
    
    if (error) {
      console.error("[Auth Action] Error signing out:", error)
      return { success: false, error: error.message }
    }
    
    // Revalidate all paths to clear any cached authenticated content
    revalidatePath("/", "layout")
    console.log("[Auth Action] Sign out successful")
    
    return { success: true }
    
  } catch (error) {
    console.error("[Auth Action] Sign out exception:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to sign out. Please try again." 
    }
  }
}
