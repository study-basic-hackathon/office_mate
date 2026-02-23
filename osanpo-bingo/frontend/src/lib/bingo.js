// ── Grid ──────────────────────────────────────────────────────────────
export const GRID_SIZE   = 5
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE          // 25
export const FREE_INDEX  = Math.floor(TOTAL_CELLS / 2)    // 12 (中央)
export const ITEM_COUNT  = TOTAL_CELLS - 1                // 24

// ── Season ────────────────────────────────────────────────────────────
export const SEASONS = [
  { id: 'auto', label: '自動', emoji: '📅' },
  { id: '春',   label: '春',   emoji: '🌸' },
  { id: '夏',   label: '夏',   emoji: '☀️' },
  { id: '秋',   label: '秋',   emoji: '🍂' },
  { id: '冬',   label: '冬',   emoji: '❄️' },
]

export const SEASON_EMOJI = { 春:'🌸', 夏:'☀️', 秋:'🍂', 冬:'❄️' }

export function detectSeason() {
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5) return '春'
  if (m >= 6 && m <= 8) return '夏'
  if (m >= 9 && m <= 11) return '秋'
  return '冬'
}

// ── Theme ─────────────────────────────────────────────────────────────
export const THEMES = [
  { id: 'どこでも', label: 'どこでも', emoji: '🗺️', desc: '場所を問わず' },
  { id: '自然',     label: '自然',     emoji: '🌿', desc: '公園・森・川' },
  { id: '街並み',   label: '街並み',   emoji: '🏙️', desc: '街・路地・建物' },
  { id: '商店街',   label: '商店街',   emoji: '🏪', desc: 'お店・看板・人' },
  { id: '海辺',     label: '海辺',     emoji: '🌊', desc: '海・砂浜・港' },
  { id: '住宅街',   label: '住宅街',   emoji: '🏠', desc: '路地・庭先・猫' },
  { id: '田舎',     label: '田舎',     emoji: '🌾', desc: '田畑・農村・里山' },
  { id: 'カスタム', label: 'カスタム', emoji: '✏️', desc: '自由に入力' },
]

// ── Index conversion ──────────────────────────────────────────────────
/** セルインデックス → 項目配列インデックス（FREE_INDEX は -1）*/
export function cellToItem(cellIndex) {
  if (cellIndex === FREE_INDEX) return -1
  return cellIndex < FREE_INDEX ? cellIndex : cellIndex - 1
}

/** 項目配列インデックス → セルインデックス */
export function itemToCell(itemIndex) {
  return itemIndex < FREE_INDEX ? itemIndex : itemIndex + 1
}

// ── Bingo check ───────────────────────────────────────────────────────
/**
 * @param {number[]} foundCells - 開いているセルインデックスの配列
 * @returns {number[][]} - ビンゴになったライン（セルインデックス配列）のリスト
 */
export function checkBingo(foundCells) {
  const N = GRID_SIZE
  const lines = []
  // 横
  for (let r = 0; r < N; r++) lines.push(Array.from({length:N}, (_,c) => r*N+c))
  // 縦
  for (let c = 0; c < N; c++) lines.push(Array.from({length:N}, (_,r) => r*N+c))
  // 斜め
  lines.push(Array.from({length:N}, (_,i) => i*N+i))
  lines.push(Array.from({length:N}, (_,i) => i*N+(N-1-i)))
  return lines.filter(line => line.every(c => foundCells.includes(c)))
}

// ── Misc ──────────────────────────────────────────────────────────────
export function generateRoomCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase()
}

/** 絵文字とテキストをパース: "🌸 桜の花びら" → { emoji, text } */
export function parseItem(item = '') {
  const m = item.match(/^(\S+)\s(.+)$/)
  return m ? { emoji: m[1], text: m[2] } : { emoji: '🔍', text: item }
}
