import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import RowActions from "@/components/experiences/RowActions"
import Link from "next/link"
import Navbar from "@/components/navbar"

export default async function ExperiencesPage() {
  const me = await getCurrentUser()
  const role = me?.role as "ADMIN" | "OPERATOR" | "CUSTOMER" | undefined

  const experiences = await prisma.experience.findMany({
    // prendo TUTTI i campi dell'Experience (così c'è anche status)
    include: {
      operator: { select: { displayName: true, location: true } }, // campi dell’operatore
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
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          ➕ Aggiungi Experience
        </Link>
      </div>

      <div className="space-y-3">
        {experiences.map((e) => (
          <div key={e.id} className="p-4 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{e.title}</div>
              <div className="text-sm text-gray-600">
                {e.operator?.displayName} • {e.operator?.location ?? "Cilento"}
              </div>

              {/* Badge stato */}
              <span
                className={`text-xs inline-block mt-1 px-2 py-0.5 rounded ${
                  e.status === "SUSPENDED"
                    ? "bg-red-100 text-red-700"
                    : e.active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {e.status === "SUSPENDED" ? "Sospesa" : e.active ? "Attiva" : "Non attiva"}
              </span>
            </div>

            <RowActions id={e.id} active={e.active} role={role} />
          </div>
        ))}
      </div>
    </div>
    </>
  )
}
