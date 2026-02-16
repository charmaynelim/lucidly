export default function ActiveBookCard({ book, onOpenNotes }) {
  const formatted = new Date(book.date_started + 'T00:00:00').toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric' }
  )

  return (
    <div className="rounded-xl bg-amber-50/60 border border-amber-100 p-5">
      <p className="text-lg italic text-gray-800 leading-relaxed mb-3">
        "{book.intention}"
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{book.title}</p>
          <p className="text-xs text-gray-500">{book.author} · Started {formatted}</p>
        </div>
        <button
          onClick={() => onOpenNotes(book.id)}
          className="text-xs text-amber-700 hover:text-amber-900 transition-colors"
        >
          Notes &rarr;
        </button>
      </div>
    </div>
  )
}
