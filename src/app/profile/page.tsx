import Navbar from "@/components/navbar"
import { getCurrentUser } from "@/lib/session"

export default async function ProfilePage() {
  const me = await getCurrentUser()
  return (
    <>
      <Navbar />
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">Profilo utente</h1>
        <p className="text-gray-600 mb-6">
          Email: <strong>{me?.email}</strong> · Ruolo: <strong>{me?.role}</strong>
        </p>
        {/* qui in futuro: preferenze, cambia password, prenotazioni... */}
      </main>
    </>
  )
}
