/**
 * lib/auth.js
 * Supabase 匿名認証ヘルパー
 *
 * 匿名認証の流れ:
 *   1. アプリ起動時に signInAnonymously() を呼ぶ
 *   2. Supabase が自動で UUID（user.id）を発行してセッションを保持
 *   3. 同じブラウザで再訪問すると、同じ user.id が返ってくる
 *   4. RLS で user_id = auth.uid() の行だけ読み書きできる
 */
import { supabase } from './supabase'

/**
 * 匿名ログイン（すでにセッションがあればそのまま返す）
 * @returns {Promise<import('@supabase/supabase-js').User>}
 */
export async function ensureAnonymousSession() {
  // 既存セッションを確認
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    return session.user   // すでにログイン済み（匿名 or 本登録）
  }

  // 未ログインなら匿名ログイン
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw new Error(`匿名ログインに失敗しました: ${error.message}`)

  return data.user
}

/**
 * 現在のユーザーを取得（未ログインなら null）
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
