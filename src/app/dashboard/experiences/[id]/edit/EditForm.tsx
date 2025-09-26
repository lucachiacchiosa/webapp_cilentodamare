"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function EditForm({
  exp,
}: {
  exp: { id: string; title: string; description: string; priceCents: number }
}) {
  const router = useRouter()
  const [title, setTitle] = useState(exp.title)
  const [description, setDescription] = useState(exp.description)
  const [priceCents, setPriceCents] = useState<number>(exp.priceCents)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const res = await fetch(`/api/experiences/${exp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priceCents }),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)

    if (!res.ok || !data?.ok) {
      setError(data?.error || "Errore aggiornamento")
      return
    }
    router.push("/dashboard/experiences")
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Titolo</label>
        <input
          className="border p-2 rounded w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descrizione</label>
        <textarea
          className="border p-2 rounded w-full min-h-[120px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Prezzo (cent)</label>
        <input
          type="number"
          min={0}
          className="border p-2 rounded w-full"
          value={priceCents}
          onChange={(e) => setPriceCents(e.target.valueAsNumber)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Salvataggio…" : "Salva modifiche"}
        </button>
        <Link href="/dashboard/experiences" className="underline">
          Torna alla lista
        </Link>
      </div>
    </form>
  )
}
