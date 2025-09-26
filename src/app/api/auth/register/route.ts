import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    if (!email || !password) return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 })
    const emailNorm = String(email).trim().toLowerCase()
    const exists = await prisma.user.findUnique({ where: { email: emailNorm } })
    if (exists) return NextResponse.json({ ok: false, error: "User exists" }, { status: 409 })
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email: emailNorm, password: hash, name: name ?? null } })
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
