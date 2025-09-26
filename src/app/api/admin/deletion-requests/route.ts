// src/app/api/admin/deletion-requests/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if ((session as any)?.user?.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
    }

    const items = await prisma.deletionRequest.findMany({
      orderBy: { createdAt: "desc" },
      // Niente requestedBy: non esiste come relazione
      include: {
        experience: {
          select: {
            id: true,
            title: true,
            status: true,
            active: true,
            operator: { select: { id: true, displayName: true } },
          },
        },
      },
    })

    // NB: campi scalari (es. requestedByUserId, reason, status, decidedAt, ecc.)
    // sono già inclusi di default senza bisogno di select/include.
    return NextResponse.json({ ok: true, items })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
