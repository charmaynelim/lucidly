# CLAUDE.md

## Project: Lucidly — Intentional Reading Tracker

## Overview

Lucidly is a solo-user web app (React + Vite + Supabase) for tracking reading progress toward a 30-book annual goal. It emphasizes intentionality — every book requires a "why" before you begin. There is no server-side rendering, no API routes, no backend code. The app is a static SPA that talks directly to Supabase.

Read `PRD.md` for the full product spec. Read the `PHASE-*.md` files for build instructions.

## Tech Stack

- **Frontend:** React 18+ (Vite), Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Row-Level Security)
- **Auth:** Google OAuth via Supabase
- **Deployment:** Vercel (static site)
- **Language:** JavaScript (not TypeScript — keep it simple for a solo project)

---

## Critical Architecture Rules

### Security (NEVER violate)

- **NEVER put secrets in client code.** This is a client-only SPA — there is no server. The only keys that should exist in this project are `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, both of which are designed to be public.
- **NEVER use a Supabase service role key.** This project has no server, no API routes, no edge functions. There is no place for a service role key. All database access goes through the anon client + RLS. If you think you need a service role key, you are solving the wrong problem.
- **NEVER trust the client for `user_id`.** When inserting rows, always get the user ID from `supabase.auth.getUser()` at call time. Never accept `user_id` as a parameter from a component.
- **NEVER disable Row-Level Security.** RLS is the entire security model. The anon key is public — RLS is what prevents one user from reading another's data. Every table must have RLS enabled with appropriate policies.
- **NEVER store tokens, sessions, or auth state in localStorage manually.** Supabase handles session persistence internally. Do not implement custom token storage.

### Supabase Client Pattern

There is exactly **one** Supabase client in this project:

```
src/lib/supabase.js — single client instance, uses VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
```

- Do NOT create multiple client instances.
- Do NOT create a "server client" or "admin client" — there is no server.
- Do NOT import `createClient` anywhere except `src/lib/supabase.js`. Every other file imports the client from there.

### Environment Variables

- `VITE_SUPABASE_URL` — Supabase project URL. Safe for client (it's a public URL).
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous/public key. Safe for client (designed to be public, scoped by RLS).
- **There are no server-only environment variables in this project.** If you're adding one, stop and reconsider the architecture.
- `.env.local` is gitignored. `.env.example` is committed as a template.

### Database & RLS

- **RLS is ON for all tables.** Design with this assumption at all times.
- The `books` table has a single policy: users can select, insert, update, and delete only their own rows (`auth.uid() = user_id`).
- When inserting a book, the `booksService` must fetch `user_id` from `supabase.auth.getUser()` — never accept it as a function parameter.
- `date_completed` should be set/cleared by the service layer on status transitions, not passed raw from the UI.
- All queries to the `books` table automatically scope to the current user via RLS — you do not need to add `.eq('user_id', ...)` to select queries.

### Data Flow

```
Component → booksService function → Supabase client → Supabase (PostgreSQL + RLS)
```

- Components NEVER import or use the Supabase client directly.
- All database operations go through `src/lib/booksService.js`.
- `booksService` is the only file that imports from `src/lib/supabase.js`.
- This keeps the data layer centralized — if anything about the database changes, only `booksService` needs to update.

### Auth Flow

- Auth is handled by `<AuthGate />`, which wraps the entire app.
- Use `supabase.auth.signInWithOAuth({ provider: 'google' })` for login.
- Use `supabase.auth.signOut()` for logout.
- Session state is managed via `supabase.auth.onAuthStateChange()`.
- No child component should ever call auth methods directly — auth lives in `AuthGate` and `Header` (for sign out).

---

## File Organization

```
src/
├── main.jsx                    # Entry point. Mounts <App />.
├── App.jsx                     # Layout: AuthGate → Header → CurrentlyReading → Pace → Log
├── index.css                   # Tailwind imports
├── lib/
│   ├── supabase.js             # Single Supabase client instance. ONLY file that calls createClient.
│   ├── booksService.js         # All CRUD operations. ONLY file that imports supabase.js.
│   └── exportCSV.js            # CSV generation + download. Pure function, no Supabase dependency.
└── components/
    ├── AuthGate.jsx            # Auth wrapper. Renders children only if authenticated.
    ├── Header.jsx              # App title, sign out, CSV export button.
    ├── PaceIndicator.jsx       # Progress toward 30 books. Pure display, receives books as prop.
    ├── CurrentlyReading.jsx    # Hero section for active books. Receives books as prop.
    ├── ActiveBookCard.jsx      # Single active book card (sub-component of CurrentlyReading).
    ├── AddBookForm.jsx         # Modal/form for adding a new book.
    ├── FilterBar.jsx           # Filter toggle: All / Reading / Finished / Abandoned.
    ├── BookCard.jsx            # Compact book entry in the reading log.
    ├── BookDetail.jsx          # Expanded view with inline editing, notes, status transitions.
    └── BookshelfView.jsx       # Visual grid of finished books (Phase 5).
```

### Rules

- **No new files in `src/lib/` without a clear reason.** The data layer should stay thin.
- **Components are in `src/components/`.** No nesting, no subdirectories. The app is small enough that a flat structure is fine.
- **No `utils.js` or `helpers.js` grab-bags.** If a utility is needed, name the file after what it does (e.g., `exportCSV.js`).

---

## Code Style

- **JavaScript, not TypeScript.** This is a solo project. Keep the tooling lean.
- **Functional components only.** No class components.
- **Named exports for components.** Default exports only for the component that matches the filename.
- **Destructure props.** `function BookCard({ book, onExpand })` not `function BookCard(props)`.
- **Handle errors explicitly.** Every Supabase call can fail — catch errors and surface them to the user. Never swallow errors silently.
- **No `console.log` in committed code** except for error logging (`console.error` is fine).
- **Prefer early returns.** Check for loading/error/empty states at the top of a component, then render the happy path.

---

## State Management

- **No state management library.** React `useState` and `useReducer` are sufficient.
- **`books` is the single source of truth.** It lives in `App.jsx` and is passed down as props.
- **Optimistic updates:** Update local state immediately on user action, then sync to Supabase in the background. Roll back on error.
- **No derived state in state.** `filteredBooks` and `finishedCount` are computed from `books` at render time, not stored separately.
- **Filter state** (`activeFilter`) lives in `App.jsx` alongside `books`.

---

## Design & UX Constraints

- **Intention is always the most visually prominent text** on any book card or detail view — more prominent than the title.
- **The "behind pace" message is never punishing.** Always pair it with encouragement or remaining days.
- **No gamification.** No streaks, points, badges, or achievements.
- **No red/green status colors.** Use warm, muted tones: amber/ochre for reading, teal for finished, gray for abandoned.
- **Minimal UI.** When in doubt, leave it out. The app should feel like a reading nook, not a productivity dashboard.
- **The intention field is required when adding a book.** This is a deliberate product decision. Do not make it optional.

---

## Common Mistakes to Avoid

1. **Don't add a service role key.** There is no server. If RLS prevents an operation, fix the policy — don't bypass it.
2. **Don't create separate Supabase clients** for different "contexts." One client, one file.
3. **Don't call Supabase from components.** Always go through `booksService`.
4. **Don't store `user_id` in component state** or pass it around. Fetch it from `supabase.auth.getUser()` inside `booksService` when needed.
5. **Don't add dependencies without a clear need.** No state libraries, no form libraries, no animation libraries. Tailwind + React is the entire frontend stack.
6. **Don't over-engineer for multi-user or multi-year.** This is a solo app for 2026. Build for that.

---

## Working Style

- Before each action, print a one-line summary of what you're about to do. Example: "→ Scaffolding React app with Vite..."
- Keep explanations concise. Don't narrate — just build.
- After completing a step, confirm it with a one-liner. Example: "✓ Supabase client configured."

## Error Handling

If something fails, stop and tell me three things:

1. **What failed and why** — the actual error, not a guess.
2. **How to check the state** — a command I can run or a file I can look at to verify.
3. **What to do next** — explicitly recommend one of: retry, skip, or troubleshoot (with steps).

Do not silently retry or work around failures. I want to know about them.

## Manual Steps

If ANY step requires me to do something outside of Claude Code — creating an account, clicking something in a browser, copying a key, configuring a dashboard — STOP and tell me before proceeding. Format it like this:

⚠️ MANUAL STEP REQUIRED:
[What I need to do]
[Where to do it (URL or location)]
[What to copy/paste back to you when done]

Then wait for me to confirm before continuing.

---

## Session Management

When I say **"end session"**, stop all work and do the following three things:

### 1. Session Summary
Write a concise summary of what happened this session. Include:
- What was built, changed, or fixed.
- Any decisions made during the session.
- Any errors encountered and how they were resolved (or not).
- Files created or modified (list them).

### 2. Progress Check
Tell me exactly where we stand:
- Which phase are we in?
- What steps within that phase are done vs. remaining?
- Are there any open issues, broken states, or things that need manual attention before the next session?
- A simple checklist using the "Done When" criteria from the current phase file.

### 3. Resumption Prompt
Write a ready-to-paste prompt I can use to kick off the next Claude Code session. It should:
- Tell Claude which files to read for context.
- Summarize what's already done (so Claude doesn't redo work).
- State exactly what to do next.
- Carry forward any unresolved issues or context that would otherwise be lost.
- Include the same working style, error handling, and manual step rules from the original kickoff prompt.

Format it as a code block I can copy directly.
