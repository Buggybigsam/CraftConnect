"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateArtisanProfileAction(formData: {
  category: string
  pricePerHour: number
  location: string
  yearsExp: number
  bio: string
}) {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  if (!formData.category?.trim() || !formData.bio?.trim() || !formData.location?.trim()) {
    return { success: false, error: "Please fill in all required fields" }
  }

  if (formData.pricePerHour <= 0 || formData.yearsExp < 0) {
    return { success: false, error: "Please enter valid numeric values" }
  }

  try {
    const profile = await prisma.artisanProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return { success: false, error: "Artisan profile not found" }
    }

    await prisma.artisanProfile.update({
      where: { id: profile.id },
      data: {
        category: formData.category.trim(),
        pricePerHour: Number(formData.pricePerHour),
        location: formData.location.trim(),
        yearsExp: Number(formData.yearsExp),
        bio: formData.bio.trim(),
      },
    })

    revalidatePath("/artisan/profile")
    revalidatePath("/artisan/dashboard")
    revalidatePath(`/customer/artisan/${profile.id}`)
    revalidatePath("/customer/browse")
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Failed to update profile" }
  }
}
