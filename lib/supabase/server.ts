import { createClient } from "@supabase/supabase-js"
import { getSupabasePublicConfig, getSupabaseServiceRoleKey } from "./shared"
import type { Database } from "./types"

export function createServerSupabaseClient() {
  const { url, anonKey } = getSupabasePublicConfig()
  if (!url || !anonKey) return null
  return createClient<Database>(url, anonKey)
}

export function createServiceRoleSupabaseClient() {
  const { url } = getSupabasePublicConfig()
  const serviceRoleKey = getSupabaseServiceRoleKey()
  if (!url || !serviceRoleKey) return null
  return createClient<Database>(url, serviceRoleKey)
}

