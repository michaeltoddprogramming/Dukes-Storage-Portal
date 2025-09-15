"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function terminateRental(rentalId: string) {
  const supabase = await createClient()
  
  try {
    // Get rental details first to find the unit
    const { data: rental, error: rentalFetchError } = await supabase
      .from("rentals")
      .select("unit_id, customer_id")
      .eq("id", rentalId)
      .single()
    
    if (rentalFetchError || !rental) {
      throw new Error("Rental not found")
    }
    
    // Update rental status to terminated
    const { error: updateError } = await supabase
      .from("rentals")
      .update({
        status: "terminated",
        end_date: new Date().toISOString().split("T")[0]
      })
      .eq("id", rentalId)
      
    if (updateError) throw updateError
    
    // Check if there are other active rentals for this unit
    const { data: otherRentals } = await supabase
      .from("rentals")
      .select("id")
      .eq("unit_id", rental.unit_id)
      .eq("status", "active")
      .neq("id", rentalId)
    
    // Only update unit status if no other active rentals exist
    if (!otherRentals?.length) {
      const { error: unitUpdateError } = await supabase
        .from("storage_units")
        .update({ status: "available" })
        .eq("id", rental.unit_id)
      
      if (unitUpdateError) throw unitUpdateError
    }
    
    revalidatePath("/customers")
    revalidatePath("/units")
    
    return { success: true }
  } catch (error) {
    console.error("Error terminating rental:", error)
    return { success: false, error }
  }
}

export async function deleteCustomer(customerId: string) {
  const supabase = await createClient()
  
  try {
    // First terminate all active rentals for this customer
    const { data: activeRentals, error: rentalsError } = await supabase
      .from("rentals")
      .select("id, unit_id")
      .eq("customer_id", customerId)
      .eq("status", "active")
    
    if (rentalsError) throw rentalsError
    
    // Update all related units to available
    for (const rental of activeRentals || []) {
      await supabase
        .from("storage_units")
        .update({ status: "available" })
        .eq("id", rental.unit_id)
      
      await supabase
        .from("rentals")
        .update({ 
          status: "terminated", 
          end_date: new Date().toISOString().split("T")[0] 
        })
        .eq("id", rental.id)
    }
    
    // Then delete the customer
    const { error: deleteError } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId)
    
    if (deleteError) throw deleteError
    
    revalidatePath("/customers")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting customer:", error)
    return { success: false, error }
  }
}

export async function deleteUnit(unitId: string) {
  const supabase = await createClient()
  
  try {
    // First terminate all active rentals for this unit
    const { data: activeRentals, error: rentalsError } = await supabase
      .from("rentals")
      .select("id")
      .eq("unit_id", unitId)
      .eq("status", "active")
    
    if (rentalsError) throw rentalsError
    
    // Update all active rentals to terminated
    for (const rental of activeRentals || []) {
      await supabase
        .from("rentals")
        .update({ 
          status: "terminated", 
          end_date: new Date().toISOString().split("T")[0] 
        })
        .eq("id", rental.id)
    }
    
    // Then delete the unit
    const { error: deleteError } = await supabase
      .from("storage_units")
      .delete()
      .eq("id", unitId)
    
    if (deleteError) throw deleteError
    
    revalidatePath("/units")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting unit:", error)
    return { success: false, error }
  }
}