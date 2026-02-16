# Phase 4: Notes + CSV Export

## Goal

The reflection layer is complete. Notes auto-save as you type, and the full reading log is exportable as CSV. After this phase, the app is feature-complete for the MVP.

## Prerequisites

- Phase 3 is complete: pace indicator and currently reading widget are working.

---

## Instructions for Claude Code

### Step 1: Build the Notes Editing Experience

Modify `src/components/BookDetail.jsx` (created in Phase 2):

**Behavior:**
- The notes field is a `<textarea>` within the expanded BookDetail view.
- **Auto-save:** Save to Supabase automatically after the user stops typing. Use a debounce of 1.5 seconds. Do NOT require a "Save" button — the experience should feel like writing in a notebook, not filling out a form.
- Show a subtle save indicator:
  - While typing: nothing (don't distract).
  - After debounce triggers save: brief "Saving..." text.
  - After save completes: brief "Saved" text that fades after 2 seconds.
  - On save error: "Failed to save" in a subtle error color. Keep the local content so nothing is lost.
- **Textarea sizing:** generous default height (at least 6 rows). Should grow with content if possible (auto-resize), or use a tall fixed height with scroll.
- **Placeholder text:** *"Your notes, highlights, reflections..."*
- Notes are optional — an empty notes field is perfectly fine.

**Implementation detail:**
- Use a local state for the textarea value (so typing is instant/responsive).
- On debounce timeout, call `updateBook(id, { notes: localValue })`.
- On blur, also trigger a save (in case the user clicks away before the debounce fires).
- Update the parent `books` state after a successful save.

### Step 2: Connect Notes from Currently Reading

Update `src/components/CurrentlyReading.jsx` and `src/App.jsx`:

**Behavior:**
- The "Notes →" link on each ActiveBookCard should:
  1. Scroll the page to the corresponding BookCard in the Reading Log.
  2. Expand that BookCard to show BookDetail.
  3. Focus the notes textarea.
- Implementation: when "Notes →" is clicked, set `expandedBookId` state to the book's ID, then use `document.getElementById('book-' + id)?.scrollIntoView({ behavior: 'smooth' })`. Each BookCard should have `id={'book-' + book.id}` on its container. After expansion and scroll, call `.focus()` on the textarea via a ref.

### Step 3: Build CSV Export

Create `src/lib/exportCSV.js`:

```js
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
    // Wrap in quotes if contains comma, newline, or quote
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
```

### Step 4: Add Export Button to Header

Modify `src/components/Header.jsx`:

- Add a "Export CSV" button or link to the right side of the header, near the sign out button.
- On click, call `exportBooksAsCSV(books)`.
- The `books` array needs to be passed down as a prop to Header, or the export function can be triggered via a callback from App.
- Style it subtly — it's a utility action, not a primary CTA. A text link or small button is fine.

### Step 5: Test

```bash
npm run dev
```

Verify:
- [ ] Notes textarea appears in BookDetail when expanded.
- [ ] Typing in notes auto-saves after ~1.5 seconds of inactivity.
- [ ] "Saving..." and "Saved" indicators appear and disappear correctly.
- [ ] Refreshing the page after typing notes shows the saved content.
- [ ] "Notes →" from Currently Reading scrolls to, expands, and focuses the book's notes.
- [ ] Export CSV button appears in the header.
- [ ] Clicking it downloads a `.csv` file.
- [ ] The CSV opens correctly in Excel/Google Sheets with all columns and proper escaping.
- [ ] Notes with commas, quotes, and line breaks are correctly escaped in the CSV.

---

## Done When

- [ ] Notes textarea with auto-save (debounced 1.5s + save on blur).
- [ ] Save status indicator (Saving / Saved / Failed).
- [ ] Notes textarea auto-grows or has generous fixed height.
- [ ] "Notes →" from Currently Reading scrolls to and focuses notes.
- [ ] CSV export function with proper escaping.
- [ ] Export button in Header.
- [ ] Downloaded CSV is well-formed and opens in spreadsheet apps.

## Files Created / Modified

```
src/
├── App.jsx                        (modified — pass books to Header)
├── lib/
│   └── exportCSV.js               (new)
├── components/
│   ├── Header.jsx                 (modified — export button)
│   ├── BookDetail.jsx             (modified — notes auto-save)
│   └── CurrentlyReading.jsx       (modified — scroll-to-notes)
```
