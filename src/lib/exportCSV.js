export function exportBooksAsCSV(books) {
  const headers = [
    'Title',
    'Author',
    'Status',
    'Date Started',
    'Date Completed',
    'Intention',
    'Notes',
  ]

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }

  const rows = books.map((book) =>
    [
      book.title,
      book.author,
      book.status,
      book.date_started,
      book.date_completed || '',
      book.intention,
      book.notes || '',
    ]
      .map(escapeCSV)
      .join(',')
  )

  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `lucidly-export-${new Date().toISOString().split('T')[0]}.csv`
  link.click()

  URL.revokeObjectURL(url)
}
