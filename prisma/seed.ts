// prisma/seed.ts
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

type Role = "ADMIN" | "OPERATOR" | "CUSTOMER"
type Tier = "BASIC" | "SILVER" | "GOLD" | "PLATINUM"
// se nel tuo schema `category` è un enum Prisma, puoi anche usare il tipo string literal:
type Category = "GASTRONOMIA" | "MARE" | "TREKKING" | "CULTURA" | "SPORT" | "WELLNESS"

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // rimuove accenti
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function main() {
  console.log("🌱 Seeding...")

  // utenti base
  await prisma.user.upsert({
    where: { email: "admin@tni.local" },
    update: {},
    create: { email: "admin@tni.local", role: "ADMIN" as Role },
  })

  const opUser = await prisma.user.upsert({
    where: { email: "operatore@tni.local" },
    update: {},
    create: { email: "operatore@tni.local", role: "OPERATOR" as Role, name: "Operatore Demo" },
  })

  // operatore
  const operator = await prisma.operator.upsert({
    where: { userId: opUser.id },
    update: {},
    create: {
      userId: opUser.id,
      displayName: "Cilento Experience",
      description: "Esperienze nel Golfo di Policastro",
      location: "Golfo di Policastro (SA)",
      tier: "BASIC" as Tier,
    },
  })

  // experience demo (con slug e location)
  const exps: Array<{
    title: string
    description: string
    category: Category
    priceCents: number
    location: string
    slug?: string
  }> = [
    {
      title: "Tour in barca al tramonto",
      description: "Uscita in barca con aperitivo.",
      category: "MARE",
      priceCents: 4500,
      location: "Scario (SA)",
    },
    {
      title: "Trekking Grotte del Bussento",
      description: "Percorso guidato nell’Oasi WWF.",
      category: "TREKKING",
      priceCents: 2500,
      location: "Morigerati (SA)",
    },
    {
      title: "Degustazione olio e tipici",
      description: "Frantoio + tasting guidato.",
      category: "GASTRONOMIA",
      priceCents: 2000,
      location: "Cilento",
    },
  ]

  for (const e of exps) {
    const slug = e.slug ?? slugify(e.title)
    const exists = await prisma.experience.findFirst({ where: { slug } })
    if (exists) continue

    await prisma.experience.create({
      data: {
        operatorId: operator.id,
        title: e.title,
        slug,                 // ✅ obbligatorio nello schema
        description: e.description,
        category: e.category as any, // se è enum Prisma, puoi togliere `as any`
        location: e.location, // ✅ obbligatorio nello schema
        priceCents: e.priceCents,
        minGuests: 1,
        maxGuests: 10,
        active: true,
        // status: "ACTIVE", // ← usa solo se il campo esiste a DB
        // images: [],       // ← usa solo se il campo esiste a DB
      },
    })
  }

  console.log("✅ Seed completato")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
