import Link from "next/link"
import Navbar from "@/components/navbar"
import { getCurrentUser } from "@/lib/session"

export default async function AdminDashboard() {
  const me = await getCurrentUser()
  return (
    <>
      <Navbar />
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-gray-600 mb-6">
          Utente: <strong>{me?.email}</strong> · Ruolo: <strong>{me?.role}</strong>
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard/experiences" className="px-4 py-2 rounded bg-blue-600 text-white">
            Gestisci Experiences
          </Link>
        </div>
      </main>
    </>
  )
}
