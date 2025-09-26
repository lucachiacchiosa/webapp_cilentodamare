import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: String((session.user as any).id) },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      operator: { select: { id: true, displayName: true } },
    },
  })
  return user
}
