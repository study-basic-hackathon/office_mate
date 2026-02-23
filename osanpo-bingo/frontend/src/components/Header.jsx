import { useNavigate, useLocation } from 'react-router-dom'

export default function Header() {
  const navigate  = useNavigate()
  const { pathname } = useLocation()

  const isCollection = pathname === '/collection'
  const isBingo      = pathname.startsWith('/bingo/')

  return (
    <header className="header">
      <div className="header-title" onClick={() => navigate('/')}>
        🌿 おさんぽビンゴ
      </div>
      <nav className="nav">
        <button
          className={`nav-btn ${!isCollection ? 'active' : ''}`}
          onClick={() => navigate(isBingo ? pathname : '/')}>
          ビンゴ
        </button>
        <button
          className={`nav-btn ${isCollection ? 'active' : ''}`}
          onClick={() => navigate('/collection')}>
          コレクション
        </button>
      </nav>
    </header>
  )
}
