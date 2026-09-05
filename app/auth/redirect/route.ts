import { auth, currentUser, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ROLE_COOKIE } from "@/lib/role-cookie"

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  const clerkUser = await currentUser()
  if (!clerkUser) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  const intendedRole = new URL(request.url).searchParams.get("role") === "artisan" ? "ARTISAN" : "CUSTOMER"
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ""

  // 1. Try finding user by Clerk ID
  let user = await prisma.user.findUnique({
    where: { id: clerkUser.id },
  })

  // 2. If not found by ID, check if user exists by email (e.g. seeded or created earlier)
  if (!user && email) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    })
    if (existingByEmail) {
      user = await prisma.user.update({
        where: { email },
        data: { id: clerkUser.id },
      })
    }
  }

  // 3. If still not found, create new user
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: clerkUser.id,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "User",
        email: email || `${clerkUser.id}@craftconnect.local`,
        role: intendedRole,
        imageUrl: clerkUser.imageUrl,
      },
    })
  }

  if (user.role === "CUSTOMER") {
    const artisanProfile = await prisma.artisanProfile.findUnique({
      where: { userId: clerkUser.id },
      select: { id: true },
    })

    if (artisanProfile) {
      user = await prisma.user.update({
        where: { id: clerkUser.id },
        data: { role: "ARTISAN" },
      })
    }
  }

  const existingClerkRole = (clerkUser.publicMetadata as { role?: string } | undefined)?.role
  if (existingClerkRole !== user.role) {
    try {
      const clerk = await clerkClient()
      await clerk.users.updateUserMetadata(clerkUser.id, {
        publicMetadata: { role: user.role },
      })
    } catch (err) {
      console.error("Clerk metadata sync failed", err)
    }
  }

  const destination =
    user.role === "ADMIN" ? "/admin/dashboard" : user.role === "ARTISAN" ? "/artisan/dashboard" : "/customer/dashboard"

  const response = NextResponse.redirect(new URL(destination, request.url))
  response.cookies.set(ROLE_COOKIE, user.role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
