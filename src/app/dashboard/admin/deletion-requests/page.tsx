// SERVER COMPONENT
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import Link from "next/link"
import ClientButtons from "./ClientButtons"

export default async function AdminDeletionRequestsPage() {
  const me = await getCurrentUser()
  if (me?.role !== "ADMIN") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Richieste di cancellazione</h1>
        <p>Non autorizzato.</p>
      </div>
    )
  }

  // 👉 per ora includo solo l'esperienza; niente relazione utente
  const requests = await prisma.deletionRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      experience: { select: { title: true } },
    },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Richieste di cancellazione</h1>
        <Link
          href="/dashboard/admin"
          className="rounded px-3 py-2 text-sm hover:bg-gray-100"
        >
          Torna alla dashboard admin
        </Link>
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-gray-600">Nessuna richiesta.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded border p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  {r.experience?.title ?? "(senza titolo)"}
                </div>
                <div className="text-xs text-gray-600">
                  Richiesta da: {r.requestedByUserId ?? "sconosciuto"} · {r.status}
                </div>
                {r.reason && <div className="text-sm mt-1">Motivo: {r.reason}</div>}
              </div>

              {/* Bottoni client-side per Approva/Rifiuta */}
              <ClientButtons id={r.id} title={r.experience?.title ?? ""} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
