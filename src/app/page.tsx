"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function HomePage() {
  const { data: session } = useSession()
  const name = session?.user?.name ?? session?.user?.email ?? "Account"
  const role = (session?.user as any)?.role as "ADMIN" | "OPERATOR" | "CUSTOMER" | undefined

  // Destinazione corretta in base al ruolo
  const dashboardHref =
    role === "ADMIN" ? "/dashboard/admin"
    : role === "OPERATOR" ? "/dashboard/operator"
    : "/profile"

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">TNI – Golfo di Policastro</h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        Marketplace di esperienze locali: gastronomia, mare, trekking e cultura.
      </p>

      {!session ? (
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-gray-700">Loggato come <strong>{name}</strong></span>

          {/* 👇 link diretto alla dashboard giusta */}
          <Link
            href={dashboardHref}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Dashboard
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </main>
  )
}
