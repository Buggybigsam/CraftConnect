import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resend, FROM_EMAIL } from "@/lib/resend"

export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { id: userId } })
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { artisanProfileId, status } = await request.json()

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  let updatedProfile
  try {
    updatedProfile = await prisma.artisanProfile.update({
      where: { id: artisanProfileId },
      data: { status },
      include: { user: { select: { email: true, name: true } } },
    })
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "P2025") {
      return NextResponse.json({ error: "Artisan profile not found" }, { status: 404 })
    }
    throw err
  }

  const artisanEmail = updatedProfile.user.email
  const artisanName = updatedProfile.user.name

  const message =
    status === "APPROVED"
      ? `<p>Hi ${artisanName}, your SmartBooking artisan profile has been <strong>approved</strong>! You can now log in and start receiving bookings.</p>`
      : `<p>Hi ${artisanName}, unfortunately your SmartBooking artisan application was <strong>not approved</strong> at this time. Please contact support for more information.</p>`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: artisanEmail,
    subject: status === "APPROVED" ? "Your Profile is Approved - SmartBooking" : "Application Update - SmartBooking",
    html: message,
  }).catch(console.error)

  return NextResponse.json({ success: true })
}
