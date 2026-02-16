# Phase 2: Core Loop (Add + View + Edit + Delete Books)

## Goal

The reading log is fully functional. You can add books, edit them, change their status, filter the list, and delete entries. After this phase, the app is usable for real.

## Prerequisites

- Phase 1 is complete: auth works, `booksService` exists, app is deployed.

---

## Instructions for Claude Code

All work happens inside the `lucidly/` project created in Phase 1. Do not re-scaffold.

### Step 1: Create the Add Book Form

Create `src/components/AddBookForm.jsx`:

**Behavior:**
- A modal (or slide-out panel) triggered by an "Add book" button.
- Fields: Title (text, required), Author (text, required), Date Started (date picker, required, defaults to today), Intention (textarea, required).
- Intention is the largest field — use a textarea with a warm placeholder: *"Why are you reading this?"*
- On submit: call `createBook()` from booksService, close the modal, and add the new book to local state (optimistic update).
- Validation: all four fields required. Show inline errors if empty on submit.
- Cancel button to close without saving.

**Design notes:**
- The intention field should feel like a journal prompt, not a form input. Make it visually generous (at least 3 rows).
- The form should feel calm, not like a data entry screen.

### Step 2: Create the Book Card

Create `src/components/BookCard.jsx`:

**Behavior:**
- Compact card showing: title (bold), author, status badge, date started, and a truncated intention preview (first ~100 characters, with ellipsis).
- Status badges:
  - `reading` — subtle warm color (e.g., amber/ochre).
  - `finished` — subtle green/teal.
  - `abandoned` — subtle muted gray.
- Clicking the card expands it to show the full `BookDetail` view (inline expand, not a new page).
- Do NOT show notes in the compact card view — only in the expanded detail.

### Step 3: Create the Book Detail (Expanded View)

Create `src/components/BookDetail.jsx`:

**Behavior:**
- Shown when a BookCard is expanded. Displays all fields.
- **Editable fields** (inline editing — click to edit, blur or Enter to save):
  - Title
  - Author
  - Date Started
  - Date Completed (only visible when status is `finished` or `abandoned`)
  - Intention (textarea)
- **Status transitions** — buttons/controls:
  - If `reading`: show "Mark as Finished" and "Abandon" buttons.
  - If `finished`: show "Resume Reading" button.
  - If `abandoned`: show "Resume Reading" button.
  - On status change to `finished` or `abandoned`: auto-set `date_completed` to today (editable).
  - On status change to `reading`: clear `date_completed`.
- **Delete** — a small, non-prominent delete button (e.g., text link or icon at the bottom). Show a confirmation dialog: *"Delete [title]? This can't be undone."*
- All edits call `updateBook()` from booksService. Use optimistic local state updates.
- Notes field is visible here but will be fully built in Phase 4. For now, show a placeholder textarea that saves via `updateBook()`.

### Step 4: Create the Filter Bar

Create `src/components/FilterBar.jsx`:

**Behavior:**
- Horizontal row of filter options: All / Reading / Finished / Abandoned.
- "All" is the default active filter.
- Filters are mutually exclusive (select one at a time).
- Show a count next to each filter: e.g., "Reading (2)", "Finished (5)".
- Filtering is client-side — filter the `books` array in state, no new API calls.
- Style the active filter distinctly (e.g., bold, underline, or filled background).

### Step 5: Update the Dashboard in App.jsx

Refactor `src/App.jsx` to incorporate the new components:

**Layout (top to bottom):**
1. Header — "Lucidly" title + sign out button.
2. "Add Book" button — opens AddBookForm modal.
3. FilterBar.
4. Reading Log — list of BookCards, filtered and sorted by `date_started` descending.

**State management:**
- `books` array loaded from `fetchBooks()` on mount.
- `filter` state: `'all' | 'reading' | 'finished' | 'abandoned'`.
- `filteredBooks` derived: filter the books array based on active filter.
- When a book is created/updated/deleted: update local `books` state directly (optimistic), and the API call happens in the background.
- If an API call fails, roll back the local state and show an error toast or message.

**Sorting:**
- Books sorted by `date_started`, newest first. No user-configurable sort for now.

### Step 6: Test

```bash
npm run dev
```

Verify:
- [ ] "Add Book" button opens a form/modal.
- [ ] All four fields are required. Submitting with empty fields shows errors.
- [ ] A new book appears in the reading log immediately after creation.
- [ ] Book cards show title, author, status badge, date, and truncated intention.
- [ ] Clicking a card expands it to show all details.
- [ ] Inline editing works for title, author, dates, and intention.
- [ ] "Mark as Finished" changes status and sets date_completed.
- [ ] "Abandon" changes status and sets date_completed.
- [ ] "Resume Reading" returns status to reading and clears date_completed.
- [ ] Delete works with confirmation.
- [ ] Filter bar correctly filters the list. Counts are accurate.
- [ ] Refreshing the page loads all books from the database (data persists).

---

## Done When

- [ ] AddBookForm with validation (intention required).
- [ ] BookCard with compact view and status badge.
- [ ] BookDetail with inline editing and status transitions.
- [ ] FilterBar with All / Reading / Finished / Abandoned + counts.
- [ ] Full CRUD working against Supabase.
- [ ] Optimistic UI updates with error handling.
- [ ] Sorted by date_started, newest first.

## Files Created / Modified

```
src/
├── App.jsx                    (modified — new layout with components)
├── components/
│   ├── AuthGate.jsx           (unchanged)
│   ├── AddBookForm.jsx        (new)
│   ├── BookCard.jsx           (new)
│   ├── BookDetail.jsx         (new)
│   └── FilterBar.jsx          (new)
```
