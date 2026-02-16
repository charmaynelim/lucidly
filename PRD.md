# Lucidly — Product Requirements Document

## Product Vision

Lucidly is a personal reading tracker that helps you read 30 books in 2026 — not by optimizing for volume, but by grounding every book in purpose. The core question it asks isn't "how many?" but **"why this book, right now?"**

The product reflects a single value: **intentionality**. Every feature should slow you down just enough to read with direction, and then get out of the way.

---

## Target User

Solo tool. One person, one year, one reading practice. No social features, no sharing, no community.

---

## Core Jobs to Be Done

| Job | Description |
|-----|-------------|
| **Set direction** | Before starting a book, articulate *why* you're reading it. |
| **Track progress** | Know where you stand against your 30-book goal, without anxiety. |
| **Capture thinking** | Store notes, highlights, and reflections per book in a freeform space. |
| **Stay present** | Keep the current book(s) front and center so focus doesn't scatter. |
| **Look back** | See the full arc of your reading year at a glance. |

---

## Information Architecture

```
Lucidly
├── Auth Gate (Google login via Supabase)
│
├── Currently Reading (hero section)
│   ├── Book title + author (supports multiple active books)
│   ├── Intention ("Why I'm reading this")
│   ├── Date started
│   └── Quick access to notes
│
├── Pace Dashboard
│   ├── Books finished: X / 30
│   ├── Pace status (ahead / on track / behind)
│   └── Visual progress indicator
│
├── Reading Log (primary list)
│   ├── Add new book
│   ├── Per book:
│   │   ├── Title
│   │   ├── Author
│   │   ├── Date started
│   │   ├── Status (reading / finished / abandoned) + date completed
│   │   ├── Intention field (editable)
│   │   └── Notes / annotations space
│   ├── Filter: All / Currently Reading / Finished / Abandoned
│   ├── Sort: Date started (newest first)
│   └── Export as CSV
│
└── Bookshelf View (nice-to-have, post-MVP)
    └── Visual grid of finished books
```

---

## Data Model

### Books Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | uuid | auto | Primary key, auto-generated |
| `user_id` | uuid | auto | References auth.users, set from session |
| `title` | text | yes | Book title |
| `author` | text | yes | Author name |
| `date_started` | date | yes | When you began reading |
| `status` | text | yes | One of: `reading`, `finished`, `abandoned` |
| `date_completed` | date | no | When you finished or abandoned (null while reading) |
| `intention` | text | yes | "Why I'm reading this" — editable at any time |
| `notes` | text | no | Freeform annotations, reflections, highlights |
| `created_at` | timestamptz | auto | Record creation time |
| `updated_at` | timestamptz | auto | Last modification time |

### Status Transitions

```
reading → finished      (date_completed auto-set to today, editable)
reading → abandoned     (date_completed auto-set to today, editable)
abandoned → reading     (date_completed cleared)
finished → reading      (date_completed cleared)
```

Only books with `status: finished` count toward the 30-book goal.

### Database Schema (Supabase PostgreSQL)

```sql
create table books (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) not null,
  title           text not null,
  author          text not null,
  date_started    date not null,
  status          text not null default 'reading'
                  check (status in ('reading', 'finished', 'abandoned')),
  date_completed  date,
  intention       text not null,
  notes           text default '',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table books enable row level security;

create policy "Users manage own books"
  on books for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_books_user_status on books(user_id, status);
```

---

## Feature Specifications

### 1. Currently Reading Widget

- Displays all books with `status === 'reading'`, sorted by `date_started` descending.
- Shows title, author, date started, and **intention prominently** (intention is more visually emphasized than the title).
- Handles 1–3 active books gracefully. 4+ scrolls.
- One-tap access to open notes for any active book.
- Empty state: *"What's next? Add a book to begin."*

### 2. Pace Indicator

- Calculates: `expectedPace = (30 / 365) × dayOfYear`
- Compares to `finishedCount` (books where `status === 'finished'`).
- Three states:
  - **Ahead:** "You're X book(s) ahead of pace."
  - **On track:** "You're right on pace."
  - **Behind:** "You're X book(s) behind. That's okay — you have Y days left."
- Visual progress bar or arc showing `finished / 30`.
- The "behind" state is never punishing. Honest but kind.

### 3. Reading Log

- Full CRUD: add, view, edit, delete books.
- **Add book form:** title, author, date started, intention (required). Status defaults to `reading`.
- **Status transitions:** buttons to move between reading/finished/abandoned. `date_completed` auto-populates on finish/abandon, clears on resume.
- **Filter:** All / Reading / Finished / Abandoned.
- **Sort:** Date started, newest first.
- **Delete:** With confirmation.

### 4. Notes / Annotations

- One freeform textarea per book. No templates, no structure imposed.
- Auto-saves on blur or after 1–2 seconds of inactivity (debounced).
- Accessible from book detail view and from the Currently Reading widget.

### 5. CSV Export

- Button in header. Client-side only.
- Columns: Title, Author, Status, Date Started, Date Completed, Intention, Notes.
- Notes field quoted and escaped for commas/line breaks.
- Triggers browser download.

### 6. Bookshelf View (Nice-to-Have, Post-MVP)

- Grid of finished books as cards/spines.
- Color auto-generated from title hash.
- Ordered by `date_completed`.
- Tap to open book detail.

---

## Design Principles

1. **Intention first.** The "why" is always more prominent than the "what" or "how many."
2. **Honest, not anxious.** Progress tracking informs, never pressures.
3. **Quiet confidence.** Calm, warm, unhurried — like a reading nook, not a dashboard.
4. **Friction where it matters.** Requiring an intention is deliberate.
5. **No friction where it doesn't.** Notes are optional. Marking finished is one tap.

---

## What This Product Is Not

- Not a social platform.
- Not a recommendation engine.
- Not a habit tracker (no streaks, no gamification).
- Not a knowledge management system.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18+ (Vite) |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL + Auth + Row-Level Security) |
| Auth | Google OAuth via Supabase |
| Deployment | Vercel (free tier) |
| Cost | $0/month |

---

## Component Architecture

```
<App>
├── <AuthGate />                  — Google login
├── <Header />                    — App title, goal summary, CSV export button
├── <PaceIndicator />             — Progress toward 30 books
├── <CurrentlyReading />          — Hero section for active book(s)
│   └── <ActiveBookCard />        — Individual currently-reading book
├── <ReadingLog />                — Book list with filters
│   ├── <AddBookForm />           — Modal or inline form
│   ├── <FilterBar />             — All / Reading / Finished / Abandoned
│   └── <BookCard />              — Individual book entry
│       └── <BookDetail />        — Expanded view with notes + intention
└── <BookshelfView />             — Visual grid (post-MVP)
```

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| Abandoned book notes | No special "why I stopped" field. Intention and notes preserved as-is. |
| Year rollover | Nothing happens. App keeps accumulating books. Multi-year is a future feature. |
| Offline behavior | Not required. App assumes internet connection. |
| Multiple concurrent books | Supported. UI optimized for 1–3 active books. |
| Intention editability | Editable at any time. |
| Platform | Web app (React), deployed to Vercel. |
| Product name | **Lucidly** |

---

## Success Metric

Did you read 30 books this year, and do you remember why you read each one?
