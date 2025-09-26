import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      // Prendo tutti i campi di Experience (niente select "stretti"),
      // + i soli campi che mi servono dell'operatore
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
      description,
      category,
      // location,      // ⛔ disattivato: invialo solo se ESISTE nello schema
      priceCents,
      // durationMin,   // ⛔ disattivato: invialo solo se ESISTE nello schema
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

    // Fallback robusti per gli interi
    const minGuestsVal =
      Number.isFinite(Number(minGuests)) && Number(minGuests) > 0
        ? Number(minGuests)
        : 1

    const maxGuestsRaw =
      Number.isFinite(Number(maxGuests)) && Number(maxGuests) > 0
        ? Number(maxGuests)
        : 10

    const maxGuestsVal = Math.max(minGuestsVal, maxGuestsRaw) // garantisce max >= min

    // Costruisco i dati in modo incrementale per evitare errori di campi inesistenti
    const data: any = {
      operatorId,
      title: String(title),
      description: String(description),
      category: String(category) as any, // se hai l'enum Prisma: Prisma.$Enums.Category
      priceCents: Number(priceCents),
      minGuests: minGuestsVal,
      maxGuests: maxGuestsVal,
      active: Boolean(active ?? true),
    }

    // Se il tuo schema ha images: String[] @default([]), tieni questo blocco
    if (Array.isArray(images)) {
      data.images = images.map(String)
    }

    // Se in futuro AGGIUNGI questi campi allo schema, puoi sbloccarli:
    // if (location) data.location = String(location)
    // if (durationMin != null) data.durationMin = Number(durationMin)

    const created = await prisma.experience.create({ data })

    return NextResponse.json({ ok: true, experience: created })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
