import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Solo ADMIN
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  if (role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const action = body?.action as "APPROVE" | "REJECT" | undefined
  if (!action) {
    return NextResponse.json({ ok: false, error: "Missing action" }, { status: 400 })
  }

  // Carica richiesta
  const reqRow = await prisma.deletionRequest.findUnique({
    where: { id: params.id },
  })
  if (!reqRow || reqRow.status !== "PENDING") {
    return NextResponse.json({ ok: false, error: "Not found or not pending" }, { status: 404 })
  }

  try {
    if (action === "APPROVE") {
      // ⚠️ ordine: prima elimino la richiesta (che ha FK su experience), poi l'esperienza
      await prisma.$transaction(async (tx) => {
        await tx.deletionRequest.delete({ where: { id: reqRow.id } })
        await tx.experience.delete({ where: { id: reqRow.experienceId } })
      })
      return NextResponse.json({ ok: true })
    } else {
      // REJECT → riattivo esperienza e marco la richiesta come rifiutata
      await prisma.$transaction(async (tx) => {
        await tx.experience.update({
          where: { id: reqRow.experienceId },
          data: { status: "ACTIVE", active: true },
        })
        await tx.deletionRequest.update({
          where: { id: reqRow.id },
          data: { status: "REJECTED", decidedAt: new Date() },
        })
      })
      return NextResponse.json({ ok: true })
    }
  } catch (e: any) {
    console.error("Admin deletion action error:", e)
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 })
  }
}
