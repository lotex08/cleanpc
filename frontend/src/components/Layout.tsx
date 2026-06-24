import { Outlet, Link, useNavigate } from 'react-router-dom'
import { clearToken } from '../lib/api'

export default function Layout() {
  const navigate = useNavigate()

  const logout = () => {
    clearToken()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-2 text-xl font-bold text-brand-600">
            <svg className="w-7 h-7" viewBox="0 0 100 100">
              <rect width="100" height="100" rx="20" fill="url(#g)"/>
              <path d="M30 65 L30 35 Q30 30 35 30 L50 30 L65 30 Q70 30 70 35 L70 65 Q70 70 65 70 L35 70 Q30 70 30 65Z" fill="none" stroke="white" stroke-width="3"/>
              <circle cx="50" cy="50" r="12" fill="none" stroke="white" stroke-width="2"/>
              <circle cx="50" cy="50" r="5" fill="white"/>
            </svg>
            CleanPC
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Planes</Link>
            <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">Salir</button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
