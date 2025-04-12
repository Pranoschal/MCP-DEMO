"use client"

import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

// interface OrderConfirmationProps {
//   orderId: string
// }

export default function OrderConfirmation() {
  const router = useRouter()

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Confirmed!</h2>
      <p className="text-gray-600 mb-2">Thank you for your purchase</p>
      {/* <p className="text-gray-500 mb-6">Order ID: {orderId}</p> */}

      {/* <Button onClick={() => router.push("/")} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
        Continue Shopping
      </Button> */}
    </div>
  )
}

