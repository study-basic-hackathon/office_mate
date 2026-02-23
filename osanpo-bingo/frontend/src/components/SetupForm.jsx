import { useState } from 'react'
import { SEASONS, THEMES, detectSeason } from '../lib/bingo'

/**
 * SetupForm
 * 季節・テーマ選択フォーム
 * @param {Function} onSubmit - ({ season, theme }) => void
 * @param {boolean}  loading
 */
export default function SetupForm({ onSubmit, loading }) {
  const [selectedSeason, setSelectedSeason] = useState('auto')
  const [selectedTheme,  setSelectedTheme]  = useState('どこでも')
  const [customTheme,    setCustomTheme]     = useState('')

  const resolvedSeason = selectedSeason === 'auto' ? detectSeason() : selectedSeason

  const handleSubmit = () => {
    if (selectedTheme === 'カスタム' && !customTheme.trim()) return
    const theme = selectedTheme === 'カスタム' ? customTheme.trim() : selectedTheme
    onSubmit({ season: resolvedSeason, theme })
  }

  return (
    <div className="card-box">
      <h3>🌱 新しくはじめる</h3>

      {/* 季節 */}
      <div className="setup-label">季節</div>
      <div className="chip-row">
        {SEASONS.map(s => (
          <button
            key={s.id}
            className={`chip ${selectedSeason === s.id ? 'selected' : ''}`}
            onClick={() => setSelectedSeason(s.id)}
          >
            {s.emoji} {s.label}
            {s.id === 'auto' && (
              <span className="chip-sub">（{detectSeason()}）</span>
            )}
          </button>
        ))}
      </div>

      {/* テーマ */}
      <div className="setup-label">テーマ</div>
      <div className="theme-grid">
        {THEMES.map(t => (
          <div
            key={t.id}
            className={`theme-card ${selectedTheme === t.id ? 'selected' : ''}`}
            onClick={() => setSelectedTheme(t.id)}
          >
            <div className="theme-card-emoji">{t.emoji}</div>
            <div className="theme-card-label">{t.label}</div>
            <div className="theme-card-desc">{t.desc}</div>
          </div>
        ))}
      </div>

      {/* カスタム入力 */}
      {selectedTheme === 'カスタム' && (
        <input
          className="input"
          placeholder="例：動物園、神社、キャンプ場…"
          value={customTheme}
          onChange={e => setCustomTheme(e.target.value)}
          style={{ marginBottom: 14 }}
        />
      )}

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading || (selectedTheme === 'カスタム' && !customTheme.trim())}
      >
        {loading
          ? 'AIが考えています…'
          : `${resolvedSeason}・${selectedTheme === 'カスタム' ? customTheme || 'カスタム' : selectedTheme} でビンゴを作る ✨`}
      </button>
    </div>
  )
}
