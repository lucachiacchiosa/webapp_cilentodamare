import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

// Estendiamo il tipo User
declare module "next-auth" {
  interface User extends DefaultUser {
    id: string
    role?: "ADMIN" | "OPERATOR" | "CUSTOMER"
  }

  interface Session {
    user: {
      id: string
      role?: "ADMIN" | "OPERATOR" | "CUSTOMER"
    } & DefaultSession["user"]
  }
}

// Estendiamo anche JWT (utile per next-auth con JWT strategy)
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: "ADMIN" | "OPERATOR" | "CUSTOMER"
  }
}
