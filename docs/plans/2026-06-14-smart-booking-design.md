# Smart Booking System: Design Document
**Date:** 2026-06-14  
**Status:** Approved

---

## Overview
A digital marketplace connecting customers with local artisans (electricians, plumbers, cleaners, tutors, mechanics, etc.) in Ghana/Nigeria. Customers browse, book, and pay for services. Artisans manage bookings and earnings. Admins oversee the platform.

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | MPA: no SPA client-side routing |
| Auth | Clerk | Roles via `publicMetadata` |
| Payments | Paystack | GHS / NGN, sandbox mode |
| Database | PostgreSQL + Prisma ORM | Hosted on Neon (free tier) |
| Styling | Tailwind CSS + shadcn/ui | |
| Email | Resend | Booking confirmations, artisan alerts |
| Hosting | Vercel | Free tier, one-click deploy |

---

## Roles

### Customer
- Register / login
- Browse and search artisans
- Book a service
- Pay via Paystack
- Leave reviews and ratings
- View booking history

### Artisan
- Apply via a separate application form (longer, requires bio, category, pricing, experience)
- Account starts as `PENDING` until admin approves
- Once approved: manage profile, accept/reject bookings, view earnings

### Admin
- Review and approve/reject artisan applications
- Manage all users and bookings
- Monitor transactions
- Flag or remove accounts

---

## Registration Flow

**Customer:**
Landing page → "Sign Up as Customer" → Clerk signup → `/customer/browse`

**Artisan:**
Landing page → "Join as Artisan" → Clerk signup → Artisan application form (category, bio, pricing, location, phone, years of experience) → Status: `PENDING` → Admin approves → Email sent → `/artisan/dashboard` unlocked

**Note:** Artisans with `isVerified: false` do NOT appear in the customer browse page.

---

## Pages

### Public (no login)
| Route | Page |
|---|---|
| `/` | Landing page: hero, category grid, how it works, featured artisans, CTA |

### Customer (role=customer)
| Route | Page |
|---|---|
| `/customer/browse` | Home after login: artisan grid + search/filters |
| `/customer/artisan/[id]` | Artisan profile: bio, services, availability, reviews, Book Now |
| `/customer/booking` | Book a service: pick date/time |
| `/customer/payment` | Paystack checkout |
| `/customer/dashboard` | My bookings, history, pending payments, reviews left |

### Artisan (role=artisan)
| Route | Page |
|---|---|
| `/artisan/dashboard` | Incoming bookings: accept/reject |
| `/artisan/profile` | Edit services, pricing, availability |
| `/artisan/earnings` | Payment history |

### Admin (role=admin)
| Route | Page |
|---|---|
| `/admin/dashboard` | Platform overview stats |
| `/admin/users` | Manage all users + artisan applications |
| `/admin/bookings` | All bookings |

---

## Search & Filter (Browse Page)
- Name / keyword
- Location / City
- Category (plumbing, electrical, cleaning, etc.)
- Price range
- Minimum rating
- Verified only toggle
- Available today toggle

---

## Database Models (Prisma)

```prisma
model User {
  id        String   @id  // Clerk user ID
  name      String
  email     String   @unique
  role      Role
  phone     String?
  location  String?
  createdAt DateTime @default(now())
  artisanProfile ArtisanProfile?
  bookingsAsCustomer Booking[] @relation("CustomerBookings")
  reviews   Review[]
}

enum Role {
  CUSTOMER
  ARTISAN
  ADMIN
}

model ArtisanProfile {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])
  bio          String
  category     String
  pricePerHour Float
  isVerified   Boolean  @default(false)
  rating       Float    @default(0)
  yearsExp     Int
  services     Service[]
  bookings     Booking[] @relation("ArtisanBookings")
  reviews      Review[]
}

model Service {
  id          String         @id @default(cuid())
  artisanId   String
  artisan     ArtisanProfile @relation(fields: [artisanId], references: [id])
  title       String
  description String
  price       Float
  category    String
  bookings    Booking[]
}

model Booking {
  id         String         @id @default(cuid())
  customerId String
  customer   User           @relation("CustomerBookings", fields: [customerId], references: [id])
  artisanId  String
  artisan    ArtisanProfile @relation("ArtisanBookings", fields: [artisanId], references: [id])
  serviceId  String
  service    Service        @relation(fields: [serviceId], references: [id])
  date       DateTime
  status     BookingStatus  @default(PENDING)
  payment    Payment?
  review     Review?
  createdAt  DateTime       @default(now())
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

model Payment {
  id        String        @id @default(cuid())
  bookingId String        @unique
  booking   Booking       @relation(fields: [bookingId], references: [id])
  amount    Float
  currency  String        // GHS or NGN
  reference String        @unique  // Paystack reference
  status    PaymentStatus @default(PENDING)
  createdAt DateTime      @default(now())
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
}

model Review {
  id         String         @id @default(cuid())
  customerId String
  customer   User           @relation(fields: [customerId], references: [id])
  artisanId  String
  artisan    ArtisanProfile @relation(fields: [artisanId], references: [id])
  bookingId  String         @unique
  booking    Booking        @relation(fields: [bookingId], references: [id])
  rating     Int            // 1-5
  comment    String
  createdAt  DateTime       @default(now())
}
```

---

## Key User Flows

### Customer Books a Service
Landing page → Sign up → Browse artisans → View profile → Pick date/time → Pay via Paystack → Booking confirmed (email) → Leave review

### Artisan Handles a Booking
Get email alert → Accept / Reject → Complete service → Mark done → Earnings updated

### Admin Manages Platform
View dashboard → Approve artisan applications → Monitor bookings → Flag/remove accounts

---

## 2-Week Build Plan

| Days | Work |
|---|---|
| 1–2 | Project setup: Next.js + Clerk + Prisma + Neon DB |
| 3–4 | Auth + role routing + middleware + sign-up flows |
| 5–6 | Landing page + artisan application form |
| 7–8 | Browse page + search/filter API |
| 9–10 | Booking system + Paystack integration + webhook |
| 11–12 | Reviews + Admin dashboard + artisan approval |
| 13–14 | Email notifications (Resend) + polish + deploy to Vercel |

---

## Out of Scope (Future Work)
- Real-time notifications (WebSockets)
- Map-based location search
- Complex analytics/reports
- Mobile app
