import Anthropic from '@anthropic-ai/sdk'

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY が設定されていません (.env を確認してください)')
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Claude にプロンプトを投げ、JSON レスポンスをパースして返す
 * @param {string} prompt
 * @param {number} maxTokens
 * @returns {Promise<any>}
 */
export async function askClaude(prompt, maxTokens = 1400) {
  const msg = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',  // 軽量モデル（コスト最小）
    max_tokens: maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  })

  const text  = msg.content.map(b => b.text ?? '').join('')
  const clean = text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    throw new Error(`AI のレスポンスが JSON ではありませんでした:\n${clean}`)
  }
}
