import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

// GET /api/experiences/:id  → dettagli (admin vede tutto, operator solo le sue)
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role as "ADMIN" | "OPERATOR" | "CUSTOMER" | undefined
  const userId = (session as any)?.user?.id as string | undefined

  const exp = await prisma.experience.findUnique({
    where: { id: params.id },
    include: { operator: { select: { id: true, userId: true, displayName: true } } },
  })
  if (!exp) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })

  if (role === "OPERATOR") {
    // l'operatore può leggere solo le sue experiences
    const myOp = await prisma.operator.findFirst({ where: { userId: userId ?? "" }, select: { id: true } })
    if (!myOp || exp.operatorId !== myOp.id) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
    }
  }
  return NextResponse.json({ ok: true, experience: exp })
}

// PATCH /api/experiences/:id  → update minimale (title, description, priceCents)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role as "ADMIN" | "OPERATOR" | undefined
  const userId = (session as any)?.user?.id as string | undefined
  if (!role) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })

  const exp = await prisma.experience.findUnique({ where: { id: params.id } })
  if (!exp) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })

  if (role === "OPERATOR") {
    const myOp = await prisma.operator.findFirst({ where: { userId: userId ?? "" }, select: { id: true } })
    if (!myOp || exp.operatorId !== myOp.id) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
    }
  }

 const body = await req.json().catch(() => ({}))
  const data: any = {}
  if (typeof body.title === "string") data.title = body.title
  if (typeof body.description === "string") data.description = body.description
  if (Number.isFinite(body.priceCents)) data.priceCents = Number(body.priceCents)

  // ✅ accetta sia "active" sia "isActive" per compatibilità
  if (typeof body.active === "boolean") data.active = body.active
  if (typeof body.isActive === "boolean") data.active = body.isActive

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "No valid fields" }, { status: 400 })
  }

  const updated = await prisma.experience.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json({ ok: true, experience: updated })
}

// DELETE /api/experiences/:id  → soft delete (isActive=false)
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role as "ADMIN" | "OPERATOR" | undefined
  const userId = (session as any)?.user?.id as string | undefined
  if (!role) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })

  const exp = await prisma.experience.findUnique({ where: { id: params.id } })
  if (!exp) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 })

  if (role === "OPERATOR") {
    const myOp = await prisma.operator.findFirst({
      where: { userId: userId ?? "" }, select: { id: true }
    })
    if (!myOp || exp.operatorId !== myOp.id) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
    }
  }

   const updated = await prisma.experience.update({
    where: { id: params.id },
    data: { active: false }, // 👈 QUI
  })
  return NextResponse.json({ ok: true, experience: updated })
}