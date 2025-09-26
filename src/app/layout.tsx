import type { Metadata } from "next"
import "./globals.css"
import AuthProvider from "@/components/auth-provider"

export const metadata: Metadata = {
  title: "TNI",
  description: "Progetto Turismo & Innovazione",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
      </html>
  )
}
