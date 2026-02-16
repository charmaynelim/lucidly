import { useState } from 'react'

const statusStyles = {
  reading: 'bg-amber-100 text-amber-800',
  finished: 'bg-teal-100 text-teal-800',
  abandoned: 'bg-gray-100 text-gray-500',
}

function EditableField({ value, onSave, type = 'text', textarea = false }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const save = () => {
    setEditing(false)
    if (draft !== value) onSave(draft)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !textarea) save()
    if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
    }
  }

  if (!editing) {
    return (
      <span
        onClick={() => { setDraft(value); setEditing(true) }}
        className="cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1"
      >
        {value || <span className="text-gray-300 italic">Click to edit</span>}
      </span>
    )
  }

  if (textarea) {
    return (
      <textarea
        rows={3}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
      />
    )
  }

  return (
    <input
      type={type}
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={handleKeyDown}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 w-full"
    />
  )
}

export default function BookDetail({ book, onUpdate, onDelete, onCollapse }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleFieldSave = (field, value) => {
    onUpdate(book.id, { [field]: value })
  }

  const handleStatusChange = (newStatus) => {
    const updates = { status: newStatus }
    if (newStatus === 'finished' || newStatus === 'abandoned') {
      updates.date_completed = new Date().toISOString().split('T')[0]
    } else {
      updates.date_completed = null
    }
    onUpdate(book.id, updates)
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(book.id)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-5 space-y-4 bg-white">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="font-medium text-lg">
            <EditableField
              value={book.title}
              onSave={(v) => handleFieldSave('title', v)}
            />
          </div>
          <div className="text-sm text-gray-500">
            <EditableField
              value={book.author}
              onSave={(v) => handleFieldSave('author', v)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[book.status]}`}>
            {book.status}
          </span>
          <button
            onClick={onCollapse}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Collapse
          </button>
        </div>
      </div>

      <div className="bg-amber-50/50 rounded-lg p-3">
        <p className="text-xs text-gray-400 mb-1">Why I'm reading this</p>
        <div className="text-sm italic text-gray-700">
          <EditableField
            value={book.intention}
            onSave={(v) => handleFieldSave('intention', v)}
            textarea
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-1">Date started</p>
          <EditableField
            value={book.date_started}
            type="date"
            onSave={(v) => handleFieldSave('date_started', v)}
          />
        </div>
        {(book.status === 'finished' || book.status === 'abandoned') && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Date completed</p>
            <EditableField
              value={book.date_completed || ''}
              type="date"
              onSave={(v) => handleFieldSave('date_completed', v)}
            />
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1">Notes</p>
        <EditableField
          value={book.notes || ''}
          onSave={(v) => handleFieldSave('notes', v)}
          textarea
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex gap-2">
          {book.status === 'reading' && (
            <>
              <button
                onClick={() => handleStatusChange('finished')}
                className="text-xs px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
              >
                Mark as Finished
              </button>
              <button
                onClick={() => handleStatusChange('abandoned')}
                className="text-xs px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Abandon
              </button>
            </>
          )}
          {book.status === 'finished' && (
            <button
              onClick={() => handleStatusChange('reading')}
              className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Resume Reading
            </button>
          )}
          {book.status === 'abandoned' && (
            <button
              onClick={() => handleStatusChange('reading')}
              className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Resume Reading
            </button>
          )}
        </div>
        <div>
          {confirmDelete ? (
            <span className="text-xs text-gray-500">
              Delete {book.title}? This can't be undone.{' '}
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 underline"
              >
                Confirm
              </button>{' '}
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-gray-400 hover:text-gray-600 underline"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={handleDelete}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
