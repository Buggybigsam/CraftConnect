import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const ARTISANS = [
  {
    id: "seed_user_kwame",
    name: "Kwame Asante",
    email: "kwame.asante@seed.com",
    location: "Accra, Ghana",
    phone: "+233 24 111 2233",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame",
    profile: {
      category: "Electrician",
      bio: "Licensed electrician with 8 years of experience handling residential and commercial wiring, solar installations, and electrical fault diagnosis across Accra.",
      pricePerHour: 80,
      yearsExp: 8,
      rating: 4.8,
      totalReviews: 34,
    },
    services: [
      { title: "Wiring & Rewiring",       description: "Full home or office electrical wiring",    price: 250, category: "Electrician" },
      { title: "Fault Diagnosis & Repair", description: "Diagnose and fix electrical faults",       price: 120, category: "Electrician" },
      { title: "Solar Panel Installation", description: "Install and configure solar systems",       price: 500, category: "Electrician" },
    ],
  },
  {
    id: "seed_user_abena",
    name: "Abena Mensah",
    email: "abena.mensah@seed.com",
    location: "Kumasi, Ghana",
    phone: "+233 54 222 3344",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abena",
    profile: {
      category: "Cleaner",
      bio: "Professional home and office cleaning specialist. I provide deep-cleaning, move-in/move-out cleaning, and regular maintenance services with eco-friendly products.",
      pricePerHour: 45,
      yearsExp: 5,
      rating: 4.9,
      totalReviews: 62,
    },
    services: [
      { title: "Deep House Cleaning",   description: "Full top-to-bottom home deep clean",         price: 180, category: "Cleaner" },
      { title: "Office Cleaning",       description: "Regular or one-off office cleaning",         price: 120, category: "Cleaner" },
      { title: "Post-Event Cleanup",    description: "Clean up after parties and events",          price: 200, category: "Cleaner" },
    ],
  },
  {
    id: "seed_user_kofi",
    name: "Kofi Adu",
    email: "kofi.adu@seed.com",
    location: "Accra, Ghana",
    phone: "+233 20 333 4455",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kofi",
    profile: {
      category: "Plumber",
      bio: "Expert plumber with 10 years experience. Specialising in pipe installations, leak detection, bathroom fittings, and drainage systems for homes and commercial buildings.",
      pricePerHour: 70,
      yearsExp: 10,
      rating: 4.7,
      totalReviews: 48,
    },
    services: [
      { title: "Pipe Installation",     description: "Install new water supply or drain pipes",   price: 200, category: "Plumber" },
      { title: "Leak Detection & Fix",  description: "Find and repair hidden leaks",              price: 150, category: "Plumber" },
      { title: "Bathroom Fitting",      description: "Full bathroom plumbing setup",              price: 350, category: "Plumber" },
    ],
  },
  {
    id: "seed_user_ama",
    name: "Ama Owusu",
    email: "ama.owusu@seed.com",
    location: "Accra, Ghana",
    phone: "+233 27 444 5566",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ama",
    profile: {
      category: "Tutor",
      bio: "Certified math and science tutor with experience teaching JHS through SHS students. I make complex topics simple and build students' confidence with structured lessons.",
      pricePerHour: 60,
      yearsExp: 6,
      rating: 4.9,
      totalReviews: 27,
    },
    services: [
      { title: "Mathematics Tutoring",  description: "Core math from JHS to SHS level",          price: 60,  category: "Tutor" },
      { title: "Science Tutoring",      description: "Physics, Chemistry, Biology",               price: 65,  category: "Tutor" },
      { title: "BECE / WASSCE Prep",    description: "Intensive exam preparation sessions",       price: 80,  category: "Tutor" },
    ],
  },
  {
    id: "seed_user_kweku",
    name: "Kweku Boateng",
    email: "kweku.boateng@seed.com",
    location: "Takoradi, Ghana",
    phone: "+233 50 555 6677",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kweku",
    profile: {
      category: "Carpenter",
      bio: "Skilled carpenter creating custom furniture, built-in wardrobes, kitchen cabinets, and wooden interior finishing. My work combines traditional craft with modern design.",
      pricePerHour: 75,
      yearsExp: 12,
      rating: 4.6,
      totalReviews: 19,
    },
    services: [
      { title: "Custom Furniture",      description: "Beds, tables, chairs, made to order",     price: 400, category: "Carpenter" },
      { title: "Kitchen Cabinets",      description: "Design and install kitchen cupboards",      price: 600, category: "Carpenter" },
      { title: "Door & Window Frames",  description: "Wooden frames, doors, and shutters",       price: 250, category: "Carpenter" },
    ],
  },
  {
    id: "seed_user_efua",
    name: "Efua Darko",
    email: "efua.darko@seed.com",
    location: "Kumasi, Ghana",
    phone: "+233 24 666 7788",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Efua",
    profile: {
      category: "Painter",
      bio: "Interior and exterior painting professional. I deliver clean, precise, long-lasting finishes for homes, offices, and commercial buildings using quality paints.",
      pricePerHour: 55,
      yearsExp: 7,
      rating: 4.7,
      totalReviews: 31,
    },
    services: [
      { title: "Interior Painting",     description: "Full room or whole-house interior paint",  price: 300, category: "Painter" },
      { title: "Exterior Painting",     description: "Weather-resistant exterior house painting", price: 500, category: "Painter" },
      { title: "Texture & Finishes",    description: "Decorative wall textures and coatings",    price: 250, category: "Painter" },
    ],
  },
  {
    id: "seed_user_yaw",
    name: "Yaw Osei",
    email: "yaw.osei@seed.com",
    location: "Accra, Ghana",
    phone: "+233 55 777 8899",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yaw",
    profile: {
      category: "Mechanic",
      bio: "Experienced auto mechanic offering diagnostics, engine repair, AC servicing, brake jobs, and general vehicle maintenance. I work on all makes and models.",
      pricePerHour: 90,
      yearsExp: 9,
      rating: 4.5,
      totalReviews: 44,
    },
    services: [
      { title: "Full Service & Oil Change", description: "Complete vehicle maintenance service",  price: 180, category: "Mechanic" },
      { title: "Engine Diagnostics",        description: "Computer scan and fault diagnosis",     price: 100, category: "Mechanic" },
      { title: "Brake System Repair",       description: "Pads, discs, callipers, and lines",    price: 220, category: "Mechanic" },
    ],
  },
  {
    id: "seed_user_adwoa",
    name: "Adwoa Kumi",
    email: "adwoa.kumi@seed.com",
    location: "Kumasi, Ghana",
    phone: "+233 26 888 9900",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adwoa",
    profile: {
      category: "Mason",
      bio: "Expert bricklayer and mason with over 14 years in residential and commercial construction. I handle foundations, walls, tiling, plastering, and concrete work.",
      pricePerHour: 85,
      yearsExp: 14,
      rating: 4.8,
      totalReviews: 22,
    },
    services: [
      { title: "Bricklaying",           description: "Walls, fences, garden borders",            price: 400, category: "Mason" },
      { title: "Plastering & Screeding", description: "Smooth wall and floor finishes",          price: 280, category: "Mason" },
      { title: "Tiling",                description: "Floor and wall tile installation",          price: 350, category: "Mason" },
    ],
  },
  {
    id: "seed_user_chukwudi",
    name: "Chukwudi Obi",
    email: "chukwudi.obi@seed.com",
    location: "Tema, Ghana",
    phone: "+233 20 555 7890",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chukwudi",
    profile: {
      category: "Electrician",
      bio: "Certified electrical engineer providing industrial and residential electrical services across Tema and Greater Accra. Specialising in inverter installations, generator servicing, and smart home systems.",
      pricePerHour: 100,
      yearsExp: 11,
      rating: 4.9,
      totalReviews: 57,
    },
    services: [
      { title: "Inverter Installation",   description: "Install and configure home inverters",   price: 400, category: "Electrician" },
      { title: "Generator Servicing",     description: "Full gen-set maintenance and repairs",   price: 200, category: "Electrician" },
      { title: "Smart Home Wiring",       description: "Automated lighting and smart switches",  price: 600, category: "Electrician" },
    ],
  },
  {
    id: "seed_user_ngozi",
    name: "Ngozi Eze",
    email: "ngozi.eze@seed.com",
    location: "Cape Coast, Ghana",
    phone: "+233 24 666 8901",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ngozi",
    profile: {
      category: "Cleaner",
      bio: "Premium residential cleaning service based in Cape Coast. I bring my own professional-grade equipment and eco-friendly products for a spotless, fresh-smelling home every time.",
      pricePerHour: 50,
      yearsExp: 4,
      rating: 4.8,
      totalReviews: 39,
    },
    services: [
      { title: "Regular Home Cleaning",   description: "Weekly or bi-weekly home maintenance",   price: 100, category: "Cleaner" },
      { title: "Deep Clean",              description: "Thorough whole-home deep cleaning",       price: 220, category: "Cleaner" },
      { title: "Move-In / Move-Out",      description: "Clean before or after moving",           price: 280, category: "Cleaner" },
    ],
  },
  {
    id: "seed_user_esi",
    name: "Esi Bonsu",
    email: "esi.bonsu@seed.com",
    location: "Accra, Ghana",
    phone: "+233 27 111 0022",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Esi",
    profile: {
      category: "Tutor",
      bio: "English language and ICT tutor for JHS and SHS students. I focus on comprehension, essay writing, and basic computer literacy with patient, practical lessons.",
      pricePerHour: 55,
      yearsExp: 3,
      rating: 4.6,
      totalReviews: 12,
    },
    services: [
      { title: "English Tutoring",      description: "Grammar, comprehension, essay writing",   price: 55,  category: "Tutor" },
      { title: "ICT Basics",            description: "Computer literacy for beginners",         price: 50,  category: "Tutor" },
    ],
  },
  {
    id: "seed_user_kojo",
    name: "Kojo Mensah",
    email: "kojo.mensah@seed.com",
    location: "Tamale, Ghana",
    phone: "+233 20 222 0033",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kojo",
    profile: {
      category: "Mason",
      bio: "New to the platform but experienced on-site for 5 years. I handle small residential jobs: block work, plastering, and simple concrete repairs at fair rates.",
      pricePerHour: 60,
      yearsExp: 5,
      rating: 4.3,
      totalReviews: 3,
    },
    services: [
      { title: "Block Work",            description: "Small wall and boundary block laying",    price: 220, category: "Mason" },
      { title: "Concrete Repairs",      description: "Patch and repair damaged concrete",       price: 150, category: "Mason" },
    ],
  },
]

const CUSTOMERS = [
  {
    id: "seed_customer_yaa",
    name: "Yaa Asantewaa",
    email: "yaa.asantewaa@seed.com",
    location: "Accra, Ghana",
    phone: "+233 24 900 1122",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=YaaCustomer",
  },
  {
    id: "seed_customer_kwabena",
    name: "Kwabena Sarpong",
    email: "kwabena.sarpong@seed.com",
    location: "Kumasi, Ghana",
    phone: "+233 54 900 2233",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=KwabenaCustomer",
  },
  {
    id: "seed_customer_akosua",
    name: "Akosua Frimpong",
    email: "akosua.frimpong@seed.com",
    location: "Tema, Ghana",
    phone: "+233 20 900 3344",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AkosuaCustomer",
  },
]

async function main() {
  console.log("🌱 Seeding dummy artisans...")

  for (const a of ARTISANS) {
    // Upsert user
    await prisma.user.upsert({
      where:  { id: a.id },
      update: { name: a.name, location: a.location, phone: a.phone },
      create: {
        id:       a.id,
        name:     a.name,
        email:    a.email,
        role:     "ARTISAN",
        location: a.location,
        phone:    a.phone,
        imageUrl: a.imageUrl,
      },
    })

    // Upsert artisan profile
    await prisma.artisanProfile.upsert({
      where:  { userId: a.id },
      update: {
        bio:          a.profile.bio,
        category:     a.profile.category,
        pricePerHour: a.profile.pricePerHour,
        location:     a.location,
        yearsExp:     a.profile.yearsExp,
        status:       "APPROVED",
        rating:       a.profile.rating,
        totalReviews: a.profile.totalReviews,
      },
      create: {
        userId:       a.id,
        bio:          a.profile.bio,
        category:     a.profile.category,
        pricePerHour: a.profile.pricePerHour,
        location:     a.location,
        yearsExp:     a.profile.yearsExp,
        status:       "APPROVED",
        rating:       a.profile.rating,
        totalReviews: a.profile.totalReviews,
      },
    })

    // Get the artisan profile id
    const profile = await prisma.artisanProfile.findUnique({ where: { userId: a.id } })
    if (!profile) continue

    // Upsert services
    for (const s of a.services) {
      const existing = await prisma.service.findFirst({
        where: { artisanId: profile.id, title: s.title },
      })
      if (!existing) {
        await prisma.service.create({
          data: { artisanId: profile.id, ...s },
        })
      }
    }

    console.log(`  ✓ ${a.name} (${a.profile.category} · ${a.location})`)
  }

  console.log(`\n✅ Seeded ${ARTISANS.length} artisans with services.`)

  console.log("\n🌱 Seeding dummy customers...")

  for (const c of CUSTOMERS) {
    await prisma.user.upsert({
      where:  { id: c.id },
      update: { name: c.name, location: c.location, phone: c.phone },
      create: {
        id:       c.id,
        name:     c.name,
        email:    c.email,
        role:     "CUSTOMER",
        location: c.location,
        phone:    c.phone,
        imageUrl: c.imageUrl,
      },
    })
    console.log(`  ✓ ${c.name} (${c.location})`)
  }

  console.log(`\n✅ Seeded ${CUSTOMERS.length} customers.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
