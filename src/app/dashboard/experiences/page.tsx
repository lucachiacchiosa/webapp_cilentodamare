import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import Navbar from "@/components/navbar"

export const revalidate = 0 // no cache in dev; vedi subito le nuove

export default async function ExperiencesPage() {
  const me = await getCurrentUser()
  if (!me) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Le tue Experiences</h1>
        <p>Devi effettuare il login.</p>
        <Link href="/login" className="underline">Vai al login</Link>
      </div>
    )
  }

  const where =
    me.role === "OPERATOR" && me.operator
      ? { operatorId: me.operator.id }
      : {} // ADMIN vede tutto

  const experiences = await prisma.experience.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      location: true,
      priceCents: true,
      operator: { select: { displayName: true } },
      createdAt: true,
      active: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <>
    <Navbar />
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Le tue Experiences</h1>
        <Link
          href="/dashboard/experiences/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          ➕ Aggiungi Experience
        </Link>
      </div>

      {experiences.length === 0 ? (
        <div className="rounded border p-6 text-gray-700">
          <p className="mb-2">Nessuna experience trovata.</p>
          <Link href="/dashboard/experiences/new" className="underline">
            Crea la tua prima experience →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {experiences.map((e) => (
            <li key={e.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg">{e.title}</h2>
                <p className="text-sm text-gray-600">{e.description}</p>
                <p className="text-sm">
                  {e.category} · {e.location} · € {(e.priceCents / 100).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Operatore: {e.operator?.displayName ?? "—"} · {e.active ? "Attiva" : "Disattiva"}
                </p>
              </div>
              {/* qui potrai aggiungere link Modifica/Elimina */}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Link href="/dashboard" className="text-gray-600 hover:text-gray-800 underline">
          ⬅ Torna alla Dashboard
        </Link>
      </div>
    </div>
    </>
  )
}

