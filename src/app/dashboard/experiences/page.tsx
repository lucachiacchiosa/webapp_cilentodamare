import Link from "next/link"

export default function ExperiencesPage() {
  // ✅ Demo experiences (in futuro arrivano dal DB)
  const experiences = [
    {
      id: "exp1",
      title: "Tour Gastronomico a Camerota",
      description: "Degustazione di vini e prodotti tipici cilentani.",
    },
    {
      id: "exp2",
      title: "Escursione al Monte Bulgheria",
      description: "Un trekking indimenticabile nel cuore del Parco Nazionale.",
    },
    {
      id: "exp3",
      title: "Snorkeling a Palinuro",
      description: "Alla scoperta dei fondali cristallini del Cilento.",
    },
  ]

  return (
    <div className="p-6">
      {/* Header con bottone aggiungi */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Le tue Experiences</h1>
        <Link
          href="/dashboard/experiences/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          ➕ Aggiungi Experience
        </Link>
      </div>

      {/* Lista experiences */}
      {experiences.length === 0 ? (
        <p className="text-gray-600">Nessuna experience ancora creata.</p>
      ) : (
        <ul className="space-y-3">
          {experiences.map((exp) => (
            <li
              key={exp.id}
              className="p-4 border rounded-lg shadow-sm hover:shadow-md transition flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold text-lg">{exp.title}</h2>
                <p className="text-sm text-gray-600">{exp.description}</p>
              </div>
              <Link
                href={`/dashboard/experiences/${exp.id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                Dettagli →
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Link per tornare indietro */}
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="text-gray-600 hover:text-gray-800 underline"
        >
          ⬅ Torna alla Dashboard
        </Link>
      </div>
    </div>
  )
}
