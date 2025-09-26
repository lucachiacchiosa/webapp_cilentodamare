"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

type RoleType = "ADMIN" | "OPERATOR" | "CUSTOMER" | undefined

type Props = {
  id: string
  active: boolean
  role: RoleType
}

export default function RowActions({ id, active, role }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleActive() {
    try {
      setLoading(true)
      const res = await fetch(`/api/experiences/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
        cache: "no-store",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        alert(`Errore toggle: ${data?.error || res.statusText}`)
        return
      }
      router.refresh()
    } catch (e: any) {
      alert(`Errore toggle: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  // Chiamata API per creare la richiesta di cancellazione
  async function requestDeletion(expId: string, reason: string) {
    const res = await fetch(`/api/experiences/${expId}/deletion-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j?.error || `HTTP ${res.status}`)
    }
  }

  // Wrapper compatibile con onClick
  const onRequestDeletionClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault()
    if (loading) return
    const reason = (window.prompt("Motivo della richiesta di cancellazione (opzionale):") || "").trim()

    try {
      setLoading(true)
      await requestDeletion(id, reason)
      alert("Richiesta inviata. L’esperienza è stata sospesa in attesa di approvazione dell’admin.")
      router.refresh()
    } catch (err: any) {
      alert(err?.message || "Errore durante l’invio della richiesta")
    } finally {
      setLoading(false)
    }
  }

  async function hardDelete() {
    if (!confirm("Eliminare DEFINITIVAMENTE?")) return
    try {
      setLoading(true)
      const res = await fetch(`/api/experiences/${id}`, { method: "DELETE", cache: "no-store" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        alert(`Errore delete: ${data?.error || res.statusText}`)
        return
      }
      router.refresh()
    } catch (e: any) {
      alert(`Errore delete: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/dashboard/experiences/${id}/edit`}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
      >
        Modifica
      </Link>

      <button
        type="button"
        onClick={toggleActive}
        disabled={loading}
        className="px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 text-sm disabled:opacity-50"
      >
        {active ? "Disattiva" : "Attiva"}
      </button>

      {role === "ADMIN" ? (
        <button
          type="button"
          onClick={hardDelete}
          disabled={loading}
          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50"
        >
          Elimina
        </button>
      ) : role === "OPERATOR" ? (
        <button
          type="button"
          onClick={onRequestDeletionClick}
          disabled={loading}
          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50"
          title="Sospende l’esperienza e invia una richiesta di eliminazione all’admin"
        >
          Richiedi cancellazione
        </button>
      ) : null}
    </div>
  )
}
