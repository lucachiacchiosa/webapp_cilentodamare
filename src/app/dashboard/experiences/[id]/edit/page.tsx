import Navbar from "@/components/navbar"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import Link from "next/link"
import EditForm from "./EditForm" // 👈 deve esistere EditForm.tsx nella stessa cartella

export default async function EditExperiencePage({ params }: { params: { id: string } }) {
  const me = await getCurrentUser()
  if (!me) {
    return (
      <>
        <Navbar />
        <main className="p-6 max-w-3xl mx-auto">
          <p>Devi effettuare il login.</p>
          <Link href="/login" className="underline">Vai al login</Link>
        </main>
      </>
    )
  }

  const where =
    me.role === "OPERATOR" && me.operator
      ? { id: params.id, operatorId: me.operator.id }
      : { id: params.id }

  const exp = await prisma.experience.findFirst({ where })
  if (!exp) {
    return (
      <>
        <Navbar />
        <main className="p-6 max-w-3xl mx-auto">
          <p>Experience non trovata o non autorizzato.</p>
          <Link href="/dashboard/experiences" className="underline">Torna alla lista</Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Modifica Experience</h1>
        <EditForm
          exp={{
            id: exp.id,
            title: exp.title,
            description: exp.description ?? "",
            priceCents: exp.priceCents,
          }}
        />
      </main>
    </>
  )
}
