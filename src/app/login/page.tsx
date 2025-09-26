"use client"

import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const { data: session, status } = useSession()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Se arrivi dal middleware con ?callbackUrl=...
  const callbackUrl = search.get("callbackUrl") || "/"

  // 🔁 Quando la sessione diventa autenticata, reindirizziamo in base al ruolo
  useEffect(() => {
    if (status !== "authenticated") return
    const role = (session?.user as any)?.role as
      | "ADMIN"
      | "OPERATOR"
      | "CUSTOMER"
      | undefined

    const target =
      role === "ADMIN"
        ? "/dashboard/admin"
        : role === "OPERATOR"
        ? "/dashboard/operator"
        : "/profile"

    router.replace(target)
  }, [status, session, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // 👉 redirect:false per gestire noi la navigazione
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl, // non vincola più il redirect; lo gestiamo noi
    })

    setLoading(false)

    if (!res) {
      setError("Errore sconosciuto")
      return
    }
    if (res.error) {
      setError("Credenziali non valide")
      return
    }

    // A questo punto NextAuth ha aggiornato la sessione;
    // l'useEffect sopra farà il redirect appena status === "authenticated".
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded p-6">
        <h1 className="text-2xl font-bold">Login</h1>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded w-full p-2"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded w-full p-2"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Accesso in corso…" : "Accedi"}
        </button>
      </form>
    </main>
  )
}
