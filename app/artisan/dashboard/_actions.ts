"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleAvailabilityAction(isAvailable: boolean) {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId },
  })

  if (!artisan) {
    return { success: false, error: "Artisan profile not found" }
  }

  await prisma.artisanProfile.update({
    where: { id: artisan.id },
    data: { isAvailable },
  })

  revalidatePath("/artisan/dashboard")
  revalidatePath(`/customer/artisan/${artisan.id}`)
  revalidatePath("/customer/browse")
  return { success: true, isAvailable }
}
