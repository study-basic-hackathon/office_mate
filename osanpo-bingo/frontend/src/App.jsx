/**
 * App.jsx
 * AuthProvider でアプリ全体をラップする
 * 匿名ログインが完了するまでローディングを表示
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Header         from './components/Header'
import HomePage       from './pages/HomePage'
import BingoPage      from './pages/BingoPage'
import CollectionPage from './pages/CollectionPage'

// ── 認証完了後にルーティングを開始する内部コンポーネント ──────────────
function AuthenticatedApp() {
  const { loading } = useAuth()

  // 匿名ログイン処理が終わるまでスピナーを表示
  // （通常は 1 秒以内に完了する）
  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: '100vh' }}>
        <div className="loader" />
        <p className="loading-text">読み込み中</p>
      </div>
    )
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/bingo/:code" element={<BingoPage />} />
        <Route path="/collection"  element={<CollectionPage />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

// ── App ルート ────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <AuthenticatedApp />
      </div>
    </AuthProvider>
  )
}
