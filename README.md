# smartbooking

A marketplace for finding and booking trusted local artisans in Ghana and Nigeria.

## Tech Stack

- **Framework**: Next.js 16 (App Router, MPA)
- **Auth**: Clerk v7
- **Database**: PostgreSQL on Neon via Prisma 7
- **Payments**: Paystack
- **Email**: Resend
- **UI**: Tailwind CSS + shadcn/ui + Lucide icons

## Features

- Customer: browse artisans, book services, pay online, leave reviews
- Artisan: apply → admin approval → manage bookings + earnings
- Admin: approve/reject artisans, monitor platform stats

## Getting Started

1. Copy `.env.local` template and fill in your keys
2. `npm install`
3. `npx prisma migrate dev`
4. `npm run dev`
