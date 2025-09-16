"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function terminateRental(rentalId: string) {
  const supabase = await createClient()
  
  try {
    if (!rentalId) {
      throw new Error("Rental ID is required")
    }

    // Get rental details first to find the unit
    const { data: rental, error: rentalFetchError } = await supabase
      .from("rentals")
      .select("unit_id, customer_id, storage_units(unit_number), customers(first_name, last_name)")
      .eq("id", rentalId)
      .single()
    
    if (rentalFetchError) {
      throw new Error(`Failed to fetch rental: ${rentalFetchError.message}`)
    }
    
    if (!rental) {
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
      
    if (updateError) {
      throw new Error(`Failed to terminate rental: ${updateError.message}`)
    }
    
    // Check if there are other active rentals for this unit
    const { data: otherRentals, error: otherRentalsError } = await supabase
      .from("rentals")
      .select("id")
      .eq("unit_id", rental.unit_id)
      .eq("status", "active")
      .neq("id", rentalId)
    
    if (otherRentalsError) {
      console.warn("Warning: Could not check for other rentals:", otherRentalsError.message)
    }
    
    // Only update unit status if no other active rentals exist
    if (!otherRentals?.length) {
      const { error: unitUpdateError } = await supabase
        .from("storage_units")
        .update({ status: "available" })
        .eq("id", rental.unit_id)
      
      if (unitUpdateError) {
        throw new Error(`Failed to update unit status: ${unitUpdateError.message}`)
      }
    }
    
    revalidatePath("/customers")
    revalidatePath("/units")
    
    return { 
      success: true, 
      message: `Successfully terminated rental for ${rental.customers?.first_name} ${rental.customers?.last_name}` 
    }
  } catch (error) {
    console.error("Error terminating rental:", error)
    return { 
      success: false, 
      error: {
        message: error.message || "Failed to terminate rental",
        code: error.code || "UNKNOWN_ERROR"
      }
    }
  }
}

export async function deleteCustomer(customerId: string) {
  const supabase = await createClient()
  
  try {
    if (!customerId) {
      throw new Error("Customer ID is required")
    }

    // Get customer details first
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("first_name, last_name")
      .eq("id", customerId)
      .single()
    
    if (customerError) {
      throw new Error(`Failed to fetch customer: ${customerError.message}`)
    }
    
    if (!customer) {
      throw new Error("Customer not found")
    }

    // First terminate all active rentals for this customer
    const { data: activeRentals, error: rentalsError } = await supabase
      .from("rentals")
      .select("id, unit_id")
      .eq("customer_id", customerId)
      .eq("status", "active")
    
    if (rentalsError) {
      throw new Error(`Failed to fetch customer rentals: ${rentalsError.message}`)
    }
    
    // Update all related units to available and terminate rentals
    for (const rental of activeRentals || []) {
      const { error: unitError } = await supabase
        .from("storage_units")
        .update({ status: "available" })
        .eq("id", rental.unit_id)
      
      if (unitError) {
        console.warn(`Warning: Failed to update unit ${rental.unit_id}:`, unitError.message)
      }
      
      const { error: rentalError } = await supabase
        .from("rentals")
        .update({ 
          status: "terminated", 
          end_date: new Date().toISOString().split("T")[0] 
        })
        .eq("id", rental.id)
      
      if (rentalError) {
        console.warn(`Warning: Failed to terminate rental ${rental.id}:`, rentalError.message)
      }
    }
    
    // Then delete the customer
    const { error: deleteError } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId)
    
    if (deleteError) {
      throw new Error(`Failed to delete customer: ${deleteError.message}`)
    }
    
    revalidatePath("/customers")
    revalidatePath("/units")
    
    return { 
      success: true, 
      message: `Successfully deleted ${customer.first_name} ${customer.last_name} and terminated ${activeRentals?.length || 0} active rentals`
    }
  } catch (error) {
    console.error("Error deleting customer:", error)
    return { 
      success: false, 
      error: {
        message: error.message || "Failed to delete customer",
        code: error.code || "UNKNOWN_ERROR"
      }
    }
  }
}

export async function deleteUnit(unitId: string) {
  const supabase = await createClient()
  
  try {
    if (!unitId) {
      throw new Error("Unit ID is required")
    }

    // Get unit details first
    const { data: unit, error: unitError } = await supabase
      .from("storage_units")
      .select("unit_number")
      .eq("id", unitId)
      .single()
    
    if (unitError) {
      throw new Error(`Failed to fetch unit: ${unitError.message}`)
    }
    
    if (!unit) {
      throw new Error("Unit not found")
    }

    // First terminate all active rentals for this unit
    const { data: activeRentals, error: rentalsError } = await supabase
      .from("rentals")
      .select("id")
      .eq("unit_id", unitId)
      .eq("status", "active")
    
    if (rentalsError) {
      throw new Error(`Failed to fetch unit rentals: ${rentalsError.message}`)
    }
    
    // Update all active rentals to terminated
    for (const rental of activeRentals || []) {
      const { error: rentalError } = await supabase
        .from("rentals")
        .update({ 
          status: "terminated", 
          end_date: new Date().toISOString().split("T")[0] 
        })
        .eq("id", rental.id)
      
      if (rentalError) {
        console.warn(`Warning: Failed to terminate rental ${rental.id}:`, rentalError.message)
      }
    }
    
    // Then delete the unit
    const { error: deleteError } = await supabase
      .from("storage_units")
      .delete()
      .eq("id", unitId)
    
    if (deleteError) {
      throw new Error(`Failed to delete unit: ${deleteError.message}`)
    }
    
    revalidatePath("/units")
    
    return { 
      success: true, 
      message: `Successfully deleted unit ${unit.unit_number} and terminated ${activeRentals?.length || 0} active rentals`
    }
  } catch (error) {
    console.error("Error deleting unit:", error)
    return { 
      success: false, 
      error: {
        message: error.message || "Failed to delete unit",
        code: error.code || "UNKNOWN_ERROR"
      }
    }
  }
}