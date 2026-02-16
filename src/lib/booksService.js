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
