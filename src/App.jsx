import { useState, useEffect } from 'react'
import AuthGate from './components/AuthGate'
import { supabase } from './lib/supabase'
import { fetchBooks } from './lib/booksService'

function Dashboard() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBooks()
      .then(setBooks)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return <p className="p-8 text-gray-500">Loading books...</p>
  if (error) return <p className="p-8 text-red-500">Error: {error.message}</p>

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Lucidly</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Sign out
        </button>
      </div>
      <p className="text-gray-500 mb-4">{books.length} book(s) in your library.</p>
      {books.map((book) => (
        <div key={book.id} className="border-b border-gray-100 py-4">
          <p className="font-medium">{book.title}</p>
          <p className="text-sm text-gray-500">{book.author} · {book.status}</p>
        </div>
      ))}
      {books.length === 0 && (
        <p className="text-gray-400 italic">No books yet. Phase 2 will add the ability to create them.</p>
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
