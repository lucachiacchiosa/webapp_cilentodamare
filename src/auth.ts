// src/auth.ts
import type {
  AuthOptions,
  Session,
  User,
  Account,
  Profile,
} from "next-auth"
import type { AdapterUser } from "next-auth/adapters"
import type { JWT } from "next-auth/jwt"

import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const parsed = loginSchema.safeParse(creds)
        if (!parsed.success) return null

        const email = parsed.data.email.trim().toLowerCase()
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, password: true, role: true },
        })
        if (!user || !user.password) return null

        const ok = await bcrypt.compare(parsed.data.password, user.password)
        if (!ok) return null

        // NB: ritorniamo campi che poi copiamo nel token
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          role: user.role,
          emailVerified: null, // per soddisfare AdapterUser
        } as unknown as AdapterUser
      },
    }),
  ],

  callbacks: {
    // Firma allineata ai tipi NextAuth v5
    async jwt({
      token,
      user,
      account,
      profile,
      trigger,
      isNewUser,
      session,
    }: {
      token: JWT
      user: User | AdapterUser
      account: Account | null
      profile?: Profile
      trigger?: "update" | "signIn" | "signUp"
      isNewUser?: boolean
      session?: any
    }) {
      // Primo login: copia id/role dal user (se presenti)
      if (user) {
        const u = user as any
        if (u.id) token.id = u.id as string
        if (u.role) token.role = u.role as "ADMIN" | "OPERATOR" | "CUSTOMER"
      }

      // Se manca role nel token, ricaricalo dal DB
      if (token.id && !token.role) {
        const u = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: { role: true },
        })
        if (u?.role) token.role = u.role
      }

      return token
    },

    async session({
      session,
      token,
      user,
    }: {
      session: Session
      token: JWT
      user: AdapterUser | User | null
    }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as
          | "ADMIN"
          | "OPERATOR"
          | "CUSTOMER"
          | undefined
      }
      return session
    },

    async redirect({
      url,
      baseUrl,
      token,
    }: {
      url: string
      baseUrl: string
      token?: JWT | null
    }) {
      if (!token) return baseUrl + "/login"

      const role = token.role as "ADMIN" | "OPERATOR" | "CUSTOMER" | undefined
      const target =
        role === "ADMIN"
          ? "/dashboard/admin"
          : role === "OPERATOR"
          ? "/dashboard/operator"
          : "/profile"

      // Se il redirect è esterno esplicito, permettilo
      try {
        const parsed = new URL(url)
        if (parsed.origin !== baseUrl) return url
      } catch {
        // url relativo: gestiamo noi
      }
      return baseUrl + target
    },
  },
}
