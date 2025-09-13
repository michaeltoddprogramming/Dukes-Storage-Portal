"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

interface Facility {
  id: string
  name: string
}

interface UnitFormProps {
  facilities: Facility[]
  unit?: any
}

export function UnitForm({ facilities, unit }: UnitFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    facility_id: unit?.facility_id || "",
    unit_number: unit?.unit_number || "",
    size_category: unit?.size_category || "",
    dimensions: unit?.dimensions || "",
    monthly_rate: unit?.monthly_rate || "",
    status: unit?.status || "available",
    has_electricity: unit?.has_electricity || false,
    description: unit?.description || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const unitData = {
        ...formData,
        monthly_rate: Number.parseFloat(formData.monthly_rate),
      }

      let result
      if (unit) {
        result = await supabase.from("storage_units").update(unitData).eq("id", unit.id)
      } else {
        result = await supabase.from("storage_units").insert([unitData])
      }

      if (result.error) throw result.error

      toast({
        title: "Success",
        description: `Storage unit ${unit ? "updated" : "created"} successfully`,
      })

      router.push("/units")
    } catch (error) {
      console.error("Error saving unit:", error)
      toast({
        title: "Error",
        description: "Failed to save storage unit",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{unit ? "Edit" : "Add New"} Storage Unit</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facility">Facility</Label>
              <Select
                value={formData.facility_id}
                onValueChange={(value) => setFormData({ ...formData, facility_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_number">Unit Number</Label>
              <Input
                id="unit_number"
                value={formData.unit_number}
                onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                placeholder="e.g., DUKE 1"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="size_category">Size Category</Label>
              <Select
                value={formData.size_category}
                onValueChange={(value) => setFormData({ ...formData, size_category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra_large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 10x10"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monthly_rate">Monthly Rate (R)</Label>
              <Input
                id="monthly_rate"
                type="number"
                step="0.01"
                value={formData.monthly_rate}
                onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value })}
                placeholder="150.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="electricity"
                checked={formData.has_electricity}
                onCheckedChange={(checked) => setFormData({ ...formData, has_electricity: checked as boolean })}
              />
              <Label htmlFor="electricity">Electricity</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this unit..."
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : unit ? "Update Unit" : "Create Unit"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/units")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
