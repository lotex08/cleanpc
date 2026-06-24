import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { isLoggedIn } from '../lib/api'

const PLATFORMS: Record<string, { name: string; ext: string; icon: string }> = {
  linux: { name: 'Linux', ext: '.AppImage', icon: '🐧' },
  windows: { name: 'Windows', ext: '.exe', icon: '🪟' },
  mac: { name: 'macOS', ext: '.dmg', icon: '🍎' },
}

function downloadUrl(os: string): string {
  return `https://github.com/lotex08/cleanpc/releases/latest/download/CleanPC-1.0.0.AppImage`
}

export default function Landing() {
  const [platform, setPlatform] = useState('linux')

  useEffect(() => {
    const ua = navigator.userAgent
    if (ua.includes('Windows')) setPlatform('windows')
    else if (ua.includes('Mac')) setPlatform('mac')
    else setPlatform('linux')
  }, [])

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-xl font-bold text-brand-600">
          <svg className="w-7 h-7" viewBox="0 0 100 100">
            <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#0284c7"/>
            </linearGradient></defs>
            <rect width="100" height="100" rx="20" fill="url(#g)"/>
            <path d="M30 65 L30 35 Q30 30 35 30 L50 30 L65 30 Q70 30 70 35 L70 65 Q70 70 65 70 L35 70 Q30 70 30 65Z" fill="none" stroke="white" stroke-width="3"/>
            <circle cx="50" cy="50" r="12" fill="none" stroke="white" stroke-width="2"/>
            <circle cx="50" cy="50" r="5" fill="white"/>
          </svg>
          CleanPC
        </div>
        <div className="flex gap-3">
          <Link to="/pricing" className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">Planes</Link>
          {isLoggedIn() ? (
            <Link to="/app" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium">Iniciar Sesión</Link>
              <Link to="/register" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Tu PC más <span className="text-brand-600">limpio</span> y <span className="text-brand-600">organizado</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-6">
          Escanea tu computadora, encuentra archivos duplicados, basura, y libera espacio. App nativa para Windows, macOS y Linux.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {Object.entries(PLATFORMS).map(([key, p]) => (
            <a
              key={key}
              href={downloadUrl(key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-lg font-medium transition-colors ${
                platform === key
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{p.icon}</span>
              {p.name}
            </a>
          ))}
        </div>
        <p className="text-sm text-gray-400">Gratis · Escaneos ilimitados · Sin registro necesario para descargar</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        {[
          { title: 'Escanea', desc: 'Analiza carpetas enteras en segundos. Descubre qué está ocupando espacio.', icon: '🔍', color: 'from-brand-400 to-brand-600' },
          { title: 'Encuentra Duplicados', desc: 'Archivos repetidos que ocupan espacio innecesario. Los identificamos por nombre y tamaño.', icon: '📋', color: 'from-green-400 to-green-600' },
          { title: 'Libera Espacio', desc: 'Con los resultados, decide qué borrar y recupera GB de almacenamiento.', icon: '💾', color: 'from-purple-400 to-purple-600' },
        ].map((f, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} text-white text-2xl mb-4`}>
              {f.icon}
            </div>
            <h3 className="text-lg font-bold mb-2">{f.title}</h3>
            <p className="text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Así funciona</h2>
        <div className="space-y-6">
          {[
            { step: '1', title: 'Descarga la app', desc: 'Elige tu plataforma y descarga CleanPC. No necesita instalación complicada.' },
            { step: '2', title: 'Escanea tu PC', desc: 'Selecciona la carpeta que quieras analizar (Descargas, Escritorio, todo el disco).' },
            { step: '3', title: 'Revisa resultados', desc: 'Ve gráficas de espacio, archivos duplicados, archivos grandes y viejos.' },
            { step: '4', title: 'Limpia y organiza', desc: 'Decide qué borrar y libera espacio. CleanPC te muestra todo para que decidas.' },
          ].map(s => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">{s.step}</div>
              <div>
                <h3 className="font-bold">{s.title}</h3>
                <p className="text-gray-500">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-200">
        CleanPC &mdash; Mantén tu PC organizada &middot; <Link to="/pricing" className="hover:text-gray-600">Planes</Link>
      </footer>
    </div>
  )
}
