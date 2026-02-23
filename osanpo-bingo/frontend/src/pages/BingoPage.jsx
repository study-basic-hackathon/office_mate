/**
 * pages/BingoPage.jsx
 * markFound に user.id を渡すよう更新
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth }   from '../hooks/useAuth'
import { useRoom }   from '../hooks/useRoom'
import { usePhoto }  from '../hooks/usePhoto'
import { regenerateItem } from '../lib/api'
import { checkBingo, cellToItem, ITEM_COUNT, FREE_INDEX, SEASON_EMOJI } from '../lib/bingo'
import BingoGrid  from '../components/BingoGrid'
import PhotoModal from '../components/PhotoModal'

const LAST_ROOM_KEY = 'osanpo-last-room'

export default function BingoPage() {
  const { code }   = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuth()   // ← 匿名ユーザーの情報を取得

  const { room, loading, error, markFound, replaceItem } = useRoom(code)
  const { uploadPhoto, uploading } = usePhoto()

  const [openCell,     setOpenCell]     = useState(null)
  const [regenLoading, setRegenLoading] = useState(false)
  const [spinCells,    setSpinCells]    = useState(new Set())
  const [toast,        setToast]        = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200) }

  if (loading) return <div className="page"><div className="loading-screen"><div className="loader"/></div></div>
  if (error)   return <div className="page"><p>エラー: {error}</p></div>
  if (!room)   return <div className="page"><p>ルームが見つかりません</p></div>

  const foundCells = room.found_cells ?? [FREE_INDEX]
  const bingoLines = checkBingo(foundCells)
  const foundCount = foundCells.filter(c => c !== FREE_INDEX).length

  // ── みつけた確定 ──────────────────────────────────────────────────
  const handleConfirm = async (file) => {
    try {
      let photoUrl = null
      if (file) {
        photoUrl = await uploadPhoto(file, code, openCell)
      }

      // user.id を渡す → コレクション保存時に user_id として使われる
      await markFound(openCell, photoUrl, user?.id)

      try {
        const saved = JSON.parse(localStorage.getItem(LAST_ROOM_KEY) ?? '{}')
        if (saved.code === code) {
          saved.foundCount = foundCount + 1
          localStorage.setItem(LAST_ROOM_KEY, JSON.stringify(saved))
        }
      } catch {}

      setOpenCell(null)
      showToast('みつけた！ ✓')
    } catch (e) {
      alert('保存に失敗しました: ' + e.message)
    }
  }

  // ── 1マス再生成 ───────────────────────────────────────────────────
  const handleRegen = async () => {
    setRegenLoading(true)
    try {
      const newItem = await regenerateItem(room.season, room.theme, room.items)
      const itemIdx = cellToItem(openCell)
      await replaceItem(itemIdx, newItem)

      setSpinCells(s => new Set([...s, openCell]))
      setTimeout(() => setSpinCells(s => { const n = new Set(s); n.delete(openCell); return n }), 600)

      showToast('新しい項目に変えました！')
    } catch (e) {
      alert('再生成に失敗しました: ' + e.message)
    } finally {
      setRegenLoading(false)
    }
  }

  const handleFinish = () => {
    localStorage.removeItem(LAST_ROOM_KEY)
    navigate('/')
  }

  return (
    <div className="page">
      <div className="bingo-header">
        <div className="room-code-badge">
          🏠 <strong>{code}</strong>
          <button className="copy-btn"
            onClick={() => { navigator.clipboard?.writeText(code); showToast('コピーしました！') }}>
            📋
          </button>
        </div>
        <div className="bingo-info">{foundCount} / {ITEM_COUNT}</div>
      </div>

      {(room.season || room.theme) && (
        <div>
          <span className="theme-tag">
            {SEASON_EMOJI[room.season]} {room.season}
            {room.theme && <> · {room.theme}</>}
          </span>
        </div>
      )}

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(foundCount / ITEM_COUNT) * 100}%` }} />
      </div>

      {bingoLines.length > 0 && (
        <div className="bingo-banner">🎉 {bingoLines.length}ライン ビンゴ！おめでとう！</div>
      )}

      <BingoGrid
        items={room.items ?? []}
        foundCells={foundCells}
        photos={room.photos ?? {}}
        bingoLines={bingoLines}
        spinCells={spinCells}
        onCellClick={(ci) => !foundCells.includes(ci) && setOpenCell(ci)}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/')}>
          🏠 ホーム
        </button>
        <button className="btn btn-danger" style={{ flex: '0 0 90px' }} onClick={handleFinish}>
          終了する
        </button>
      </div>

      {openCell !== null && (
        <PhotoModal
          item={room.items[cellToItem(openCell)] ?? ''}
          regenLoading={regenLoading || uploading}
          onConfirm={handleConfirm}
          onRegen={handleRegen}
          onClose={() => setOpenCell(null)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
