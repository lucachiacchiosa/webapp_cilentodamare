"use client"

import { useRouter } from "next/navigation"

export default function ClientButtons({ id, title }: { id: string; title: string }) {
  const router = useRouter()

  async function act(action: "APPROVE" | "REJECT") {
    const ok = confirm(
      action === "APPROVE"
        ? `Confermi l'ELIMINAZIONE definitiva di: "${title}"?`
        : `Rifiutare la richiesta per: "${title}"?`
    )
    if (!ok) return

    const res = await fetch(`/api/admin/deletion-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok || !j?.ok) {
      alert(j?.error || `Errore ${res.status}`)
      return
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => act("APPROVE")}
        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
        title={`Approva eliminazione di "${title}"`}
      >
        Approva
      </button>
      <button
        onClick={() => act("REJECT")}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        title={`Rifiuta richiesta per "${title}"`}
      >
        Rifiuta
      </button>
    </div>
  )
}
