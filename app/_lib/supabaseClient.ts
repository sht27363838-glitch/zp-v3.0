// Safe Supabase shim: builds even when SDK/env are missing.
// If env vars exist *and* the SDK is installed, it will use real Supabase.
// Otherwise, it falls back to a no-op client that returns empty results.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: any = {
  from() { return this },
  select() { return Promise.resolve({ data: [], error: null }) },
  insert() { return Promise.resolve({ data: null, error: null }) },
  update() { return Promise.resolve({ data: null, error: null }) },
  upsert() { return Promise.resolve({ data: null, error: null }) },
  delete() { return Promise.resolve({ data: null, error: null }) },
  rpc() { return Promise.resolve({ data: null, error: null }) },
  auth: { getSession: async () => ({ data: { session: null }, error: null }) }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (url && key) {
  try {
    // Use require to avoid build-time type resolution when package is absent
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require('@supabase/supabase-js')
    supabase = createClient(url, key)
  } catch (e) {
    console.warn('[ZP] Supabase SDK not installed; falling back to no-op client.')
  }
}

export { supabase }
