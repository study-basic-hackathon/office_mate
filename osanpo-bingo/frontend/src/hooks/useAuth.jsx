/**
 * hooks/useAuth.js
 * 認証状態を管理する Context + Hook
 *
 * 使い方:
 *   const { user, loading } = useAuth()
 *   user.id  → Supabase が発行した UUID（匿名でも必ず存在する）
 */
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ensureAnonymousSession } from '../lib/auth'

// ── Context ────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ── Provider（App.jsx でアプリ全体をラップする）────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)   // 初期化完了まで true

  useEffect(() => {
    // 1. アプリ起動時に匿名セッションを確立
    ensureAnonymousSession()
      .then(u => setUser(u))
      .catch(e => console.error('[Auth]', e))
      .finally(() => setLoading(false))

    // 2. セッション変化を監視（ページリロード・タブ復帰など）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth は AuthProvider の内側で使ってください')
  return ctx
}
