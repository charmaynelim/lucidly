import { useState, useEffect, useRef } from 'react'
import BookDetail from './BookDetail'

const statusStyles = {
  reading: 'bg-amber-100 text-amber-800',
  finished: 'bg-teal-100 text-teal-800',
  abandoned: 'bg-gray-100 text-gray-500',
}

export default function BookCard({ book, onUpdate, onDelete, forceExpand, onExpanded }) {
  const [expanded, setExpanded] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (forceExpand) {
      setExpanded(true)
      if (onExpanded) onExpanded()
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    }
  }, [forceExpand, onExpanded])

  const truncatedIntention =
    book.intention && book.intention.length > 100
      ? book.intention.slice(0, 100) + '…'
      : book.intention

  if (expanded) {
    return (
      <div ref={ref}>
        <BookDetail
          book={book}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onCollapse={() => setExpanded(false)}
        />
      </div>
    )
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setExpanded(true)}
      className="w-full text-left border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium truncate">{book.title}</p>
          <p className="text-sm text-gray-500">{book.author}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusStyles[book.status]}`}
        >
          {book.status}
        </span>
      </div>
      {truncatedIntention && (
        <p className="mt-2 text-sm text-gray-600 italic">{truncatedIntention}</p>
      )}
      <p className="mt-1 text-xs text-gray-400">
        Started {book.date_started}
      </p>
    </button>
  )
}
