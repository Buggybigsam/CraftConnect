"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"

export default function PaymentToast() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const success = searchParams.get("success")
    const failed = searchParams.get("failed")

    if (success) {
      toast.success("Payment successful! Your booking is confirmed.", {
        id: "payment-toast",
      })
      // Clean up search query param from URL without reload
      router.replace("/customer/dashboard")
    } else if (failed) {
      toast.error("Payment failed. Please try again.", {
        id: "payment-toast",
      })
      router.replace("/customer/dashboard")
    }
  }, [searchParams, router])

  return null
}
