import { Router } from 'express'
import { askClaude } from '../lib/claude.js'

const router = Router()
const ITEM_COUNT = 24

/**
 * POST /api/generate
 * Body: { season: string, theme: string }
 * Response: { items: string[] }
 */
router.post('/', async (req, res) => {
  const { season, theme } = req.body

  if (!season || !theme) {
    return res.status(400).json({ error: 'season と theme は必須です' })
  }

  const prompt = `あなたはおさんぽビンゴゲームのコンテンツ作成者です。
テーマ「${theme}」の場所を、${season}の季節におさんぽしながら
見つけられる・体験できるもの・こと を${ITEM_COUNT}個考えてください。
子供から大人まで楽しめる、かわいくて具体的な内容にしてください。バリエーション豊かに。
テーマに合わないものは含めないでください。

以下のJSON形式のみで返答してください（説明文・Markdownコードブロック不要）：
{"items":["item1","item2",...,"item${ITEM_COUNT}"]}

各itemは絵文字1つ＋短い日本語テキスト（例: "🌸 桜の花びら"）にしてください。テキストは10文字以内で。`

  try {
    const data = await askClaude(prompt, 1400)
    if (!Array.isArray(data.items)) throw new Error('items が配列ではありません')
    res.json({ items: data.items.slice(0, ITEM_COUNT) })
  } catch (e) {
    console.error('[generate]', e.message)
    res.status(500).json({ error: e.message })
  }
})

export default router
