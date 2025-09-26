import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

type Role = "ADMIN" | "OPERATOR" | "CUSTOMER"
type Tier = "BASIC" | "SILVER" | "GOLD" | "PLATINUM"
type Category = "GASTRONOMIA" | "MARE" | "TREKKING" | "CULTURA" | "SPORT" | "WELLNESS"

async function main() {
  console.log("🌱 Seeding...")

  await prisma.user.upsert({ where: { email: "admin@tni.local" }, update: {}, create: { email: "admin@tni.local", role: "ADMIN" as Role } })
  const opUser = await prisma.user.upsert({ where: { email: "operatore@tni.local" }, update: {}, create: { email: "operatore@tni.local", role: "OPERATOR" as Role, name: "Operatore Demo" } })
  const operator = await prisma.operator.upsert({
    where: { userId: opUser.id }, update: {},
    create: { userId: opUser.id, displayName: "Cilento Experience", description: "Esperienze nel Golfo di Policastro", location: "Golfo di Policastro (SA)", tier: "BASIC" as Tier }
  })

  const exps = [
    { title: "Tour in barca al tramonto", slug: "tour-barca-tramonto", description: "Uscita in barca con aperitivo.", category: "MARE" as Category, location: "Scario (SA)", priceCents: 4500, images: [] as string[] },
    { title: "Trekking Grotte del Bussento", slug: "trekking-grotte-bussento", description: "Percorso guidato nell’Oasi WWF.", category: "TREKKING" as Category, location: "Morigerati (SA)", priceCents: 2500, images: [] },
    { title: "Degustazione olio e tipici", slug: "degustazione-olio-prodotti-tipici", description: "Frantoio + tasting guidato.", category: "GASTRONOMIA" as Category, location: "Cilento", priceCents: 2000, images: [] }
  ]
  for (const e of exps) {
    await prisma.experience.upsert({ where: { slug: e.slug }, update: {}, create: { operatorId: operator.id, ...e, active: true } })
  }
  console.log("✅ Seed completato")
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(async()=>{await prisma.$disconnect()})
