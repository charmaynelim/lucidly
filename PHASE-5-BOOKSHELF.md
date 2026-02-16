# Phase 5: Bookshelf View (Nice-to-Have)

## Goal

A visual, satisfying view of your reading year. Finished books displayed as a warm, personal shelf that fills up over time. This is the reward layer — purely visual, purely for delight.

## Prerequisites

- Phase 4 is complete: the app is feature-complete (CRUD, pace, notes, export).

---

## Instructions for Claude Code

### Step 1: Create the Bookshelf View

Create `src/components/BookshelfView.jsx`:

**Props:** `books` (full books array), `onSelectBook` (callback when a book is clicked).

**Behavior:**
- Filters for `books.filter(b => b.status === 'finished')`, sorted by `date_completed` ascending (oldest finished first — the shelf fills left-to-right, top-to-bottom, like a timeline of your year).
- Renders a responsive grid of book cards/spines.
- **If 0 finished books:** Show empty state — *"Your shelf is waiting. Finish a book to see it here."*

**Per book card, display:**
- Title (primary text).
- Author (secondary text).
- A background color auto-generated from the book title. Use a deterministic hash function:

```js
function generateColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  // Generate a muted, warm hue
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 35%, 72%)`  // Muted saturation, medium lightness
}
```

- Clicking a card calls `onSelectBook(bookId)`, which navigates to / expands that book in the reading log.

**Design notes:**
- The cards should feel like book spines or covers — vertical orientation if possible, or square cards if horizontal.
- Muted, warm palette. No neon, no harsh contrasts. The shelf should feel like looking at a real bookcase.
- Consider a subtle shadow or depth effect on each card.
- Grid layout: 3–4 columns on desktop, 2 columns on mobile.
- The overall effect should be: the more books you finish, the more visually full and rewarding this page becomes.

### Step 2: Add View Toggle

Modify `src/App.jsx` to add a toggle between the Reading Log and Bookshelf views:

**Behavior:**
- A toggle or tab control below the PaceIndicator and above the Reading Log.
- Two options: "Reading Log" (default) and "Bookshelf."
- Switching between them swaps the content area below.
- The Currently Reading widget and Pace Indicator remain visible in both views — only the list area changes.
- Persist the active view in local state (no need to persist across sessions).

**Implementation:**
- Add `activeView` state: `'log' | 'shelf'`.
- Render either `<ReadingLog />` or `<BookshelfView />` based on state.
- When a book is clicked in BookshelfView, switch to Reading Log view and expand that book.

### Step 3: Transition Animation (Optional Polish)

If you want extra polish, add a subtle transition when switching views:
- A simple fade (opacity 0 → 1) when the view changes.
- CSS transition, no library needed.
- Keep it fast (150–200ms). It should feel snappy, not sluggish.

### Step 4: Test

```bash
npm run dev
```

Verify:
- [ ] Bookshelf view shows only finished books.
- [ ] Books are sorted by date completed (oldest first).
- [ ] Each book has a deterministic, muted background color.
- [ ] Grid is responsive (3–4 columns desktop, 2 mobile).
- [ ] Empty state appears when no books are finished.
- [ ] Clicking a book on the shelf navigates to its detail in the Reading Log.
- [ ] View toggle switches cleanly between Reading Log and Bookshelf.
- [ ] Currently Reading and Pace Indicator remain visible in both views.

---

## Done When

- [ ] `BookshelfView` component with grid of finished books.
- [ ] Deterministic color generation per book.
- [ ] Responsive grid layout.
- [ ] Empty state for zero finished books.
- [ ] Click-to-navigate from shelf to book detail.
- [ ] View toggle between Reading Log and Bookshelf.
- [ ] (Optional) Subtle transition animation between views.

## Files Created / Modified

```
src/
├── App.jsx                        (modified — view toggle)
├── components/
│   └── BookshelfView.jsx          (new)
```

---

## Congratulations

After this phase, Lucidly is complete. You have:

- A cloud-backed reading tracker with Google auth.
- A reading log with full CRUD and status management.
- An intentionality-first design where every book starts with "why."
- A pace indicator that's honest but kind.
- A currently reading hero section that keeps you focused.
- Auto-saving notes for reflection.
- CSV export for data portability.
- A visual bookshelf that rewards your progress.

Now go read.
