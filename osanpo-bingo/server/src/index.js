import 'dotenv/config'
import express from 'express'
import cors    from 'cors'
import generateRouter  from './routes/generate.js'
import regenerateRouter from './routes/regenerate.js'

const app  = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? '*' }))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/generate',   generateRouter)
app.use('/api/regenerate', regenerateRouter)

// ── Health check（Render の死活監視用）───────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`🌿 おさんぽビンゴ API  →  http://localhost:${PORT}`)
})
