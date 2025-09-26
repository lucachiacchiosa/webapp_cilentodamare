import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/experiences → lista esperienze
export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      include: {
        operator: {
          select: { displayName: true, location: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ ok: true, experiences })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

// POST /api/experiences → crea una nuova esperienza
export async function POST(req: Request) {
  try {
    const data = await req.json()
    if (!data.operatorId || !data.title || !data.category || !data.priceCents) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 })
    }

    const exp = await prisma.experience.create({
      data: {
        operatorId: data.operatorId,
        title: data.title,
        slug: data.slug ?? data.title.toLowerCase().replace(/\s+/g, "-"),
        description: data.description ?? "",
        category: data.category,
        location: data.location ?? "Cilento",
        priceCents: Number(data.priceCents),
        durationMin: data.durationMin ?? null,
        minGuests: data.minGuests ?? null,
        maxGuests: data.maxGuests ?? null,
        images: data.images ?? [],
        active: true,
      },
    })

    return NextResponse.json({ ok: true, experience: exp })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}