import { exportBooksAsCSV } from '../lib/exportCSV'

export default function Header({ onSignOut, books }) {
  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-semibold">Lucidly</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={() => exportBooksAsCSV(books)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Export CSV
        </button>
        <button
          onClick={onSignOut}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
