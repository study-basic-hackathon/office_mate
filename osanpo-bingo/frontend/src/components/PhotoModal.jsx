import { useState, useRef } from 'react'

/**
 * PhotoModal
 * マスをタップしたときの確認モーダル（写真撮影 + 再生成）
 *
 * @param {string}   item         - 現在の項目テキスト
 * @param {boolean}  regenLoading - 再生成中フラグ
 * @param {Function} onConfirm    - (file: File|null) => void
 * @param {Function} onRegen      - () => void
 * @param {Function} onClose      - () => void
 */
export default function PhotoModal({ item, regenLoading, onConfirm, onRegen, onClose }) {
  const [preview, setPreview] = useState(null)
  const [file,    setFile]    = useState(null)
  const fileRef = useRef()

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    e.target.value = ''
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{item}</h3>
        <p className="modal-sub">みつけた！写真を撮って記録しよう 📸</p>

        {preview ? (
          <img src={preview} className="photo-preview" alt="preview" />
        ) : (
          <label className="photo-upload">
            <span>📷</span>
            写真を撮る・選ぶ（任意）
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
            />
          </label>
        )}

        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onClose}>キャンセル</button>
          {preview && (
            <button
              className="btn btn-cancel"
              style={{ flex: '0 0 auto', padding: '13px 10px', fontSize: 12 }}
              onClick={() => { setPreview(null); setFile(null) }}>
              撮り直す
            </button>
          )}
          <button className="btn btn-primary" onClick={() => onConfirm(file)}>
            ✓ みつけた！
          </button>
        </div>

        {/* ── 再生成 ── */}
        <div className="modal-sep" />
        <div className="regen-row">
          <div className="regen-label">
            この地域では見つからない？<br />AIに別の項目を考えてもらおう
          </div>
          <button
            className={`btn-regen ${regenLoading ? 'regen-spinning' : ''}`}
            onClick={onRegen}
            disabled={regenLoading}>
            {regenLoading ? '考え中…' : '🔄 変える'}
          </button>
        </div>
      </div>
    </div>
  )
}
