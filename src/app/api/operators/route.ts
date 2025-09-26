// src/app/api/operators/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic" // no cache in dev

export async function GET() {
  try {
    const ops = await prisma.operator.findMany({
      select: { id: true, displayName: true, location: true },
      orderBy: { displayName: "asc" },
    })
    return NextResponse.json({ ok: true, operators: ops })
  } catch (e) {
    console.error("[/api/operators] ERROR:", e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
