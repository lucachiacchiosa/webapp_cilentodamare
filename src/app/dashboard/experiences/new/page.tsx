import Link from "next/link"

export default function NewExperiencePage() {
  // TODO: form con logica di submit
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Crea nuova Experience</h1>

      <form className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Titolo</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Titolo dell’experience"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrizione</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Descrizione dell’experience"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Salva
        </button>
      </form>

      <div className="mt-6">
        <Link
          href="/dashboard/experiences"
          className="text-gray-600 hover:text-gray-800 underline"
        >
          ⬅ Torna alla lista
        </Link>
      </div>
    </div>
  )
}
