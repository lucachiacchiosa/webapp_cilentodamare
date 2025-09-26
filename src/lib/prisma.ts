import { PrismaClient } from "@prisma/client"

declare global {
  // In sviluppo evitiamo di creare più istanze
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"], // opzionale: utile per debug
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}
