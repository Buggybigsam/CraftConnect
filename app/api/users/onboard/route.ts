import { auth, currentUser, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAdminAlert } from "@/lib/admin"

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await request.json()
  const { role, bio, category, pricePerHour, location, phone, yearsExp } = body

  const displayName =
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
    (role === "ARTISAN" ? "Artisan" : "User")
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ""

  try {
    if (role === "ARTISAN") {
      await prisma.user.upsert({
        where: { id: userId },
        update: { role: "ARTISAN", phone, location },
        create: {
          id: userId,
          name: displayName,
          email,
          role: "ARTISAN",
          phone,
          location,
          imageUrl: clerkUser.imageUrl,
        },
      })

      await prisma.artisanProfile.upsert({
        where: { userId },
        update: { bio, category, pricePerHour, location, yearsExp, status: "PENDING" },
        create: { userId, bio, category, pricePerHour, location, yearsExp, status: "PENDING" },
      })

      await createAdminAlert({
        type: "PENDING_ARTISAN",
        title: "New artisan application",
        message: `${displayName} submitted an artisan application.`,
        link: "/admin/artisans",
      })
    } else {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: displayName,
          email,
          role: "CUSTOMER",
          imageUrl: clerkUser.imageUrl,
        },
      })
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!dbUser) {
      return NextResponse.json({ error: "User not found after onboard" }, { status: 500 })
    }

    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: dbUser.role },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to onboard user" }, { status: 500 })
  }
}
