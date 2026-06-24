import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken, isLoggedIn } from '../lib/api'
import GoogleLogin from '../components/GoogleLogin'
import GitHubLogin from '../components/GitHubLogin'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (isLoggedIn()) navigate('/app')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.auth.register({ email, password, name })
      setToken(res.access_token)
      navigate('/app')
    } catch (err: any) {
      setError(err.message || 'Error al registrarse')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 text-xl font-bold text-brand-600 mb-8">
          CleanPC
        </Link>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-2xl font-bold text-center">Crear Cuenta</h2>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <button type="submit" className="w-full py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium">
            Registrarse
          </button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-400">o</span></div>
          </div>
          <GitHubLogin />
          <div className="mt-3">
            <GoogleLogin />
          </div>
          <p className="text-sm text-gray-500 text-center">
            ¿Ya tienes cuenta? <Link to="/login" className="text-brand-600 hover:underline">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
