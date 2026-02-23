/**
 * pages/CollectionPage.jsx
 * RLS により自動的に自分のコレクションだけ取得される
 * （user_id = auth.uid() のフィルタは DB 側で行われる）
 */
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { TOTAL_CELLS, FREE_INDEX, cellToItem, SEASON_EMOJI } from '../lib/bingo'
import { useAuth } from '../hooks/useAuth'

export default function CollectionPage() {
  const { user }                    = useAuth()
  const [cards,   setCards]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [detail,  setDetail]        = useState(null)

  useEffect(() => {
    // user がセットされるまで待つ
    if (!user) return

    // RLS が "user_id = auth.uid()" で自動フィルタしてくれる
    // → 自分のコレクションだけ返ってくる
    supabase
      .from('collection')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error)
        setCards(data ?? [])
        setLoading(false)
      })
  }, [user])

  if (loading) {
    return (
      <div className="page">
        <div className="loading-screen">
          <div className="loader" />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h2 style={{ fontFamily: "'Kaisei Opti', serif", fontSize: 18, marginBottom: 16, color: '#3d7a52' }}>
        📚 コレクション
      </h2>

      {cards.length === 0 ? (
        <div className="collection-empty">
          <span>📭</span>
          <p>まだコレクションがありません。<br />ビンゴを達成すると自動的に保存されます！</p>
        </div>
      ) : (
        <div className="collection-grid">
          {cards.map(card => {
            const snap  = card.room_snapshot ?? {}
            const found = snap.found_cells ?? []
            const items = snap.items ?? []
            return (
              <div key={card.id} className="collection-card" onClick={() => setDetail(card)}>
                <div className="cc-preview">
                  {Array.from({ length: TOTAL_CELLS }, (_, ci) => (
                    <div key={ci}
                      className={`cc-cell ${ci === FREE_INDEX ? 'free' : found.includes(ci) ? 'found' : ''}`}>
                      {ci === FREE_INDEX ? '⭐' : (items[cellToItem(ci)]?.match(/^(\S+)/)?.[1] ?? '')}
                    </div>
                  ))}
                </div>
                <div className="cc-info">
                  <div className="cc-season">
                    {SEASON_EMOJI[snap.season]} {snap.season} {snap.theme && `· ${snap.theme}`}
                  </div>
                  <div className="cc-date">
                    {new Date(card.created_at).toLocaleDateString('ja-JP')}
                  </div>
                  <div className="cc-count">🎉 {card.bingo_count}ライン</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 詳細モーダル */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {(() => {
              const snap   = detail.room_snapshot ?? {}
              const found  = snap.found_cells ?? []
              const items  = snap.items ?? []
              const photos = snap.photos ?? {}
              return (
                <>
                  <h3>{SEASON_EMOJI[snap.season]} {snap.season}のおさんぽ</h3>
                  <p className="modal-sub">
                    {snap.theme && <>{snap.theme} · </>}
                    {new Date(detail.created_at).toLocaleDateString('ja-JP')} ·{' '}
                    {detail.bingo_count}ライン
                  </p>
                  <div className="mini-grid5">
                    {Array.from({ length: TOTAL_CELLS }, (_, ci) => {
                      const isFree  = ci === FREE_INDEX
                      const isFound = found.includes(ci)
                      const item    = isFree ? '' : (items[cellToItem(ci)] ?? '')
                      const m       = item.match(/^(\S+)\s(.+)$/)
                      const emoji   = isFree ? '⭐' : (m ? m[1] : '🔍')
                      const text    = isFree ? 'FREE' : (m ? m[2] : item)
                      return (
                        <div key={ci} className={`mini-cell ${isFree ? 'free' : isFound ? 'found' : ''}`}>
                          {!isFree && photos[ci] && <img src={photos[ci]} alt="" />}
                          <span>{emoji}</span>
                          <div>{text}</div>
                        </div>
                      )
                    })}
                  </div>
                  <button className="btn btn-cancel" onClick={() => setDetail(null)}>閉じる</button>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
