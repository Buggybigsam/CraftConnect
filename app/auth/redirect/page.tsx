import { currentUser, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function AuthRedirectPage() {
  const clerkUser = await currentUser()
  if (!clerkUser) redirect("/sign-in")

  // Upsert user in DB
  const user = await prisma.user.upsert({
    where:  { id: clerkUser.id },
    update: {},
    create: {
      id:       clerkUser.id,
      name:     `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "User",
      email:    clerkUser.emailAddresses[0]?.emailAddress ?? "",
      role:     "CUSTOMER",
      imageUrl: clerkUser.imageUrl,
    },
  })

  // Sync role into Clerk publicMetadata so middleware can read it
  const clerk = await clerkClient()
  await clerk.users.updateUserMetadata(clerkUser.id, {
    publicMetadata: { role: user.role },
  })

  if (user.role === "ADMIN")   redirect("/admin/dashboard")
  if (user.role === "ARTISAN") redirect("/artisan/dashboard")
  redirect("/customer/browse")
}
