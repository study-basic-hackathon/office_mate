/**
 * バックエンド API（Render 上の Express サーバー）を叩くヘルパー
 */
const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

/**
 * 季節・テーマから24項目を生成する
 * @param {string} season  - 春 / 夏 / 秋 / 冬
 * @param {string} theme   - どこでも / 自然 / 街並み … カスタム文字列
 * @returns {Promise<string[]>} items - 24個の文字列配列
 */
export async function generateItems(season, theme) {
  const res = await fetch(`${BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ season, theme }),
  })
  if (!res.ok) throw new Error(`生成に失敗しました: ${res.status}`)
  const data = await res.json()
  return data.items          // string[]
}

/**
 * 特定のセルだけ再生成する
 * @param {string}   season
 * @param {string}   theme
 * @param {string[]} existingItems - 既存24項目（重複防止に使う）
 * @returns {Promise<string>} 新しい1項目
 */
export async function regenerateItem(season, theme, existingItems) {
  const res = await fetch(`${BASE}/api/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ season, theme, existingItems }),
  })
  if (!res.ok) throw new Error(`再生成に失敗しました: ${res.status}`)
  const data = await res.json()
  return data.item           // string
}
