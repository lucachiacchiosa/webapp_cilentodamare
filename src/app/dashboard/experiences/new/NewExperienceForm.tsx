"use client"

import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import Link from "next/link"

const CATEGORIES = ["GASTRONOMIA","MARE","TREKKING","CULTURA","SPORT","WELLNESS"] as const

export default function NewExperienceForm({
  operators,
}: {
  operators: { id: string; displayName: string }[]
}) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priceCents, setPriceCents] = useState<number>(0)
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("GASTRONOMIA")
  const [operatorId, setOperatorId] = useState<string>(operators[0]?.id ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(
    () => title.trim().length > 2 && description.trim().length > 5 && priceCents >= 0 && operatorId,
    [title, description, priceCents, operatorId]
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setError(null)

    const res = await fetch("/api/experiences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priceCents, category, operatorId }),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)

    if (!res.ok || !data?.ok) {
      setError(data?.error || "Errore creazione")
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium">Categoria</label>
          <select
            className="border p-2 rounded w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Operatore</label>
        <select
          className="border p-2 rounded w-full"
          value={operatorId}
          onChange={(e) => setOperatorId(e.target.value)}
          disabled={operators.length <= 1} // se è operatore singolo, blocchiamo
        >
          {operators.map((op) => (
            <option key={op.id} value={op.id}>{op.displayName}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Creazione…" : "Crea experience"}
        </button>
        <Link href="/dashboard/experiences" className="underline">
          Torna alla lista
        </Link>
      </div>
    </form>
  )
}
