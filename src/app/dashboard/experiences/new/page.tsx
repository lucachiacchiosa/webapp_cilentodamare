import Navbar from "@/components/navbar"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import Link from "next/link"
import NewExperienceForm from "./NewExperienceForm" // 👈 client component

export default async function NewExperiencePage() {
  const me = await getCurrentUser()
  if (!me) {
    return (
      <>
        <Navbar />
        <main className="p-6 max-w-3xl mx-auto">
          <p>Devi effettuare il login.</p>
          <Link href="/login" className="underline">Vai al login</Link>
        </main>
      </>
    )
  }

  // Carichiamo la lista operatori per il select:
  // - ADMIN: tutti gli operatori
  // - OPERATOR: solo il proprio
  let operators: { id: string; displayName: string }[] = []

  if (me.role === "ADMIN") {
    operators = await prisma.operator.findMany({
      select: { id: true, displayName: true },
      orderBy: { displayName: "asc" },
    })
  } else if (me.role === "OPERATOR" && me.operator) {
    operators = [{ id: me.operator.id, displayName: me.operator.displayName ?? "Operatore" }]
  }

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Aggiungi nuova Experience</h1>
        <NewExperienceForm operators={operators} />
      </main>
    </>
  )
}
