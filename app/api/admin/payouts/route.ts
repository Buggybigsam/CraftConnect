import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, writeAuditLog } from "@/lib/admin"

export async function GET() {
  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const [payments, payouts] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "SUCCESS" },
      include: {
        booking: {
          include: {
            artisan: { include: { user: { select: { name: true, email: true } } } },
          },
        },
      },
    }),
    prisma.artisanPayout.findMany(),
  ])

  const byArtisan = new Map<
    string,
    { artisanId: string; name: string; email: string; gross: number; commission: number; paid: number }
  >()

  for (const payment of payments) {
    const artisan = payment.booking.artisan
    const row = byArtisan.get(artisan.id) ?? {
      artisanId: artisan.id,
      name: artisan.user.name,
      email: artisan.user.email,
      gross: 0,
      commission: 0,
      paid: 0,
    }
    row.gross += payment.amount
    row.commission += payment.commissionAmount
    byArtisan.set(artisan.id, row)
  }

  for (const payout of payouts) {
    const row = byArtisan.get(payout.artisanId)
    if (!row) continue
    row.paid += payout.amount
  }

  const rows = [...byArtisan.values()].map((row) => ({
    ...row,
    net: row.gross - row.commission,
    owed: row.gross - row.commission - row.paid,
  }))

  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const authz = await requireAdmin()
  if (authz.error) return authz.error

  const { artisanId, amount } = await request.json()
  const payoutAmount = Number(amount)
  if (!artisanId || !Number.isFinite(payoutAmount) || payoutAmount <= 0) {
    return NextResponse.json({ error: "artisanId and a positive amount are required" }, { status: 400 })
  }

  const artisan = await prisma.artisanProfile.findUnique({ where: { id: artisanId } })
  if (!artisan) return NextResponse.json({ error: "Artisan not found" }, { status: 404 })

  const payout = await prisma.artisanPayout.create({
    data: {
      artisanId,
      amount: payoutAmount,
      status: "PAID",
      paidAt: new Date(),
    },
  })

  await writeAuditLog(authz.admin.id, "PAYOUT_MARK_PAID", "ArtisanProfile", artisanId, {
    amount: payoutAmount,
    payoutId: payout.id,
  })

  return NextResponse.json(payout)
}
