# Phase 3: Dashboard (Pace Indicator + Currently Reading)

## Goal

The app has a homepage that orients you immediately. You open it and know: what you're reading, why, and whether you're on pace.

## Prerequisites

- Phase 2 is complete: books can be created, edited, filtered, and deleted.

---

## Instructions for Claude Code

### Step 1: Create the Pace Indicator

Create `src/components/PaceIndicator.jsx`:

**Props:** `books` (the full books array).

**Calculation logic:**

```
GOAL = 30
YEAR = 2026

dayOfYear = Math.floor((today - Jan 1) / (1000 * 60 * 60 * 24))
expectedPace = (GOAL / 365) * dayOfYear
finishedCount = books.filter(b => b.status === 'finished').length
delta = finishedCount - expectedPace
daysRemaining = 365 - dayOfYear
booksRemaining = GOAL - finishedCount
```

**Display:**
- A visual progress element: progress bar, arc, or ring showing `finishedCount / 30`.
- Numeric display: "X of 30 books" — the number should be large and prominent.
- Pace message (one of three):
  - **Ahead** (delta >= 1): "You're [Math.floor(delta)] book(s) ahead of pace."
  - **On track** (delta > -1 and delta < 1): "You're right on pace."
  - **Behind** (delta <= -1): "You're [Math.ceil(Math.abs(delta))] book(s) behind. That's okay — you have [daysRemaining] days left."
- The behind message should feel encouraging, not punishing. This is a compass, not a scoreboard.

**Design notes:**
- Keep it compact — this is a summary widget, not a full dashboard.
- Use a warm, muted color palette. Avoid red/green traffic-light semantics. Consider: muted teal for progress, warm gray for the track.
- The progress visual should fill from left to right (bar) or clockwise (arc).

### Step 2: Create the Currently Reading Widget

Create `src/components/CurrentlyReading.jsx`:

**Props:** `books` (the full books array), `onOpenNotes` (callback to navigate to a book's notes).

**Behavior:**
- Filters for `books.filter(b => b.status === 'reading')`, sorted by `date_started` descending.
- **If 0 active books:** Show empty state — *"What's next? Add a book to begin."* with a subtle prompt or button to add a book.
- **If 1–3 active books:** Show each as an `<ActiveBookCard />` in a vertical stack or responsive grid.
- **If 4+ active books:** Same layout, but scrollable. This is an edge case.

**Per active book, display:**
- Title and author.
- Date started (formatted nicely, e.g., "Jan 3").
- **Intention — this is the most visually prominent element.** Larger text, more space, or a distinct visual treatment. The intention should read like a personal note, not metadata.
- A "Notes →" link/button that calls `onOpenNotes(bookId)` — this will scroll to or open the book's detail view with the notes field focused.

Create `src/components/ActiveBookCard.jsx` as a sub-component if needed for cleanliness.

**Design notes:**
- This is the hero section of the app. It should feel warm, spacious, and inviting.
- Consider a subtle background color or card treatment to distinguish it from the reading log below.
- The intention text should feel like reading a sticky note you wrote to yourself — personal, not clinical.

### Step 3: Update the Page Layout in App.jsx

Modify `src/App.jsx` to assemble the full layout:

**Order (top to bottom):**
1. `<Header />` — App title ("Lucidly"), sign out link. Keep it minimal.
2. `<CurrentlyReading />` — Hero section. First thing you see.
3. `<PaceIndicator />` — Below currently reading. Quick glance at progress.
4. `<ReadingLog />` — The full book list below.
   - "Add Book" button.
   - FilterBar.
   - List of BookCards.

**Connecting onOpenNotes:**
- When "Notes →" is clicked in CurrentlyReading, scroll to and expand the corresponding BookCard in the Reading Log, with the notes field visible/focused.
- Implementation: use a `ref` or `id` on each BookCard and scroll it into view. Set an `expandedBookId` state to auto-expand that card.

### Step 4: Extract the Header

Create `src/components/Header.jsx`:

- "Lucidly" as the app name (left-aligned).
- Sign out button/link (right-aligned, subtle).
- Keep it simple and compact. This will later hold the CSV export button in Phase 4.

### Step 5: Test

```bash
npm run dev
```

Verify:
- [ ] Currently Reading section shows at the top of the page.
- [ ] Active books display title, author, date, and intention prominently.
- [ ] Empty state shows when no books are being read.
- [ ] "Notes →" scrolls to / expands the book in the reading log.
- [ ] Pace indicator shows correct finished count out of 30.
- [ ] Pace message is accurate (ahead / on track / behind) based on today's date.
- [ ] Progress visual reflects the ratio correctly.
- [ ] Layout feels like a natural reading flow: what I'm reading → how I'm doing → full list.

---

## Done When

- [ ] `PaceIndicator` with calculation, visual, and pace message.
- [ ] `CurrentlyReading` hero section with intention prominently displayed.
- [ ] `ActiveBookCard` for each active book.
- [ ] Empty state for zero active books.
- [ ] "Notes →" link connects Currently Reading to the Reading Log.
- [ ] `Header` component extracted.
- [ ] Page layout assembled in the correct order.

## Files Created / Modified

```
src/
├── App.jsx                        (modified — new layout)
├── components/
│   ├── Header.jsx                 (new)
│   ├── PaceIndicator.jsx          (new)
│   ├── CurrentlyReading.jsx       (new)
│   └── ActiveBookCard.jsx         (new)
```
