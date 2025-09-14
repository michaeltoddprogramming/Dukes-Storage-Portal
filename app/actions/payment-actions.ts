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
    // Update existing payment to completed
    const { data, error } = await supabase
      .from("payments")
      .update({
        status: "completed",
        amount: monthlyRate,
        payment_date: new Date().toISOString().split("T")[0],
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

  // Create new payment record
  const paymentDate = new Date()
  const { data, error } = await supabase
    .from("payments")
    .insert({
      rental_id: rentalId,
      amount: monthlyRate,
      payment_date: paymentDate.toISOString().split("T")[0],
      payment_type: "rent",
      payment_method: "cash",
      status: "completed",
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
    // Update existing payment to missed
    const { data, error } = await supabase
      .from("payments")
      .update({
        status: "missed",
        notes: `Payment for ${monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })} - marked as missed`,
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

  // Create new missed payment record
  const { data, error } = await supabase
    .from("payments")
    .insert({
      rental_id: rentalId,
      amount: 0, // No amount for missed payments
      payment_date: monthDate.toISOString().split("T")[0],
      payment_type: "rent",
      status: "missed",
      notes: `Payment for ${monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })} - marked as missed`,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating missed payment record:", error)
    throw new Error("Failed to record missed payment")
  }

  revalidatePath("/payments")
  return data
}
