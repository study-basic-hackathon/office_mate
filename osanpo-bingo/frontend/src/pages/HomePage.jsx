/**
 * pages/HomePage.jsx
 * ルーム作成時に owner_id（user.id）を付与するよう更新
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase }    from '../lib/supabase'
import { generateItems } from '../lib/api'
import { useAuth }     from '../hooks/useAuth'
import { generateRoomCode, FREE_INDEX, ITEM_COUNT, SEASON_EMOJI } from '../lib/bingo'
import SetupForm from '../components/SetupForm'

const LAST_ROOM_KEY = 'osanpo-last-room'

export default function HomePage() {
  const navigate   = useNavigate()
  const { user }   = useAuth()   // ← 匿名ユーザー情報

  const [creating,  setCreating]  = useState(false)
  const [joining,   setJoining]   = useState(false)
  const [joinCode,  setJoinCode]  = useState('')
  const [joinError, setJoinError] = useState('')
  const [lastRoom,  setLastRoom]  = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem(LAST_ROOM_KEY)
    if (saved) {
      try { setLastRoom(JSON.parse(saved)) } catch {}
    }
  }, [])

  // ── 新しいゲームを作成 ────────────────────────────────────────────
  const handleCreate = async ({ season, theme }) => {
    setCreating(true)
    try {
      const items = await generateItems(season, theme)
      const code  = generateRoomCode()

      const { error } = await supabase.from('rooms').insert({
        code,
        items,
        found_cells: [FREE_INDEX],
        photos:      {},
        season,
        theme,
        owner_id: user?.id ?? null,   // ← 作成者として記録
      })
      if (error) throw error

      const meta = { code, season, theme, foundCount: 0 }
      localStorage.setItem(LAST_ROOM_KEY, JSON.stringify(meta))
      navigate(`/bingo/${code}`)
    } catch (e) {
      console.error(e)
      alert('ビンゴの作成に失敗しました: ' + e.message)
    } finally {
      setCreating(false)
    }
  }

  // ── ルームに参加 ──────────────────────────────────────────────────
  const handleJoin = async () => {
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinError('')
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('code')
        .eq('code', joinCode.toUpperCase())
        .single()

      if (error || !data) {
        setJoinError('ルームが見つかりません')
        return
      }
      navigate(`/bingo/${data.code}`)
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="page">
      <div className="home-hero">
        <span className="home-icon">🚶</span>
        <h1 className="home-title">おさんぽビンゴ</h1>
        <p className="home-sub">季節とテーマを選んで<br />AIがビンゴカードを作ります</p>
      </div>

      {lastRoom && (
        <div className="card-box resume-card">
          <h3>🔖 前回のビンゴを続ける</h3>
          <p className="resume-progress">
            {SEASON_EMOJI[lastRoom.season]} {lastRoom.season} · {lastRoom.theme}
            {' '}&nbsp;—&nbsp;
            {lastRoom.foundCount} / {ITEM_COUNT} みつけた
          </p>
          <button className="btn btn-resume" onClick={() => navigate(`/bingo/${lastRoom.code}`)}>
            ▶ 続きをする
          </button>
        </div>
      )}

      <SetupForm onSubmit={handleCreate} loading={creating} />

      <div className="card-box">
        <h3>👥 ルームに参加する</h3>
        <input
          className="input input-join"
          placeholder="ルームコードを入力"
          value={joinCode}
          onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError('') }}
          maxLength={5}
        />
        {joinError && <p className="error-text">{joinError}</p>}
        <button className="btn btn-secondary" onClick={handleJoin} disabled={joining || !joinCode}>
          {joining ? '接続中…' : '参加する →'}
        </button>
      </div>
    </div>
  )
}
