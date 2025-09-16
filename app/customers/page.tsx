import { redirect } from "next/navigation"

export default function CustomersPage() {
  redirect("/units")
  return null
}