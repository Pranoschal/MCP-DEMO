// components/CustomLabel.tsx
"use client"

import { Label } from "@/components/ui/label"

interface CustomLabelProps {
  value: string
  htmlFor?: string
}

export default function CustomLabel({ value, htmlFor }: CustomLabelProps) {
  return (
    <Label htmlFor={htmlFor} >
      {value}
    </Label>
  )
}
