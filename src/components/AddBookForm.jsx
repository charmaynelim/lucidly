import { useState } from 'react'

export default function AddBookForm({ onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0]
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [dateStarted, setDateStarted] = useState(today)
  const [intention, setIntention] = useState('')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const next = {}
    if (!title.trim()) next.title = 'Title is required.'
    if (!author.trim()) next.author = 'Author is required.'
    if (!dateStarted) next.dateStarted = 'Date is required.'
    if (!intention.trim()) next.intention = 'Intention is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSave({
      title: title.trim(),
      author: author.trim(),
      dateStarted,
      intention: intention.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">Add a book</h2>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {errors.author && <p className="text-sm text-red-500 mt-1">{errors.author}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Date started</label>
          <input
            type="date"
            value={dateStarted}
            onChange={(e) => setDateStarted(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {errors.dateStarted && <p className="text-sm text-red-500 mt-1">{errors.dateStarted}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Intention</label>
          <textarea
            rows={3}
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="Why are you reading this?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
          />
          {errors.intention && <p className="text-sm text-red-500 mt-1">{errors.intention}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add book
          </button>
        </div>
      </form>
    </div>
  )
}
