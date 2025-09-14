"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function markPaymentPaid(rentalId: string, monthDate: Date, monthlyRate: number) {
  const supabase = await createClient()

  // Create payment record
  const paymentDate = new Date()
  const { data, error } = await supabase
    .from("payments")
    .insert({
      rental_id: rentalId,
      amount: monthlyRate,
      payment_date: paymentDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
      payment_type: "rent",
      payment_method: "cash", // Default to cash, could be made configurable
      notes: `Payment for ${monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating payment:", error)
    throw new Error("Failed to record payment")
  }

  // Revalidate the payments page to show updated data
  revalidatePath("/payments")

  return data
}
