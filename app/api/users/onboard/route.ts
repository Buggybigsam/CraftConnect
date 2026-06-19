import { auth, currentUser, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await request.json()
  const { role, bio, category, pricePerHour, location, phone, yearsExp } = body

  try {
    if (role === "ARTISAN") {
      // Upsert user as ARTISAN
      await prisma.user.upsert({
        where: { id: userId },
        update: { role: "ARTISAN", phone, location },
        create: {
          id: userId,
          name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "Artisan",
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
          role: "ARTISAN",
          phone,
          location,
          imageUrl: clerkUser.imageUrl,
        },
      })

      // Create artisan profile
      await prisma.artisanProfile.upsert({
        where: { userId },
        update: { bio, category, pricePerHour, location, yearsExp, status: "PENDING" },
        create: { userId, bio, category, pricePerHour, location, yearsExp, status: "PENDING" },
      })

      // Update Clerk metadata
      const client = await clerkClient()
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { role: "ARTISAN" },
      })
    } else {
      // Default customer onboard
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "User",
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
          role: "CUSTOMER",
          imageUrl: clerkUser.imageUrl,
        },
      })

      const client = await clerkClient()
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { role: "CUSTOMER" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to onboard user" }, { status: 500 })
  }
}
