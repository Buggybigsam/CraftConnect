"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateCustomerProfileAction(formData: {
  name: string
  phone?: string
  location?: string
}) {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  if (!formData.name?.trim()) {
    return { success: false, error: "Name is required" }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || null,
        location: formData.location?.trim() || null,
      },
    })

    revalidatePath("/customer/settings")
    revalidatePath("/customer/dashboard")
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Failed to update profile" }
  }
}
