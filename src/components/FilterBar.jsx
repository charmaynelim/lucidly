const filters = [
  { key: 'all', label: 'All' },
  { key: 'reading', label: 'Reading' },
  { key: 'finished', label: 'Finished' },
  { key: 'abandoned', label: 'Abandoned' },
]

export default function FilterBar({ activeFilter, onChange, books }) {
  const counts = {
    all: books.length,
    reading: books.filter((b) => b.status === 'reading').length,
    finished: books.filter((b) => b.status === 'finished').length,
    abandoned: books.filter((b) => b.status === 'abandoned').length,
  }

  return (
    <div className="flex gap-1">
      {filters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
            activeFilter === key
              ? 'bg-gray-900 text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {label} ({counts[key]})
        </button>
      ))}
    </div>
  )
}
