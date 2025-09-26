import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

// (opzionale) dettagli di una experience
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const exp = await prisma.experience.findUnique({
      where: { id: params.id },
      include: { operator: { select: { id: true, displayName: true } } },
    })
    if (!exp) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true, experience: exp })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

// toggle / update campi semplici
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id as string | undefined
    const role = (session as any)?.user?.role as "ADMIN" | "OPERATOR" | "CUSTOMER" | undefined
    if (!userId || !role) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })

    const exp = await prisma.experience.findUnique({
      where: { id: params.id },
      select: { id: true, operatorId: true },
    })
    if (!exp) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })

    // Solo ADMIN o l’OPERATORE proprietario possono modificare
    if (!(role === "ADMIN" || role === "OPERATOR")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
    }
    if (role === "OPERATOR") {
      const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { operator: { select: { id: true } } },
      })
      const myOpId = me?.operator?.id
      if (!myOpId || myOpId !== exp.operatorId) {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
      }
    }

    const body = await req.json().catch(() => ({}))
    const data: any = {}

    if (typeof body.active === "boolean") data.active = body.active
    if (typeof body.title === "string") data.title = body.title
    if (typeof body.description === "string") data.description = body.description
    if (typeof body.category === "string") data.category = body.category
    if (Number.isFinite(Number(body.priceCents))) data.priceCents = Number(body.priceCents)
    if (Number.isFinite(Number(body.minGuests))) data.minGuests = Number(body.minGuests)
    if (Number.isFinite(Number(body.maxGuests))) data.maxGuests = Number(body.maxGuests)

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: false, error: "No valid fields" }, { status: 400 })
    }

    const updated = await prisma.experience.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json({ ok: true, experience: updated })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

// ⬇️ FIX: l’ADMIN può eliminare definitivamente
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session as any)?.user?.role as "ADMIN" | "OPERATOR" | "CUSTOMER" | undefined
    if (!role) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })

    if (role !== "ADMIN") {
      // Gli operatori devono usare la richiesta di cancellazione
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
    }

    await prisma.experience.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
