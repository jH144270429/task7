"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { LoginForm } from "./LoginForm"
import { useSupabaseAuth } from "@/lib/supabase/useSupabaseAuth"

export function UserMenu() {
  const { supabase, session, ready } = useSupabaseAuth()
  const [open, setOpen] = useState(false)
  const email = useMemo(() => session?.user.email ?? null, [session])
  const avatarLabel = useMemo(() => {
    if (!email) return "U"
    const trimmed = email.trim()
    if (!trimmed) return "U"
    return trimmed[0]?.toUpperCase() ?? "U"
  }, [email])

  if (!ready) return null

  if (!session) {
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Sign in
        </Button>
        <Modal open={open} title="Sign in" onClose={() => setOpen(false)}>
          <LoginForm onSuccess={() => setOpen(false)} />
        </Modal>
      </>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-farm-700 text-sm font-semibold text-white"
        title={email ?? "Signed in"}
      >
        {avatarLabel}
      </div>
      <span className="hidden max-w-[180px] truncate text-sm text-zinc-600 sm:inline">
        {email}
      </span>
      <Button
        variant="ghost"
        onClick={() => {
          if (!supabase) return
          supabase.auth.signOut()
        }}
      >
        Sign out
      </Button>
    </div>
  )
}
