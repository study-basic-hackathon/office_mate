/**
 * hooks/useRoom.js
 * ルームデータの取得・更新・Realtime 購読
 * コレクション保存時に user_id を付与するよう更新
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { checkBingo, FREE_INDEX } from '../lib/bingo'

export function useRoom(code) {
  const [room,    setRoom]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // ── 初回ロード ────────────────────────────────────────────────────
  useEffect(() => {
    if (!code) return
    setLoading(true)

    supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else       setRoom(data)
        setLoading(false)
      })
  }, [code])

  // ── Realtime 購読 ─────────────────────────────────────────────────
  useEffect(() => {
    if (!code) return

    const channel = supabase
      .channel(`room-${code}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${code}` },
        (payload) => setRoom(payload.new)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [code])

  // ── セルを「みつけた」にする ──────────────────────────────────────
  /**
   * @param {number} cellIndex
   * @param {string|null} photoUrl
   * @param {string} userId  ← useAuth() から渡す
   */
  const markFound = useCallback(async (cellIndex, photoUrl, userId) => {
    if (!room) return

    const newFoundCells = [...(room.found_cells ?? []), cellIndex]
    const newPhotos     = photoUrl
      ? { ...(room.photos ?? {}), [cellIndex]: photoUrl }
      : room.photos

    const { data, error } = await supabase
      .from('rooms')
      .update({ found_cells: newFoundCells, photos: newPhotos })
      .eq('code', code)
      .select()
      .single()

    if (error) throw error

    // ビンゴ達成時だけコレクションに保存
    const bingoLines = checkBingo(newFoundCells)
    const prevLines  = checkBingo(room.found_cells ?? [FREE_INDEX])
    if (bingoLines.length > prevLines.length && userId) {
      await saveToCollection(data, userId)   // ← user_id を渡す
    }

    return data
  }, [room, code])

  // ── 項目を1つ差し替える（再生成）────────────────────────────────
  const replaceItem = useCallback(async (itemIndex, newItem) => {
    if (!room) return

    const newItems = [...room.items]
    newItems[itemIndex] = newItem

    const { data, error } = await supabase
      .from('rooms')
      .update({ items: newItems })
      .eq('code', code)
      .select()
      .single()

    if (error) throw error
    return data
  }, [room, code])

  return { room, loading, error, markFound, replaceItem }
}

// ── コレクション保存 ──────────────────────────────────────────────────
async function saveToCollection(room, userId) {
  const bingoLines = checkBingo(room.found_cells ?? [])

  const { error } = await supabase.from('collection').insert({
    user_id:       userId,        // ★ RLS で「自分のデータ」と判定するキー
    room_id:       room.id,
    room_snapshot: room,
    bingo_count:   bingoLines.length,
  })

  if (error) console.error('[collection] 保存失敗:', error.message)
}
