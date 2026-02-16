'use server'

import { createClient } from '@/lib/supabase/server' 

const supabase = await createClient()

// OVO NECU KORISTITI
export async function signUpNewUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      emailRedirectTo: 'localhost:3000/',
    },
  })
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) return null
  return user
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  }
}