import { useState, useEffect, useCallback } from 'react'
import AuthGate from './components/AuthGate'
import Header from './components/Header'
import CurrentlyReading from './components/CurrentlyReading'
import PaceIndicator from './components/PaceIndicator'
import AddBookForm from './components/AddBookForm'
import BookCard from './components/BookCard'
import FilterBar from './components/FilterBar'
import { supabase } from './lib/supabase'
import { fetchBooks, createBook, updateBook, deleteBook } from './lib/booksService'

function Dashboard() {
  const [books, setBooks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedBookId, setExpandedBookId] = useState(null)

  useEffect(() => {
    fetchBooks()
      .then(setBooks)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleOpenNotes = useCallback((bookId) => {
    setFilter('all')
    setExpandedBookId(bookId)
  }, [])

  const handleClearExpand = useCallback(() => {
    setExpandedBookId(null)
  }, [])

  const handleAddBook = async (bookData) => {
    setShowAddForm(false)
    const tempId = crypto.randomUUID()
    const optimistic = {
      id: tempId,
      ...bookData,
      date_started: bookData.dateStarted,
      status: 'reading',
      date_completed: null,
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setBooks((prev) => [optimistic, ...prev])

    try {
      const saved = await createBook(bookData)
      setBooks((prev) => prev.map((b) => (b.id === tempId ? saved : b)))
    } catch (err) {
      setBooks((prev) => prev.filter((b) => b.id !== tempId))
      setError(err)
    }
  }

  const handleUpdateBook = async (id, updates) => {
    const original = books.find((b) => b.id === id)
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    )

    try {
      const saved = await updateBook(id, updates)
      setBooks((prev) => prev.map((b) => (b.id === id ? saved : b)))
    } catch (err) {
      setBooks((prev) =>
        prev.map((b) => (b.id === id ? original : b))
      )
      setError(err)
    }
  }

  const handleDeleteBook = async (id) => {
    const original = books.find((b) => b.id === id)
    setBooks((prev) => prev.filter((b) => b.id !== id))

    try {
      await deleteBook(id)
    } catch (err) {
      setBooks((prev) => [...prev, original].sort(
        (a, b) => new Date(b.date_started) - new Date(a.date_started)
      ))
      setError(err)
    }
  }

  const filteredBooks =
    filter === 'all' ? books : books.filter((b) => b.status === filter)

  if (loading) return <p className="p-8 text-gray-500">Loading books...</p>

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Header onSignOut={handleLogout} books={books} />

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex justify-between items-center">
          <span>Something went wrong: {error.message}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      <section className="mb-8">
        <CurrentlyReading
          books={books}
          onOpenNotes={handleOpenNotes}
          onAddBook={() => setShowAddForm(true)}
        />
      </section>

      <section className="mb-8">
        <PaceIndicator books={books} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Reading Log
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add book
          </button>
        </div>

        <div className="mb-4">
          <FilterBar activeFilter={filter} onChange={setFilter} books={books} />
        </div>

        <div className="space-y-3">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onUpdate={handleUpdateBook}
              onDelete={handleDeleteBook}
              forceExpand={expandedBookId === book.id}
              onExpanded={handleClearExpand}
            />
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <p className="text-gray-400 italic mt-6">
            {filter === 'all'
              ? 'No books yet. Add one to get started.'
              : `No ${filter} books.`}
          </p>
        )}
      </section>

      {showAddForm && (
        <AddBookForm
          onSave={handleAddBook}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  )
}
