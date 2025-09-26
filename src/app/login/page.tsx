"use client"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const r = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState<string | null>(null)
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.ok) r.push("/dashboard")
    else setErr("Credenziali non valide")
  }
  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border p-2 w-full rounded" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="border px-3 py-2 rounded">Entra</button>
      </form>
    </main>
  )
}
