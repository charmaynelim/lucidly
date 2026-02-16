import ActiveBookCard from './ActiveBookCard'

export default function CurrentlyReading({ books, onOpenNotes, onAddBook }) {
  const activeBooks = books
    .filter((b) => b.status === 'reading')
    .sort((a, b) => new Date(b.date_started) - new Date(a.date_started))

  if (activeBooks.length === 0) {
    return (
      <div className="rounded-xl bg-stone-50 p-8 text-center">
        <p className="text-gray-400 mb-3">What's next? Add a book to begin.</p>
        <button
          onClick={onAddBook}
          className="text-sm px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Add book
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
        Currently Reading
      </h2>
      {activeBooks.map((book) => (
        <ActiveBookCard key={book.id} book={book} onOpenNotes={onOpenNotes} />
      ))}
    </div>
  )
}
