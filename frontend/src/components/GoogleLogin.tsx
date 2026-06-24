import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setToken } from '../lib/api'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (resp: { credential: string }) => void }) => void
          renderButton: (el: HTMLElement, opts: { theme: string; size: string; width: number }) => void
        }
      }
    }
  }
}

export default function GoogleLogin() {
  const navigate = useNavigate()
  const btnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const res = await api.auth.google(response.credential)
            setToken(res.access_token)
            navigate('/app')
          } catch (err: any) {
            alert(err.message || 'Error al iniciar sesión con Google')
          }
        },
      })
      if (btnRef.current) {
        window.google?.accounts.id.renderButton(btnRef.current, {
          theme: 'outline',
          size: 'large',
          width: btnRef.current.clientWidth || 320,
        })
      }
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [navigate])

  return <div ref={btnRef} className="w-full flex justify-center"></div>
}
