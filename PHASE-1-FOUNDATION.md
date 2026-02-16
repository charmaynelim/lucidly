# Phase 1: Foundation (Data + Auth + Deployment)

## Goal

A working backend with auth and a connected React shell, deployed to Vercel. By the end of this phase, you can log in with Google, and the app reads/writes to a real database.

## Prerequisites (Manual Setup — Do These Before Running Claude Code)

These steps require browser-based account creation and cannot be automated:

### 1. Create a Supabase Project
- Go to https://supabase.com and create a free account.
- Create a new project. Name it `lucidly`. Choose a region close to you.
- Once the project is created, go to **Settings → API** and note:
  - `SUPABASE_URL` (e.g., `https://xxxxx.supabase.co`)
  - `SUPABASE_ANON_KEY` (the `anon` / `public` key)

### 2. Set Up the Database
- Go to the **SQL Editor** in Supabase and run this:

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

### 3. Enable Google OAuth
- In Supabase, go to **Authentication → Providers → Google**.
- Enable it. You'll need to create a Google OAuth client:
  - Go to https://console.cloud.google.com → APIs & Services → Credentials.
  - Create an OAuth 2.0 Client ID (Web application).
  - Add `https://xxxxx.supabase.co/auth/v1/callback` as an authorized redirect URI (use your Supabase project URL).
  - Copy the Client ID and Client Secret back into Supabase.

### 4. Create a Vercel Account
- Go to https://vercel.com and sign up (free tier).
- You'll connect your Git repo after the code is scaffolded.

---

## Instructions for Claude Code

After the prerequisites above are done, execute the following:

### Step 1: Scaffold the React App

```bash
npm create vite@latest lucidly -- --template react
cd lucidly
npm install
npm install @supabase/supabase-js
npm install -D tailwindcss @tailwindcss/vite
```

### Step 2: Configure Tailwind

Update `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Replace the contents of `src/index.css` with:

```css
@import "tailwindcss";
```

### Step 3: Create Environment Variables

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Create `.env.example` as a template (committed to Git):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Add `.env.local` to `.gitignore`.

### Step 4: Create the Supabase Client

Create `src/lib/supabase.js`:

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 5: Create the Books Service

Create `src/lib/booksService.js`:

```js
import { supabase } from './supabase'

export async function fetchBooks() {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('date_started', { ascending: false })
  if (error) throw error
  return data
}

export async function createBook({ title, author, dateStarted, intention }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('books')
    .insert({
      user_id: user.id,
      title,
      author,
      date_started: dateStarted,
      intention,
      status: 'reading',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBook(id, updates) {
  const { data, error } = await supabase
    .from('books')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBook(id) {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id)
  if (error) throw error
}
```

### Step 6: Create the Auth Gate

Create `src/components/AuthGate.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-semibold">Lucidly</h1>
        <p className="text-gray-500">Track your reading with intention.</p>
        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return children
}
```

### Step 7: Wire Up App.jsx

Replace `src/App.jsx` with:

```jsx
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
```

### Step 8: Clean Up Boilerplate

- Delete `src/App.css`.
- Remove any references to `App.css` from imports.
- Replace `public/vite.svg` with a simple favicon or remove it.
- Update `index.html`: set `<title>Lucidly</title>`.

### Step 9: Test Locally

```bash
npm run dev
```

Verify:
- [ ] The login screen appears with "Sign in with Google."
- [ ] Google OAuth redirects and returns you to the app.
- [ ] The dashboard shows "0 book(s) in your library."
- [ ] Sign out works.

### Step 10: Deploy to Vercel

- Initialize a Git repo and push to GitHub.
- Connect the repo to Vercel.
- Add environment variables in Vercel project settings:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Deploy. Update the Google OAuth redirect URI in both Google Cloud Console and Supabase to include your Vercel production URL.

---

## Done When

- [ ] React app scaffolded with Vite + Tailwind.
- [ ] Supabase client configured and connected.
- [ ] `booksService` module with fetchBooks, createBook, updateBook, deleteBook.
- [ ] Google OAuth login/logout working.
- [ ] Dashboard renders books from the database (empty list is fine).
- [ ] Deployed to Vercel and accessible via a public URL.

## Files Created

```
lucidly/
├── .env.local
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── index.css
│   ├── main.jsx
│   ├── App.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   └── booksService.js
│   └── components/
│       └── AuthGate.jsx
```
