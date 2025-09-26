import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id as string | undefined
    const role = (session as any)?.user?.role as "ADMIN" | "OPERATOR" | "CUSTOMER" | undefined

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }
    // solo OPERATOR (o ADMIN se vuoi consentirlo)
    if (role !== "OPERATOR") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
    }

    const expId = params.id
    const body = await req.json().catch(() => ({}))
    const reason = body?.reason ? String(body.reason) : null

    // verifica che l’experience esista e sia dell’operatore corrente
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { operator: { select: { id: true } } },
    })
    const myOperatorId = me?.operator?.id
    if (!myOperatorId) {
      return NextResponse.json({ ok: false, error: "Operator profile not found" }, { status: 403 })
    }

    const exp = await prisma.experience.findUnique({
      where: { id: expId },
      select: { id: true, operatorId: true, status: true, active: true },
    })
    if (!exp) {
      return NextResponse.json({ ok: false, error: "Experience not found" }, { status: 404 })
    }
    if (exp.operatorId !== myOperatorId) {
      return NextResponse.json({ ok: false, error: "Forbidden: not your experience" }, { status: 403 })
    }

    // sospendi l’esperienza e crea richiesta pending
    await prisma.$transaction([
      prisma.experience.update({
        where: { id: expId },
        data: { status: "SUSPENDED", active: false },
      }),
      prisma.deletionRequest.create({
        data: {
          experienceId: expId,
          status: "PENDING",
          reason,
          requestedByUserId: userId,
        },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
