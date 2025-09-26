import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import 
Navbar from "@/components/navbar"
// Server Component: decide UI in base al ruolo
export default async function NewExperiencePage() {
  const me = await getCurrentUser()
  if (!me) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Crea nuova Experience</h1>
        <p>Devi effettuare il login.</p>
        <Link href="/login" className="underline">Vai al login</Link>
      </div>
    )
  }

  let operators: { id: string; displayName: string; location: string | null }[] = []
  let fixedOperatorId: string | null = null

  if (me.role === "OPERATOR") {
    fixedOperatorId = me.operator?.id ?? null
  } else if (me.role === "ADMIN") {
    operators = await prisma.operator.findMany({
      select: { id: true, displayName: true, location: true },
      orderBy: { displayName: "asc" },
    })
  }

  return <ClientForm fixedOperatorId={fixedOperatorId} operators={operators} />
}

// ------- Client form -------
"use client"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"

const CATEGORIES = ["GASTRONOMIA","MARE","TREKKING","CULTURA","SPORT","WELLNESS"] as const

function ClientForm({
  fixedOperatorId,
  operators,
}: {
  fixedOperatorId: string | null
  operators: { id: string; displayName: string; location: string | null }[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    operatorId: fixedOperatorId ?? "",
    title: "",
    slug: "",
    description: "",
    category: "MARE",
    location: "",
    priceCents: 0,
    durationMin: 0,
    minGuests: 1,
    maxGuests: 10,
    active: true,
  })

  const isValid = useMemo(() => {
    return (
      (fixedOperatorId || form.operatorId) &&
      form.title.trim().length >= 3 &&
      (form.slug || form.title.trim().length >= 3) &&
      form.description.trim().length >= 10 &&
      form.location.trim().length >= 2 &&
      form.priceCents >= 0
    )
  }, [form, fixedOperatorId])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload = {
      ...form,
      operatorId: fixedOperatorId ?? form.operatorId,
      priceCents: Number(form.priceCents),
      slug: form.slug || form.title.toLowerCase().trim().replace(/\s+/g, "-"),
    }

    const res = await fetch("/api/experiences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)

    if (!res.ok || !data.ok) {
      setError(data?.error ? String(data.error) : "Errore creazione esperienza")
      return
    }
    router.push("/dashboard/experiences")
  }

  return (
    <>
    <Navbar />
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crea nuova Experience</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Operatore */}
        <div className="space-y-1">
          <label className="block text-sm font-medium">Operatore</label>
          {fixedOperatorId ? (
            <p className="text-sm text-gray-700">Assegnata automaticamente al tuo profilo operatore.</p>
          ) : (
            <select
              className="border p-2 rounded w-full"
              value={form.operatorId}
              onChange={(e) => setForm((f) => ({ ...f, operatorId: e.target.value }))}
            >
              <option value="">— seleziona operatore —</option>
              {operators.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.displayName} {o.location ? `— ${o.location}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Titolo / Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Titolo</label>
            <input
              className="border p-2 rounded w-full"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Es. Tour in barca al tramonto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Slug (opzionale)</label>
            <input
              className="border p-2 rounded w-full"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="tour-barca-tramonto"
            />
          </div>
        </div>

        {/* Descrizione */}
        <div>
          <label className="block text-sm font-medium">Descrizione</label>
          <textarea
            className="border p-2 rounded w-full min-h-[120px]"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Descrivi l’esperienza…"
          />
        </div>

        {/* Categoria / Luogo / Prezzo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Categoria</label>
            <select
              className="border p-2 rounded w-full"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Luogo</label>
            <input
              className="border p-2 rounded w-full"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Es. Scario (SA)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Prezzo (cent)</label>
            <input
              type="number"
              min={0}
              className="border p-2 rounded w-full"
              value={form.priceCents}
              onChange={(e) => setForm((f) => ({ ...f, priceCents: e.target.valueAsNumber }))}
              placeholder="Es. 4500"
            />
          </div>
        </div>

        {/* Durata / Ospiti / Attiva */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium">Durata (min)</label>
            <input
              type="number"
              min={0}
              className="border p-2 rounded w-full"
              value={form.durationMin}
              onChange={(e) => setForm((f) => ({ ...f, durationMin: e.target.valueAsNumber }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Min ospiti</label>
            <input
              type="number"
              min={1}
              className="border p-2 rounded w-full"
              value={form.minGuests}
              onChange={(e) => setForm((f) => ({ ...f, minGuests: e.target.valueAsNumber }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Max ospiti</label>
            <input
              type="number"
              min={1}
              className="border p-2 rounded w-full"
              value={form.maxGuests}
              onChange={(e) => setForm((f) => ({ ...f, maxGuests: e.target.valueAsNumber }))}
            />
          </div>
          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            Attiva
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!isValid || saving}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Salvataggio…" : "Crea esperienza"}
          </button>
          <Link href="/dashboard/experiences" className="text-gray-600 hover:text-gray-800 underline">
            ⬅ Torna alla lista
          </Link>
        </div>
      </form>
    </div>
    </>
  )
}
