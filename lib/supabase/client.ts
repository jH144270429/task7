import { createClient } from "@supabase/supabase-js"
import { getSupabasePublicConfig } from "./shared"
import type { Database } from "./types"

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabasePublicConfig()
  if (!url || !anonKey) return null
  return createClient<Database>(url, anonKey)
}

