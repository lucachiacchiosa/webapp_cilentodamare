"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function Navbar() {
  const { data: session, status } = useSession()
  const email = session?.user?.email ?? ""
  const role = (session?.user as any)?.role as
    | "ADMIN"
    | "OPERATOR"
    | "CUSTOMER"
    | undefined

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Sinistra: link comuni */}
        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded px-3 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Homepage
          </Link>

          {/* Voci in base al ruolo */}
          {status === "authenticated" && role === "ADMIN" && (
            <>
              <Link
                href="/dashboard/admin"
                className="rounded px-3 py-2 text-sm hover:bg-gray-100"
              >
                Dashboard Admin
              </Link>
              <Link
                href="/dashboard/experiences"
                className="rounded px-3 py-2 text-sm hover:bg-gray-100"
              >
                Experiences
              </Link>
              <Link
                href="/dashboard/admin/deletion-requests"
                className="rounded px-3 py-2 text-sm hover:bg-gray-100"
              >
                Richieste di cancellazione
              </Link>
            </>
          )}

          {status === "authenticated" && role === "OPERATOR" && (
            <>
              <Link
                href="/dashboard/operator"
                className="rounded px-3 py-2 text-sm hover:bg-gray-100"
              >
                Dashboard Operatore
              </Link>
              <Link
                href="/dashboard/experiences"
                className="rounded px-3 py-2 text-sm hover:bg-gray-100"
              >
                Le mie Experiences
              </Link>
            </>
          )}

          {status === "authenticated" && role === "CUSTOMER" && (
            <Link
              href="/profile"
              className="rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Profilo
            </Link>
          )}
        </nav>

        {/* Destra: utente + login/logout */}
        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <>
              <span className="hidden sm:inline text-sm text-gray-600">
                {email} {role ? `· ${role}` : ""}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
