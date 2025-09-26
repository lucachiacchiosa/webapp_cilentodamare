import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = await prisma.$queryRaw<{ now: Date }[]>`SELECT now()`
    return NextResponse.json({ ok: true, now })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}