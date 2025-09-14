"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function markPaymentPaid(rentalId: string, monthDate: Date, monthlyRate: number) {
  const supabase = await createClient()

  const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`

  const { data: existingPayment } = await supabase
    .from("payments")
    .select("*")
    .eq("rental_id", rentalId)
    .like("payment_date", `${monthKey}%`)
    .eq("payment_type", "rent")
    .single()

  if (existingPayment) {
    const { data, error } = await supabase
      .from("payments")
      .update({
        amount: monthlyRate,
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "cash",
        notes: `Payment for ${monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })} - marked as paid`,
      })
      .eq("id", existingPayment.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating payment:", error)
      throw new Error("Failed to update payment")
    }

    revalidatePath("/payments")
    return data
  }

  const paymentDate = new Date()
  const { data, error } = await supabase
    .from("payments")
    .insert({
      rental_id: rentalId,
      amount: monthlyRate,
      payment_date: paymentDate.toISOString().split("T")[0],
      payment_type: "rent",
      payment_method: "cash",
      notes: `Payment for ${monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating payment:", error)
    throw new Error("Failed to record payment")
  }

  revalidatePath("/payments")
  return data
}

export async function markPaymentMissed(rentalId: string, monthDate: Date) {
  const supabase = await createClient()

  const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`

  const { data: existingPayment } = await supabase
    .from("payments")
    .select("*")
    .eq("rental_id", rentalId)
    .like("payment_date", `${monthKey}%`)
    .eq("payment_type", "rent")
    .single()

  if (existingPayment) {
    // Delete existing payment record to mark as missed
    const { error } = await supabase.from("payments").delete().eq("id", existingPayment.id)

    if (error) {
      console.error("Error deleting payment:", error)
      throw new Error("Failed to mark payment as missed")
    }

    revalidatePath("/payments")
    return { success: true }
  }

  // If no existing payment, nothing to do (already considered missed)
  revalidatePath("/payments")
  return { success: true }
}
