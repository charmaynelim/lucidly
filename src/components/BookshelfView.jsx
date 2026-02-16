function generateColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 35%, 72%)`
}

export default function BookshelfView({ books, onSelectBook }) {
  const finished = books
    .filter((b) => b.status === 'finished')
    .sort((a, b) => new Date(a.date_completed) - new Date(b.date_completed))

  if (finished.length === 0) {
    return (
      <div className="rounded-xl bg-stone-50 p-8 text-center">
        <p className="text-gray-400">Your shelf is waiting. Finish a book to see it here.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {finished.map((book) => (
        <button
          key={book.id}
          onClick={() => onSelectBook(book.id)}
          className="rounded-lg p-4 text-left shadow-sm hover:shadow-md transition-shadow aspect-[3/4] flex flex-col justify-end"
          style={{ backgroundColor: generateColor(book.title) }}
        >
          <p className="font-medium text-sm text-white drop-shadow-sm leading-snug">
            {book.title}
          </p>
          <p className="text-xs text-white/80 drop-shadow-sm mt-1">
            {book.author}
          </p>
        </button>
      ))}
    </div>
  )
}
