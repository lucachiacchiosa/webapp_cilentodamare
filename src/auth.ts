import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { z } from "zod"

const schema = z.object({ email: z.string().email(), password: z.string().min(6) })

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      authorize: async (creds) => {
        const p = schema.safeParse(creds); if (!p.success) return null
        const email = p.data.email.trim().toLowerCase()
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) return null
        const ok = await bcrypt.compare(p.data.password, user.password)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name ?? null }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) { if (user) token.id = (user as any).id; return token },
    async session({ session, token }) { if (token?.id) (session.user as any).id = token.id; return session },
  },
}