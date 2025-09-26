import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      include: { operator: { select: { displayName: true, location: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ ok: true, experiences })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const me = await prisma.user.findUnique({
      where: { id: String((session.user as any).id) },
      select: { id: true, role: true, operator: { select: { id: true } } },
    })
    if (!me) return NextResponse.json({ ok: false, error: "User not found" }, { status: 401 })

    const body = await req.json()
    const {
      operatorId: operatorIdFromBody,
      title,
      slug,
      description,
      category,
      location,
      priceCents,
      durationMin,
      minGuests,
      maxGuests,
      images,
      active,
    } = body || {}

    if (!title || !description || !category || priceCents == null) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 })
    }

    // Determina operatorId in base al ruolo
    let operatorId: string | null = null
    if (me.role === "OPERATOR") {
      operatorId = me.operator?.id ?? null
      if (!operatorId) {
        return NextResponse.json({ ok: false, error: "Operator profile not found for this user" }, { status: 403 })
      }
      // Se l'OPERATOR prova a specificare un operatorId diverso → blocca
      if (operatorIdFromBody && operatorIdFromBody !== operatorId) {
        return NextResponse.json({ ok: false, error: "Forbidden: cannot assign to another operator" }, { status: 403 })
      }
    } else if (me.role === "ADMIN") {
      operatorId = operatorIdFromBody ?? null
    } else {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 })
    }

    if (!operatorId) {
      return NextResponse.json({ ok: false, error: "operatorId is required (ADMIN)" }, { status: 400 })
    }

    const created = await prisma.experience.create({
      data: {
        operatorId,
        title: String(title),
        slug: (slug ? String(slug) : String(title)).toLowerCase().trim().replace(/\s+/g, "-"),
        description: String(description),
        category: String(category) as any,
        location: location ? String(location) : "Cilento",
        priceCents: Number(priceCents),
        durationMin: durationMin == null ? null : Number(durationMin),
        minGuests: minGuests == null ? null : Number(minGuests),
        maxGuests: maxGuests == null ? null : Number(maxGuests),
        images: Array.isArray(images) ? images.map(String) : [],
        active: Boolean(active ?? true),
      },
    })

    return NextResponse.json({ ok: true, experience: created })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
