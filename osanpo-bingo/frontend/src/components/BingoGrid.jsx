import { TOTAL_CELLS, FREE_INDEX, cellToItem, parseItem } from '../lib/bingo'

/**
 * BingoGrid
 * @param {string[]}  items       - 24項目の配列
 * @param {number[]}  foundCells  - 開いているセルインデックス
 * @param {Object}    photos      - { [cellIndex]: URL }
 * @param {number[][]}bingoLines  - ビンゴになったライン
 * @param {Set<number>}spinCells  - スピンアニメーション中のセル
 * @param {Function}  onCellClick - (cellIndex) => void
 */
export default function BingoGrid({ items, foundCells, photos, bingoLines, spinCells = new Set(), onCellClick }) {
  const cellInBingo = (ci) => bingoLines.some(l => l.includes(ci))

  return (
    <div className="grid5">
      {Array.from({ length: TOTAL_CELLS }, (_, ci) => {
        const isFree    = ci === FREE_INDEX
        const isFound   = foundCells.includes(ci)
        const inBingo   = cellInBingo(ci)
        const isSpining = spinCells.has(ci)

        if (isFree) {
          return (
            <div key={ci} className={`cell free-cell ${inBingo ? 'in-bingo' : ''}`}>
              <span className="cell-emoji">⭐</span>
              <span className="cell-text">FREE</span>
            </div>
          )
        }

        const item  = items[cellToItem(ci)] ?? ''
        const { emoji, text } = parseItem(item)

        return (
          <div
            key={ci}
            className={[
              'cell',
              isFound   ? 'found'   : '',
              inBingo   ? 'in-bingo': '',
              isSpining ? 'spinning': '',
            ].join(' ')}
            onClick={() => !isFound && onCellClick(ci)}
          >
            {isFound && photos[ci] && (
              <img src={photos[ci]} className="cell-photo" alt="" />
            )}
            {isFound && <div className="cell-check">✓</div>}
            <span className="cell-emoji">{emoji}</span>
            <span className="cell-text">{text}</span>
          </div>
        )
      })}
    </div>
  )
}
