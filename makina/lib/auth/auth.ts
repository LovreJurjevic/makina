'use server'

import { createClient } from '@/lib/supabase/server'

// OVO NECU KORISTITI
export async function signUpNewUser(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: 'localhost:3000/',
    },
  })
  return { data, error }
}

export async function login(email: string, password: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
  return { data, error }
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) return null
  return user
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  }
  return { error }
}