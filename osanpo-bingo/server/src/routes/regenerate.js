import { Router } from 'express'
import { askClaude } from '../lib/claude.js'

const router = Router()

/**
 * POST /api/regenerate
 * Body: { season: string, theme: string, existingItems: string[] }
 * Response: { item: string }
 */
router.post('/', async (req, res) => {
  const { season, theme, existingItems } = req.body

  if (!season || !theme || !Array.isArray(existingItems)) {
    return res.status(400).json({ error: 'season, theme, existingItems は必須です' })
  }

  const existing = existingItems.map(i => `"${i}"`).join(', ')

  const prompt = `あなたはおさんぽビンゴゲームのコンテンツ作成者です。
テーマ「${theme}」・${season}のおさんぽビンゴ用に、
以下のリストに含まれていない新しい項目を1つだけ考えてください。
既存リスト: [${existing}]

以下のJSON形式のみで返答してください（説明文不要）：
{"item":"絵文字 テキスト"}

絵文字1つ＋短い日本語テキスト（10文字以内）。テーマから外れないこと。`

  try {
    const data = await askClaude(prompt, 200)
    if (!data.item) throw new Error('item が返ってきませんでした')
    res.json({ item: data.item })
  } catch (e) {
    console.error('[regenerate]', e.message)
    res.status(500).json({ error: e.message })
  }
})

export default router
