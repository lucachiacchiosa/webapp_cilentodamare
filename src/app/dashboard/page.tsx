import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="space-y-4">
        <Link
          href="/dashboard/experiences"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Gestisci Experiences
        </Link>
      </div>
    </div>
  )
}
